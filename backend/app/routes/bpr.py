# backend/app/routes/bpr.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Department, BprDocument, BprNode, BprEdge, BprRisk
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json

bpr_bp = Blueprint('bpr_bp', __name__)

# --- Helpers ---

def format_node(node):
    return {
        "id": node.react_flow_id,
        "db_id": node.id,
        "type": node.type,
        "position": {"x": node.position_x, "y": node.position_y},
        "data": {
            "label": node.label,
            "riskCount": len(node.risks) if node.risks else 0
        },
        # Style config opsional
        "style": json.loads(node.style_config) if node.style_config else {}
    }

def format_edge(edge):
    return {
        "id": edge.react_flow_id,
        "source": edge.source_node_ref,
        "target": edge.target_node_ref,
        "label": edge.label,
        "animated": edge.animated
    }

def format_risk(risk):
    return {
        "id": risk.id,
        "node_id": risk.node_id,
        "risk_code": risk.risk_code,
        "risk_description": risk.risk_description,
        "risk_cause": risk.risk_cause,
        "risk_impact": risk.risk_impact,
        "existing_control": risk.existing_control,
        "control_effectiveness": risk.control_effectiveness,
        "inherent_risk_level": risk.inherent_risk_level,
        "approval_status": risk.approval_status,
        "reviewer_notes": risk.reviewer_notes
    }

# --- Endpoints Dokumen BPR (Header) ---

@bpr_bp.route('/bpr/documents', methods=['POST'])
@jwt_required()
def create_bpr_document():
    """Membuat dokumen BPR baru (Header)."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('department_id'):
        return jsonify({"msg": "Nama proses dan departemen wajib diisi."}), 400

    dept = Department.query.get(data['department_id'])
    if not dept or (user.institution and dept.institution != user.institution):
        return jsonify({"msg": "Departemen tidak valid."}), 403

    new_doc = BprDocument(
        name=data['name'],
        department_id=data['department_id'],
        created_by_id=user.id,
        period=data.get('period', '2025-Q1'),
        status='Draft',
        version=1
    )
    
    db.session.add(new_doc)
    db.session.commit()
    
    return jsonify({
        "msg": "Proses bisnis berhasil dibuat.",
        "id": new_doc.id,
        "name": new_doc.name
    }), 201

@bpr_bp.route('/bpr/documents', methods=['GET'])
@jwt_required()
def get_bpr_documents():
    """Mengambil daftar BPR (bisa difilter per departemen/user)."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    query = BprDocument.query.join(Department).filter(
        Department.institution == user.institution
    )
    
    docs = query.order_by(BprDocument.updated_at.desc()).all()
    
    result = []
    for doc in docs:
        result.append({
            "id": doc.id,
            "name": doc.name,
            "department_name": doc.department.name,
            "status": doc.status,
            "period": doc.period,
            "version": doc.version,
            "updated_at": doc.updated_at.isoformat(),
            "creator_name": doc.creator.nama_lengkap if doc.creator else "Unknown"
        })
        
    return jsonify(result), 200

@bpr_bp.route('/bpr/documents/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_bpr_detail(doc_id):
    """Mengambil detail lengkap (Nodes & Edges) untuk kanvas."""
    doc = BprDocument.query.get_or_404(doc_id)
    
    return jsonify({
        "id": doc.id,
        "name": doc.name,
        "status": doc.status,
        "version": doc.version,
        "nodes": [format_node(n) for n in doc.nodes],
        "edges": [format_edge(e) for e in doc.edges]
    }), 200

@bpr_bp.route('/bpr/documents/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_bpr_document(doc_id):
    """Menghapus dokumen BPR."""
    doc = BprDocument.query.get_or_404(doc_id)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"msg": "Dokumen BPR berhasil dihapus."}), 200

# --- Endpoints Diagram (Save & Sync) ---

@bpr_bp.route('/bpr/documents/<int:doc_id>/save-diagram', methods=['POST'])
@jwt_required()
def save_bpr_diagram(doc_id):
    """
    Menyimpan posisi Node dan Edge dari React Flow.
    Melakukan 'Smart Sync': Update yg ada, Hapus yg hilang, Buat yg baru.
    """
    doc = BprDocument.query.get_or_404(doc_id)
    data = request.get_json()
    
    nodes_data = data.get('nodes', [])
    edges_data = data.get('edges', [])

    # 1. SYNC NODES
    existing_nodes = {n.react_flow_id: n for n in doc.nodes}
    incoming_node_ids = set()

    for n_data in nodes_data:
        rf_id = n_data.get('id')
        incoming_node_ids.add(rf_id)
        
        if rf_id in existing_nodes:
            node = existing_nodes[rf_id]
            node.position_x = n_data['position']['x']
            node.position_y = n_data['position']['y']
            node.label = n_data['data'].get('label', '')
            node.type = n_data.get('type', 'default')
        else:
            # Buat Node Baru
            new_node = BprNode(
                document_id=doc.id,
                react_flow_id=rf_id,
                type=n_data.get('type', 'default'),
                label=n_data['data'].get('label', ''),
                position_x=n_data['position']['x'],
                position_y=n_data['position']['y']
            )
            db.session.add(new_node)

    # Hapus node yang tidak ada lagi di kanvas
    for rf_id, node in existing_nodes.items():
        if rf_id not in incoming_node_ids:
            db.session.delete(node) # Cascade delete risks otomatis via model

    BprEdge.query.filter_by(document_id=doc.id).delete()
    
    # Buat edge baru
    for e_data in edges_data:
        new_edge = BprEdge(
            document_id=doc.id,
            react_flow_id=e_data.get('id'),
            source_node_ref=e_data.get('source'),
            target_node_ref=e_data.get('target'),
            label=e_data.get('label'),
            animated=e_data.get('animated', False)
        )
        db.session.add(new_edge)

    # Update timestamp dokumen
    doc.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({"msg": "Diagram berhasil disimpan."}), 200

# --- Endpoints Risiko pada Node ---

@bpr_bp.route('/bpr/nodes/<string:node_rf_id>/risks', methods=['GET'])
@jwt_required()
def get_node_risks(node_rf_id):
    """Mengambil risiko untuk node tertentu (berdasarkan ID React Flow)."""
    # Kita butuh doc_id untuk memastikan unik, tapi biasanya rf_id unik per sesi.
    # Untuk keamanan lebih baik, kirim db_id node, tapi rf_id lebih mudah dari frontend.
    # Kita cari node berdasarkan rf_id. *Catatan: rf_id mungkin tidak unik antar dokumen beda*
    # Jadi sebaiknya endpoint ini menerima node_db_id atau filter by doc_id juga.
    
    # Alternatif aman: Filter by node_id database (frontend harus kirim db_id)
    # Mari kita asumsikan frontend mengirim DB ID untuk operasi risiko
    return jsonify({"msg": "Gunakan endpoint by DB ID"}), 400

@bpr_bp.route('/bpr/nodes-db/<int:node_db_id>/risks', methods=['GET', 'POST'])
@jwt_required()
def manage_node_risks(node_db_id):
    """CRUD Risiko pada Node spesifik."""
    node = BprNode.query.get_or_404(node_db_id)
    
    if request.method == 'GET':
        risks = [format_risk(r) for r in node.risks]
        return jsonify(risks), 200
        
    if request.method == 'POST':
        data = request.get_json()
        new_risk = BprRisk(
            node_id=node.id,
            risk_description=data.get('risk_description'),
            risk_cause=data.get('risk_cause'),
            risk_impact=data.get('risk_impact'),
            existing_control=data.get('existing_control'),
            inherent_risk_level=data.get('inherent_risk_level'),
            approval_status='Draft'
        )
        db.session.add(new_risk)
        db.session.commit()
        return jsonify({"msg": "Risiko ditambahkan.", "risk": format_risk(new_risk)}), 201

@bpr_bp.route('/bpr/risks/<int:risk_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modify_risk(risk_id):
    risk = BprRisk.query.get_or_404(risk_id)
    
    if request.method == 'DELETE':
        db.session.delete(risk)
        db.session.commit()
        return jsonify({"msg": "Risiko dihapus."}), 200
        
    if request.method == 'PUT':
        data = request.get_json()
        risk.risk_description = data.get('risk_description', risk.risk_description)
        risk.risk_cause = data.get('risk_cause', risk.risk_cause)
        risk.risk_impact = data.get('risk_impact', risk.risk_impact)
        risk.existing_control = data.get('existing_control', risk.existing_control)
        risk.control_effectiveness = data.get('control_effectiveness', risk.control_effectiveness)
        risk.inherent_risk_level = data.get('inherent_risk_level', risk.inherent_risk_level)
        
        # Manajer Risiko Approval
        if 'approval_status' in data:
            risk.approval_status = data['approval_status']
        if 'reviewer_notes' in data:
            risk.reviewer_notes = data['reviewer_notes']
            
        db.session.commit()
        return jsonify({"msg": "Risiko diperbarui."}), 200
    
@bpr_bp.route('/bpr/documents/<int:doc_id>/clone', methods=['POST'])
@jwt_required()
def clone_bpr_document(doc_id):
    """
    Menduplikasi dokumen BPR (Clone & Re-evaluate).
    Menyalin Header, Node, Edge, dan Risiko ke periode/versi baru.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # 1. Ambil Dokumen Sumber
    source_doc = BprDocument.query.get_or_404(doc_id)
    
    data = request.get_json()
    new_period = data.get('period')
    
    if not new_period:
        return jsonify({"msg": "Periode baru wajib diisi."}), 400

    # 2. Buat Dokumen Baru (Header)
    new_doc = BprDocument(
        name=source_doc.name, # Nama sama
        department_id=source_doc.department_id,
        created_by_id=user.id,
        period=new_period,
        version=source_doc.version + 1, # Naikkan versi
        status='Draft', # Reset ke Draft
        parent_document_id=source_doc.id # Link ke parent
    )
    
    db.session.add(new_doc)
    db.session.flush() # Dapatkan ID baru
    
    # 3. Salin Nodes & Risks
    # Kita butuh mapping ID lama -> ID baru untuk referensi Edge nanti? 
    # Tidak perlu untuk edge, karena edge pakai string react_flow_id.
    # Tapi PENTING untuk Risk, karena risk menunjuk ke node_id (integer DB).
    
    old_to_new_node_map = {} 

    for old_node in source_doc.nodes:
        new_node = BprNode(
            document_id=new_doc.id,
            react_flow_id=old_node.react_flow_id, # ID Kanvas tetap sama
            type=old_node.type,
            label=old_node.label,
            position_x=old_node.position_x,
            position_y=old_node.position_y,
            style_config=old_node.style_config
        )
        db.session.add(new_node)
        db.session.flush() # Dapatkan ID node baru
        
        # Salin Risiko untuk Node ini
        for old_risk in old_node.risks:
            new_risk = BprRisk(
                node_id=new_node.id, # Link ke node BARU
                risk_code=old_risk.risk_code,
                risk_description=old_risk.risk_description,
                risk_cause=old_risk.risk_cause,
                risk_impact=old_risk.risk_impact,
                existing_control=old_risk.existing_control,
                control_effectiveness=old_risk.control_effectiveness,
                inherent_risk_level=old_risk.inherent_risk_level,
                residual_risk_level=old_risk.residual_risk_level,
                approval_status='Draft', # Reset approval
                reviewer_notes=None # Reset catatan
            )
            db.session.add(new_risk)

    # 4. Salin Edges
    for old_edge in source_doc.edges:
        new_edge = BprEdge(
            document_id=new_doc.id,
            react_flow_id=old_edge.react_flow_id,
            source_node_ref=old_edge.source_node_ref,
            target_node_ref=old_edge.target_node_ref,
            label=old_edge.label,
            animated=old_edge.animated
        )
        db.session.add(new_edge)

    db.session.commit()
    
    return jsonify({
        "msg": "Proses berhasil dikloning ke periode baru.",
        "new_id": new_doc.id,
        "version": new_doc.version
    }), 201
    
@bpr_bp.route('/bpr/documents/<int:doc_id>/status', methods=['PUT'])
@jwt_required()
def update_bpr_status(doc_id):
    """Mengubah status dokumen BPR (Workflow)."""
    doc = BprDocument.query.get_or_404(doc_id)
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['Draft', 'In Review', 'Final', 'Archived']:
        return jsonify({"msg": "Status tidak valid."}), 400

    doc.status = new_status
    
    # Jika status Final, kita bisa kunci waktu update terakhir
    if new_status == 'Final':
        doc.updated_at = datetime.utcnow()

    db.session.commit()
    return jsonify({"msg": f"Status berhasil diubah menjadi {new_status}."}), 200