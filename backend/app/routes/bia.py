# backend/app/routes/bia.py
import os
from flask import request, jsonify, Blueprint
from app.models import db, CriticalAsset, Dependency, KRI
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.ai_services import analyze_bia_with_gemini

bia_bp = Blueprint('bia_bp', __name__)

@bia_bp.route('/critical-assets', methods=['POST'])
@jwt_required()
def create_critical_asset():
    """Membuat aset kritis baru."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('nama_aset') or not data.get('tipe_aset'):
        return jsonify({"msg": "Nama dan tipe aset wajib diisi."}), 400

    new_asset = CriticalAsset(
        nama_aset=data['nama_aset'],
        tipe_aset=data['tipe_aset'],
        deskripsi=data.get('deskripsi'),
        user_id=current_user_id
    )
    db.session.add(new_asset)
    db.session.commit()
    return jsonify({"msg": "Aset kritis berhasil dibuat.", "id": new_asset.id}), 201

@bia_bp.route('/critical-assets', methods=['GET'])
@jwt_required()
def get_critical_assets():
    """Mengambil daftar semua aset kritis milik pengguna."""
    current_user_id = get_jwt_identity()
    assets = CriticalAsset.query.filter_by(user_id=current_user_id).all()
    asset_list = [{
        "id": asset.id,
        "nama_aset": asset.nama_aset,
        "tipe_aset": asset.tipe_aset
    } for asset in assets]
    return jsonify(asset_list)

# --- API untuk Ketergantungan (Dependencies) ---

@bia_bp.route('/dependencies', methods=['POST'])
@jwt_required()
def create_dependency():
    """Membuat hubungan ketergantungan baru antar aset."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or 'asset_id' not in data or 'depends_on_asset_id' not in data:
        return jsonify({"msg": "asset_id dan depends_on_asset_id wajib diisi."}), 400

    asset1 = CriticalAsset.query.filter_by(id=data['asset_id'], user_id=current_user_id).first_or_404("Aset asal tidak ditemukan atau bukan milik Anda.")
    asset2 = CriticalAsset.query.filter_by(id=data['depends_on_asset_id'], user_id=current_user_id).first_or_404("Aset tujuan tidak ditemukan atau bukan milik Anda.")

    new_dependency = Dependency(
        asset_id=asset1.id,
        depends_on_asset_id=asset2.id
    )
    db.session.add(new_dependency)
    db.session.commit()
    return jsonify({"msg": "Hubungan ketergantungan berhasil dibuat.", "id": new_dependency.id}), 201

@bia_bp.route('/critical-assets/<int:asset_id>/dependencies', methods=['GET'])
@jwt_required()
def get_asset_dependencies(asset_id):
    """Mengambil semua ketergantungan untuk sebuah aset spesifik."""
    current_user_id = get_jwt_identity()
    asset = CriticalAsset.query.filter_by(id=asset_id, user_id=current_user_id).first_or_404()

    # Aset-aset yang dibutuhkan oleh aset ini (dependencies_on)
    depends_on_list = [{
        "dependency_id": dep.id,
        "asset_id": dep.depends_on.id,
        "nama_aset": dep.depends_on.nama_aset
    } for dep in asset.dependencies_on]

    # Aset-aset lain yang membutuhkan aset ini (depended_on_by)
    depended_on_by_list = [{
        "dependency_id": dep.id,
        "asset_id": dep.asset.id,
        "nama_aset": dep.asset.nama_aset
    } for dep in asset.depended_on_by]

    return jsonify({
        "depends_on": depends_on_list,
        "depended_on_by": depended_on_by_list
    })
    
@bia_bp.route('/bia/simulate', methods=['POST'])
@jwt_required()
def simulate_bia():
    """Menjalankan simulasi BIA dengan input dari frontend."""
    current_user_id = get_jwt_identity()
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        return jsonify({"msg": "Konfigurasi API Key AI tidak ditemukan."}), 500

    data = request.get_json()
    asset_id = data.get('asset_id')
    duration = data.get('duration')

    if not asset_id or not duration:
        return jsonify({"msg": "asset_id dan duration wajib diisi."}), 400

    failed_asset = CriticalAsset.query.filter_by(id=asset_id, user_id=current_user_id).first_or_404()

    # --- Logika untuk menelusuri aset terdampak ---
    impacted_assets_names = set()
    assets_to_check = [failed_asset]
    checked_ids = {failed_asset.id}

    while assets_to_check:
        current_asset = assets_to_check.pop(0)
        # Cari semua aset yang bergantung pada current_asset
        for dep in current_asset.depended_on_by:
            if dep.asset.id not in checked_ids:
                impacted_assets_names.add(dep.asset.nama_aset)
                assets_to_check.append(dep.asset)
                checked_ids.add(dep.asset.id)
    
    # Ambil beberapa KRI relevan untuk konteks (contoh sederhana)
    relevant_kris = KRI.query.filter_by(user_id=current_user_id).limit(5).all()
    kri_list = [{"nama_kri": k.nama_kri, "ambang_batas_kritis": k.ambang_batas_kritis} for k in relevant_kris]

    # Panggil fungsi AI
    analysis_result = analyze_bia_with_gemini(
        failed_asset_name=failed_asset.nama_aset,
        downtime=duration,
        impacted_assets=list(impacted_assets_names),
        kris=kri_list,
        api_key=gemini_api_key
    )

    if not analysis_result:
        return jsonify({"msg": "Gagal mendapatkan analisis dari AI."}), 500

    return jsonify({"analysis": analysis_result})