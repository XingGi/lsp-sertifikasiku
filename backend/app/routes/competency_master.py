# backend/app/routes/competency_master.py
from flask import request, jsonify, Blueprint
from app.models import db, CompetencyUnit, CertificationScheme
from .auth import admin_required
from flask_jwt_extended import jwt_required
from sqlalchemy import or_

competency_master_bp = Blueprint('competency_master_bp', __name__)

# --- GUDANG UNIT KOMPETENSI ---

@competency_master_bp.route('/master/competency-units', methods=['GET'])
@jwt_required()
def get_units():
    # 1. Ambil Parameter dari URL (Query String)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('q', '', type=str)
    sort_by = request.args.get('sort', 'code-asc', type=str)

    # 2. Base Query
    query = CompetencyUnit.query

    # 3. Server-side Filtering (Search)
    if search:
        search_term = f"%{search}%"
        # Cari di Code, Title, atau Standard Type
        query = query.filter(
            or_(
                CompetencyUnit.code.ilike(search_term),
                CompetencyUnit.title.ilike(search_term),
                CompetencyUnit.standard_type.ilike(search_term)
            )
        )

    # 4. Server-side Sorting
    if sort_by == 'title-asc':
        query = query.order_by(CompetencyUnit.title.asc())
    elif sort_by == 'type':
        query = query.order_by(CompetencyUnit.standard_type.asc())
    elif sort_by == 'newest':
        query = query.order_by(CompetencyUnit.created_at.desc())
    else:
        # Default: Code A-Z
        query = query.order_by(CompetencyUnit.code.asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    # 6. Format Response
    return jsonify({
        "data": [{
            'id': u.id,
            'code': u.code,
            'title': u.title,
            'standard_type': u.standard_type,
            'description': u.description
        } for u in pagination.items],
        "meta": {
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "current_page": page,
            "per_page": per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    }), 200

@competency_master_bp.route('/master/competency-units', methods=['POST'])
@admin_required()
def create_unit():
    data = request.get_json()
    if not data.get('code') or not data.get('title'):
        return jsonify({"msg": "Kode dan Judul wajib diisi"}), 400
    
    if CompetencyUnit.query.filter_by(code=data['code']).first():
        return jsonify({"msg": "Kode unit sudah ada"}), 409

    new_unit = CompetencyUnit(
        code=data['code'],
        title=data['title'],
        standard_type=data.get('standard_type', 'SKKNI'),
        description=data.get('description')
    )
    db.session.add(new_unit)
    db.session.commit()
    return jsonify({"msg": "Unit berhasil dibuat"}), 201

# Update Unit
@competency_master_bp.route('/master/competency-units/<int:id>', methods=['PUT'])
@admin_required()
def update_unit(id):
    unit = CompetencyUnit.query.get_or_404(id)
    data = request.get_json()

    # Validasi field wajib
    if not data.get('code') or not data.get('title') or not data.get('standard_type'):
         return jsonify({"msg": "Kode, Judul, dan Standar wajib diisi"}), 400

    # Cek duplikasi kode jika kode-nya berubah
    if data['code'] != unit.code:
        if CompetencyUnit.query.filter_by(code=data['code']).first():
             return jsonify({"msg": "Kode unit sudah digunakan unit lain"}), 409

    # Update data
    unit.code = data['code']
    unit.title = data['title']
    unit.standard_type = data['standard_type'] # Input text bebas
    unit.description = data.get('description', unit.description)

    db.session.commit()
    return jsonify({"msg": "Unit berhasil diperbarui"}), 200

@competency_master_bp.route('/master/competency-units/<int:id>', methods=['DELETE'])
@admin_required()
def delete_unit(id):
    unit = CompetencyUnit.query.get_or_404(id)
    db.session.delete(unit)
    db.session.commit()
    return jsonify({"msg": "Unit berhasil dihapus"}), 200

# --- SKEMA SERTIFIKASI ---

@competency_master_bp.route('/master/schemes', methods=['GET'])
@jwt_required()
def get_schemes():
    # 1. Parameter Pagination & Filter
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('q', '', type=str)
    sort_by = request.args.get('sort', 'newest', type=str)

    query = CertificationScheme.query

    # 2. Filtering
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CertificationScheme.title.ilike(search_term),
                CertificationScheme.code.ilike(search_term)
            )
        )

    # 3. Sorting
    if sort_by == 'title-asc':
        query = query.order_by(CertificationScheme.title.asc())
    elif sort_by == 'code-asc':
        query = query.order_by(CertificationScheme.code.asc())
    elif sort_by == 'oldest':
        query = query.order_by(CertificationScheme.created_at.asc())
    else: # newest
        query = query.order_by(CertificationScheme.created_at.desc())

    # 4. Pagination
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "data": [{
            'id': s.id,
            'code': s.code,
            'title': s.title,
            'description': s.description,
            'unit_count': len(s.units),
            'unit_ids': [u.id for u in s.units] 
        } for s in pagination.items],
        "meta": {
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "current_page": page,
            "per_page": per_page
        }
    }), 200

@competency_master_bp.route('/master/schemes/<int:id>', methods=['GET'])
@jwt_required()
def get_scheme_detail(id):
    scheme = CertificationScheme.query.get_or_404(id)
    return jsonify({
        'id': scheme.id,
        'code': scheme.code,
        'title': scheme.title,
        'description': scheme.description,
        'units': [{'id': u.id, 'code': u.code, 'title': u.title, 'standard_type': u.standard_type} for u in scheme.units]
    }), 200

@competency_master_bp.route('/master/schemes', methods=['POST'])
@admin_required()
def create_scheme():
    data = request.get_json()
    if not data.get('title'):
        return jsonify({"msg": "Judul skema wajib diisi"}), 400

    new_scheme = CertificationScheme(
        code=data.get('code'),
        title=data['title'],
        description=data.get('description')
    )
    
    # Assign Units (Expect list of IDs: [1, 2, 5])
    if 'unit_ids' in data and isinstance(data['unit_ids'], list):
        units = CompetencyUnit.query.filter(CompetencyUnit.id.in_(data['unit_ids'])).all()
        new_scheme.units = units

    db.session.add(new_scheme)
    db.session.commit()
    return jsonify({"msg": "Skema berhasil dibuat"}), 201

@competency_master_bp.route('/master/schemes/<int:id>', methods=['PUT'])
@admin_required()
def update_scheme(id):
    scheme = CertificationScheme.query.get_or_404(id)
    data = request.get_json()

    if not data.get('title'):
        return jsonify({"msg": "Judul skema wajib diisi"}), 400

    # Cek kode unik kalau berubah
    if data.get('code') and data['code'] != scheme.code:
        if CertificationScheme.query.filter_by(code=data['code']).first():
            return jsonify({"msg": "Kode skema sudah digunakan"}), 409

    scheme.title = data['title']
    scheme.code = data.get('code')
    scheme.description = data.get('description')

    # Update Relasi Units (Magic of SQLAlchemy)
    # Dia bakal otomatis hapus yang gak ada di list, dan tambah yang baru
    if 'unit_ids' in data and isinstance(data['unit_ids'], list):
        units = CompetencyUnit.query.filter(CompetencyUnit.id.in_(data['unit_ids'])).all()
        scheme.units = units

    db.session.commit()
    return jsonify({"msg": "Skema berhasil diperbarui"}), 200

# DELETE (Tambahan biar lengkap)
@competency_master_bp.route('/master/schemes/<int:id>', methods=['DELETE'])
@admin_required()
def delete_scheme(id):
    scheme = CertificationScheme.query.get_or_404(id)
    # Hapus relasi dulu (biasanya otomatis di table asosiasi, tapi amanin aja)
    scheme.units = [] 
    db.session.delete(scheme)
    db.session.commit()
    return jsonify({"msg": "Skema berhasil dihapus"}), 200