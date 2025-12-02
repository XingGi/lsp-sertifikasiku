# backend/app/routes/dashboard.py
from flask import request, jsonify, Blueprint
from app.models import KRI, HorizonScanEntry
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

# Membuat Blueprint untuk endpoint terkait dashboard
dashboard_bp = Blueprint('dashboard_bp', __name__)

# --- Endpoint untuk KRI ---
@dashboard_bp.route('/kri', methods=['POST'])
@jwt_required()
def create_kri():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('nama_kri') or not data.get('tipe_data') or data.get('ambang_batas_kritis') is None:
        return jsonify({"msg": "Data KRI tidak lengkap"}), 400

    new_kri = KRI(
        nama_kri=data['nama_kri'],
        deskripsi=data.get('deskripsi'),
        tipe_data=data['tipe_data'],
        ambang_batas_kritis=data['ambang_batas_kritis'],
        user_id=current_user_id
    )
    db.session.add(new_kri)
    db.session.commit()

    return jsonify({"msg": "KRI berhasil dibuat", "id": new_kri.id}), 201

# READ: Mendapatkan semua KRI milik pengguna
@dashboard_bp.route('/kri', methods=['GET'])
@jwt_required()
def get_all_kris():
    current_user_id = get_jwt_identity()
    kris = KRI.query.filter_by(user_id=current_user_id).all()
    
    kri_list = []
    for kri in kris:
        kri_list.append({
            "id": kri.id,
            "nama_kri": kri.nama_kri,
            "deskripsi": kri.deskripsi,
            "tipe_data": kri.tipe_data,
            "ambang_batas_kritis": kri.ambang_batas_kritis,
            "created_at": kri.created_at.isoformat()
        })
        
    return jsonify(kri_list), 200

# READ: Mendapatkan satu KRI spesifik
@dashboard_bp.route('/kri/<int:id>', methods=['GET'])
@jwt_required()
def get_kri(id):
    current_user_id = get_jwt_identity()
    kri = KRI.query.get(id)

    if not kri:
        return jsonify({"msg": "KRI tidak ditemukan"}), 404
    
    if kri.user_id != current_user_id:
        return jsonify({"msg": "Akses ditolak"}), 403 # Forbidden

    return jsonify({
        "id": kri.id,
        "nama_kri": kri.nama_kri,
        "deskripsi": kri.deskripsi,
        "tipe_data": kri.tipe_data,
        "ambang_batas_kritis": kri.ambang_batas_kritis,
        "created_at": kri.created_at.isoformat()
    }), 200

# UPDATE: Memperbarui KRI yang ada
@dashboard_bp.route('/kri/<int:id>', methods=['PUT'])
@jwt_required()
def update_kri(id):
    current_user_id = get_jwt_identity()
    kri = KRI.query.get(id)

    if not kri:
        return jsonify({"msg": "KRI tidak ditemukan"}), 404

    if kri.user_id != current_user_id:
        return jsonify({"msg": "Akses ditolak"}), 403

    data = request.get_json()
    kri.nama_kri = data.get('nama_kri', kri.nama_kri)
    kri.deskripsi = data.get('deskripsi', kri.deskripsi)
    kri.tipe_data = data.get('tipe_data', kri.tipe_data)
    kri.ambang_batas_kritis = data.get('ambang_batas_kritis', kri.ambang_batas_kritis)
    
    db.session.commit()

    return jsonify({"msg": "KRI berhasil diperbarui"}), 200

# DELETE: Menghapus KRI
@dashboard_bp.route('/kri/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_kri(id):
    current_user_id = get_jwt_identity()
    kri = KRI.query.get(id)

    if not kri:
        return jsonify({"msg": "KRI tidak ditemukan"}), 404

    if kri.user_id != current_user_id:
        return jsonify({"msg": "Akses ditolak"}), 403

    db.session.delete(kri)
    db.session.commit()

    return jsonify({"msg": "KRI berhasil dihapus"}), 200

# --- Endpoint untuk Horizon Scanner ---
@dashboard_bp.route('/horizon-scan', methods=['GET'])
@jwt_required()
def get_horizon_scan_entries():
    """Mengambil 5 entri terbaru dari Horizon Scanner."""
    
    # Ambil 5 berita terbaru, diurutkan dari yang paling baru
    entries = HorizonScanEntry.query.order_by(HorizonScanEntry.published_date.desc()).limit(5).all()
    
    results = []
    for entry in entries:
        results.append({
            "id": entry.id,
            "title": entry.title,
            "source_url": entry.source_url,
            "published_date": entry.published_date.isoformat(),
            "ai_summary": entry.ai_summary
        })
        
    return jsonify(results), 200