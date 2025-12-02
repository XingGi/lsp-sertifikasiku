# backend/app/routes/master_data.py
import os
from flask import request, jsonify, Blueprint, current_app, send_from_directory
from app.models import db, MasterData, Regulation
from .auth import admin_required # <-- Mengimpor decorator dari auth.py
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

master_data_bp = Blueprint('master_data_bp', __name__)

# === ENDPOINTS UNTUK MASTER DATA ===
@master_data_bp.route('/master-data', methods=['GET'])
@jwt_required()
def get_master_data():
    """(Publik) Mengambil data master berdasarkan kategori untuk dropdown."""
    category = request.args.get('category')
    if not category:
        return jsonify({"msg": "Parameter 'category' wajib diisi."}), 400
    
    data = MasterData.query.filter_by(category=category.upper()).all()
    result = [{"key": item.key, "value": item.value} for item in data]
    return jsonify(result)

@master_data_bp.route('/admin/master-data', methods=['GET'])
@admin_required() # <-- Menggunakan decorator admin
def get_all_master_data():
    """[Admin] Mengambil semua master data, dikelompokkan."""
    all_data = MasterData.query.order_by(MasterData.category, MasterData.id).all()
    grouped_data = {}
    for item in all_data:
        if item.category not in grouped_data:
            grouped_data[item.category] = []
        grouped_data[item.category].append({"id": item.id, "key": item.key, "value": item.value})
    return jsonify(grouped_data)

@master_data_bp.route('/admin/master-data', methods=['POST'])
@admin_required() # <-- Menggunakan decorator admin
def create_master_data():
    """[Admin] Membuat entri master data baru."""
    data = request.get_json()
    if not data or not data.get('category') or not data.get('key') or not data.get('value'):
        return jsonify({"msg": "Category, Key, dan Value wajib diisi"}), 400
    
    new_item = MasterData(
        category=data['category'].upper(), 
        key=data['key'], 
        value=data['value']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"msg": "Data berhasil dibuat", "id": new_item.id}), 201
    
@master_data_bp.route('/admin/master-data/<int:id>', methods=['DELETE'])
@admin_required() # <-- Menggunakan decorator admin
def delete_master_data(id):
    """[Admin] Menghapus entri master data."""
    item = MasterData.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Data berhasil dihapus"})

@master_data_bp.route('/admin/master-data/<int:id>', methods=['PUT'])
@admin_required()
def update_master_data(id):
    """[Admin] Memperbarui entri master data."""
    item = MasterData.query.get_or_404(id)
    data = request.get_json()

    # Update key dan value jika ada di data yang dikirim
    item.key = data.get('key', item.key)
    item.value = data.get('value', item.value)

    db.session.commit()
    return jsonify({"msg": "Data berhasil diperbarui"})

# === ENDPOINTS UNTUK MASTER REGULASI ===
@master_data_bp.route('/admin/regulations', methods=['GET'])
@admin_required()
def get_regulations():
    """[Admin] Mengambil semua data regulasi."""
    regulations = Regulation.query.order_by(Regulation.name).all()
    return jsonify([{
        "id": reg.id,
        "name": reg.name,
        "description": reg.description,
        "filename": reg.filename,
        "created_at": reg.created_at.isoformat()
    } for reg in regulations])

@master_data_bp.route('/admin/regulations', methods=['POST'])
@admin_required()
def create_regulation():
    """[Admin] Menambah regulasi baru dan meng-upload file."""
    # Ambil data form
    name = request.form.get('name')
    description = request.form.get('description')
    
    if not name or 'file' not in request.files:
        return jsonify({"msg": "Nama regulasi dan file wajib diisi."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "Tidak ada file yang dipilih."}), 400

    # Simpan file dengan aman
    filename = secure_filename(file.filename)
    # Pastikan direktori uploads ada
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    file.save(os.path.join(upload_folder, filename))

    # Simpan informasi ke database
    new_regulation = Regulation(
        name=name,
        description=description,
        filename=filename
    )
    db.session.add(new_regulation)
    db.session.commit()

    return jsonify({"msg": "Regulasi berhasil ditambahkan."}), 201

@master_data_bp.route('/admin/regulations/<int:id>', methods=['DELETE'])
@admin_required()
def delete_regulation(id):
    """[Admin] Menghapus regulasi dan file terkait."""
    regulation = Regulation.query.get_or_404(id)
    
    # Hapus file dari folder uploads jika ada
    if regulation.filename:
        try:
            os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], regulation.filename))
        except OSError as e:
            print(f"Error saat menghapus file: {e.strerror}")
            
    # Hapus data dari database
    db.session.delete(regulation)
    db.session.commit()
    
    return jsonify({"msg": "Regulasi berhasil dihapus."})


# === ENDPOINT UNTUK PENCARIAN REGULASI (AUTO-SUGGEST) ===

@master_data_bp.route('/regulations/search', methods=['GET'])
@jwt_required()
def search_regulations():
    """Mencari regulasi berdasarkan query untuk form assessment."""
    query = request.args.get('q', '')
    if len(query) < 2: # Hanya cari jika user sudah mengetik minimal 2 huruf
        return jsonify([])

    # Cari regulasi yang namanya mengandung query (case-insensitive)
    search_term = f"%{query}%"
    regulations = Regulation.query.filter(Regulation.name.ilike(search_term)).limit(10).all()

    return jsonify([{
        "value": reg.id,  # ID akan menjadi nilai yang disimpan
        "label": reg.name, # Nama akan menjadi teks yang ditampilkan
        "description": reg.description
    } for reg in regulations])

from flask import send_from_directory

@master_data_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Menyajikan file yang sudah di-upload."""
    # Membuat path absolut yang lebih aman
    upload_folder_path = os.path.join(current_app.root_path, '..', current_app.config['UPLOAD_FOLDER'])
    try:
        # Pastikan file ada sebelum mengirim
        file_path = os.path.join(upload_folder_path, filename)
        if not os.path.exists(file_path):
             return jsonify({"msg": "File tidak ditemukan."}), 404
        return send_from_directory(upload_folder_path, filename)
    except Exception as e:
        # Log error jika terjadi masalah saat mengirim file
        current_app.logger.error(f"Error serving file {filename}: {e}")
        return jsonify({"msg": "Gagal menyajikan file."}), 500