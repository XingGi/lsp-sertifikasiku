# backend/app/routes/competency.py
from flask import request, jsonify, Blueprint
from app.models import db, CompetencyTest, CertificationScheme, WorkflowTemplate, WorkflowTask, WorkflowStage
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.routes.auth import admin_required # Pastikan ini terimport dengan benar
from datetime import datetime

competency_bp = Blueprint('competency_bp', __name__)

# ============================================================================
# 1. MONITORING (ADMIN ONLY) - INI YANG BIKIN ERROR 404 KALAU HILANG
# ============================================================================
@competency_bp.route('/competency-tests/monitoring', methods=['GET'])
@admin_required()
def get_monitoring_data():
    # Ambil semua tes, join dengan user dan task
    tests = CompetencyTest.query.order_by(CompetencyTest.updated_at.desc()).all()
    data = []
    for t in tests:
        # Ambil nama task dan stage dengan aman (handle null)
        current_task_title = t.current_task.title if t.current_task else "Belum Mulai"
        stage_title = t.current_task.stage.title if t.current_task and t.current_task.stage else "-"
        
        # Jika status COMPLETED, override info
        if t.status == 'COMPLETED':
            current_task_title = "Selesai"
            stage_title = "Lulus / Kompeten"

        data.append({
            "id": t.id,
            "asesi_name": t.creator.nama_lengkap if t.creator else "Unknown",
            "scheme_name": t.scheme.title if t.scheme else "-",
            "current_task": current_task_title,
            "stage_name": stage_title,
            "status": t.status,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None
        })
    return jsonify(data), 200


# ============================================================================
# 2. CREATE & LIST (USER)
# ============================================================================
@competency_bp.route('/competency-tests', methods=['POST'])
@jwt_required()
def create_competency_test():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validasi
    if not data or not data.get('title') or not data.get('scheme_id'):
         return jsonify({"msg": "Judul dan Skema wajib diisi"}), 400

    # Cek skema valid
    scheme = CertificationScheme.query.get(data['scheme_id'])
    if not scheme:
        return jsonify({"msg": "Skema tidak ditemukan"}), 404

    # --- AUTO-ASSIGN WORKFLOW ---
    # Cari template workflow default (Sesuai seed yang kita buat)
    # Idealnya nanti ada relasi scheme -> workflow, tapi sementara kita tembak default
    workflow = WorkflowTemplate.query.filter_by(title="Skenario Standar LSP 2025").first()
    
    # Jika tidak ada workflow specific, cari yang aktif pertama
    if not workflow:
        workflow = WorkflowTemplate.query.filter_by(is_active=True).first()

    workflow_id = workflow.id if workflow else None
    
    # Set Task Awal (Jika workflow ada)
    first_task_id = None
    if workflow:
        first_stage = WorkflowStage.query.filter_by(template_id=workflow.id).order_by(WorkflowStage.order_index.asc()).first()
        if first_stage:
            first_task = WorkflowTask.query.filter_by(stage_id=first_stage.id).order_by(WorkflowTask.order_index.asc()).first()
            if first_task:
                first_task_id = first_task.id

    new_test = CompetencyTest(
        title=data['title'],
        description=f"Uji Kompetensi untuk Skema: {scheme.title}",
        scheme_id=data['scheme_id'],
        workflow_template_id=workflow_id, # Simpan Workflow
        current_task_id=first_task_id,    # Simpan Task Awal
        created_by_id=current_user_id,
        status='ONGOING' if first_task_id else 'DRAFT'
    )
    
    try:
        db.session.add(new_test)
        db.session.commit()
        return jsonify({
            "msg": "Uji Kompetensi berhasil dibuat.",
            "id": new_test.id,
            "title": new_test.title
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error create competency test: {e}")
        return jsonify({"msg": "Gagal membuat data."}), 500

@competency_bp.route('/competency-tests', methods=['GET'])
@jwt_required()
def get_competency_tests():
    # Filter by user login (Asesi hanya lihat punya sendiri)
    current_user_id = get_jwt_identity()
    
    # TODO: Nanti kasih if user.role == 'admin' bisa lihat semua atau pake endpoint monitoring
    tests = CompetencyTest.query.filter_by(created_by_id=current_user_id).order_by(CompetencyTest.created_at.desc()).all()
    
    result = []
    for t in tests:
        result.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "creator_name": t.creator.nama_lengkap if t.creator else "Unknown",
            "scheme_name": t.scheme.title if t.scheme else "-",
            "current_stage": t.current_task.stage.title if t.current_task else "-"
        })
        
    return jsonify(result), 200


# ============================================================================
# 3. DETAIL & ACTIONS
# ============================================================================
@competency_bp.route('/competency-tests/<int:id>', methods=['GET'])
@jwt_required()
def get_competency_test_detail(id):
    test = CompetencyTest.query.get_or_404(id)
    
    # Security: Pastikan user berhak (Owner atau Admin)
    # current_user_id = get_jwt_identity()
    # if test.created_by_id != current_user_id: # Tambahin cek admin disini nanti
    #    return jsonify({"msg": "Unauthorized"}), 403

    return jsonify({
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "status": test.status,
        "created_at": test.created_at.isoformat() if test.created_at else None,
        "scheme_name": test.scheme.title if test.scheme else "-",
        
        # Info Tambahan Workflow
        "workflow_template": test.workflow.title if test.workflow else "-",
        "current_task": test.current_task.title if test.current_task else "Belum mulai"
    }), 200

# UPDATE STAGE (ADMIN OVERRIDE)
@competency_bp.route('/competency-tests/<int:id>/stage', methods=['PUT'])
@admin_required()
def update_competency_stage(id):
    test = CompetencyTest.query.get_or_404(id)
    data = request.get_json()
    
    # Admin bisa paksa pindah ke Task ID tertentu
    new_task_id = data.get('task_id')
    reason = data.get('reason')

    if not new_task_id:
        return jsonify({"msg": "Task ID tujuan wajib dipilih"}), 400

    task = WorkflowTask.query.get(new_task_id)
    if not task:
        return jsonify({"msg": "Task tidak valid"}), 404
        
    test.current_task_id = new_task_id
    # Reset status jadi ONGOING kalau sebelumnya COMPLETED
    if test.status == 'COMPLETED':
        test.status = 'ONGOING'

    # Note: Idealnya simpan log alasan perubahan di tabel terpisah (Audit Log)
    print(f"Admin override test {id} to task {task.title}. Reason: {reason}")
    
    db.session.commit()
    return jsonify({"msg": f"Posisi berhasil dipindah ke: {task.title}"}), 200