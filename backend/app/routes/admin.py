# backend/app/routes/admin.py
from flask import request, jsonify, Blueprint
from app.models import db, Role, Permission, User, BasicAssessment, MadyaAssessment, Department, RiskMapTemplate, MasterData
from app import bcrypt, ma
from marshmallow import fields
from .auth import admin_required, permission_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, or_
from datetime import datetime

class DepartmentSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str()
    institution = fields.Str(dump_only=True)
class UserSimpleSchema(ma.Schema):
    nama_lengkap = fields.Str()
class SubmittedRiskSchema(ma.Schema):
    """Skema untuk menampilkan 'Ajuan Risiko' di tabel Manajer Risiko."""
    id = fields.Int()
    risk_description = fields.Str()
    potential_cause = fields.Str()
    potential_impact = fields.Str()
    status = fields.Str()
    created_at = fields.DateTime(format="%d %B %Y") # Format tanggal
    
    # Tampilkan siapa yang mengirim dan dari departemen mana
    submitter = fields.Nested(UserSimpleSchema)
    department = fields.Nested(DepartmentSchema(only=("name",)))
    
class ActionPlanSchema(ma.Schema):
    """Skema untuk Rencana Aksi (Mitigasi)."""
    id = fields.Int()
    action_description = fields.Str()
    status = fields.Str()
    # Format tanggal agar lebih mudah dibaca di frontend
    due_date = fields.Date(format="%d %B %Y") 
    institution = fields.Str()
    created_at = fields.DateTime(format="%d %B %Y")
    
    # Tampilkan info relasi
    assigned_department = fields.Nested(DepartmentSchema(only=("name",)))
    creator = fields.Nested(UserSimpleSchema)
    
    # Tampilkan ID sumbernya
    origin_answer_id = fields.Int(allow_none=True)
    origin_submitted_risk_id = fields.Int(allow_none=True)

admin_bp = Blueprint('admin_bp', __name__)

# --- CRUD untuk Roles ---

@admin_bp.route('/roles', methods=['POST'])
@admin_required() # Hanya admin yang bisa membuat role baru
def create_role():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"msg": "Nama role wajib diisi."}), 400

    if Role.query.filter_by(name=data['name']).first():
        return jsonify({"msg": "Nama role sudah ada."}), 409

    new_role = Role(name=data['name'], description=data.get('description'))

    # Tambahkan permissions jika ada ID yang dikirim
    permission_ids = data.get('permission_ids', [])
    if permission_ids:
        permissions = Permission.query.filter(Permission.id.in_(permission_ids)).all()
        new_role.permissions.extend(permissions)

    db.session.add(new_role)
    db.session.commit()
    return jsonify({"msg": "Role berhasil dibuat.", "id": new_role.id}), 201

@admin_bp.route('/roles', methods=['GET'])
@admin_required() # Hanya admin yang bisa melihat semua role
# @permission_required('view_roles') # Atau gunakan permission spesifik jika perlu
def get_roles():
    roles = Role.query.order_by(Role.name).all()
    result = []
    for role in roles:
        result.append({
            "id": role.id,
            "name": role.name,
            "description": role.description,
            # Sertakan ID permission yang dimiliki role ini
            "permission_ids": [p.id for p in role.permissions]
        })
    return jsonify(result)

@admin_bp.route('/roles/<int:role_id>', methods=['PUT'])
@admin_required() # Hanya admin yang bisa edit
# @permission_required('edit_role')
def update_role(role_id):
    role = Role.query.get_or_404(role_id)
    data = request.get_json()

    role.name = data.get('name', role.name)
    role.description = data.get('description', role.description)

    # Update permissions: Hapus yang lama, tambah yang baru
    if 'permission_ids' in data: # Cek jika key 'permission_ids' ada di request
        permission_ids = data['permission_ids']
        if isinstance(permission_ids, list): # Pastikan berupa list
             # Dapatkan objek Permission berdasarkan ID
             new_permissions = Permission.query.filter(Permission.id.in_(permission_ids)).all()
             role.permissions = new_permissions # Ganti permissions yang lama
        else:
             return jsonify({"msg": "'permission_ids' harus berupa array."}), 400

    db.session.commit()
    return jsonify({"msg": "Role berhasil diperbarui."})

@admin_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@admin_required() # Hanya admin yang bisa hapus
# @permission_required('delete_role')
def delete_role(role_id):
    role = Role.query.get_or_404(role_id)
    # Tambahkan validasi: jangan hapus role 'admin' atau role yang masih dipakai user? (Opsional)
    if role.name.lower() == 'admin':
         return jsonify({"msg": "Role 'admin' tidak dapat dihapus."}), 400

    db.session.delete(role)
    db.session.commit()
    return jsonify({"msg": "Role berhasil dihapus."})


@admin_bp.route('/permissions', methods=['GET'])
@admin_required() # Hanya admin yang perlu tahu semua permission
# @permission_required('view_permissions')
def get_permissions():
    """Mengambil daftar semua permission yang tersedia."""
    # Opsi 1: Ambil dari database (jika kamu membuat seeder untuk permissions)
    permissions = Permission.query.order_by(Permission.name).all()
    result = [{"id": p.id, "name": p.name, "description": p.description} for p in permissions]

    return jsonify(result)

@admin_bp.route('/users/<int:user_id>/roles', methods=['PUT'])
@admin_required() # Hanya admin yang bisa assign role
def assign_user_roles(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    role_ids = data.get('role_ids', [])

    if not isinstance(role_ids, list):
        return jsonify({"msg": "'role_ids' harus berupa array."}), 400

    # Dapatkan objek Role berdasarkan ID
    new_roles = Role.query.filter(Role.id.in_(role_ids)).all()
    user.roles = new_roles # Ganti roles yang lama dengan yang baru

    db.session.commit()
    return jsonify({"msg": f"Roles untuk user {user.email} berhasil diperbarui."})

@admin_bp.route('/users', methods=['GET'])
@admin_required() # Hanya admin yang bisa melihat semua user
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')

    query = User.query

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.nama_lengkap.ilike(search_term),
                User.email.ilike(search_term),
                User.institution.ilike(search_term)
            )
        )

    query = query.order_by(User.nama_lengkap)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    users = pagination.items
    
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "email": user.email,
            "nama_lengkap": user.nama_lengkap,
            "role_ids": [role.id for role in user.roles],
            "roles": [role.name for role in user.roles],
            "institution": user.institution,
            "department_id": user.department_id,
            "department_name": user.department.name if user.department else None
        })
        
    return jsonify({
        "data": result,
        "meta": {
            "page": page,
            "per_page": per_page,
            "total_pages": pagination.pages,
            "total_items": pagination.total
        }
    })

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required()
def get_user_details_admin(user_id):
    """[Admin] Mengambil detail lengkap user berdasarkan ID."""
    user = User.query.get_or_404(user_id)

    count_dasar = db.session.query(func.count(BasicAssessment.id)).filter_by(user_id=user_id).scalar() or 0
    count_madya = db.session.query(func.count(MadyaAssessment.id)).filter_by(user_id=user_id).scalar() or 0
    count_template_peta = db.session.query(func.count(RiskMapTemplate.id)).filter_by(user_id=user_id, is_default=False).scalar() or 0

    assessment_limits = {
        "dasar": {"count": count_dasar, "limit": user.limit_dasar},
        "madya": {"count": count_madya, "limit": user.limit_madya},
        "template_peta": {"count": count_template_peta, "limit": user.limit_template_peta},
    }

    return jsonify({
        "id": user.id,
        "nama_lengkap": user.nama_lengkap,
        "email": user.email,
        "phone_number": getattr(user, 'phone_number', None),
        "institution": getattr(user, 'institution', None),
        "role_ids": [role.id for role in user.roles], # Kirim ID roles
        "assessment_limits": assessment_limits,
        "department_id": user.department_id,
        "limit_qrc_standard": user.limit_qrc_standard,
        "limit_qrc_essay": user.limit_qrc_essay,
    }), 200

# === ENDPOINT BARU: UPDATE User Detail (oleh Admin) ===
@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required()
def update_user_details_admin(user_id):
    """[Admin] Memperbarui detail user, termasuk roles dan limits."""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body tidak boleh kosong"}), 400

    updated = False

    # 1. Update Profil Dasar
    profile_fields = ['nama_lengkap', 'phone_number', 'institution']
    for field in profile_fields:
        if field in data:
            setattr(user, field, data[field])
            updated = True

    # 2. Update Roles
    if 'role_ids' in data:
        role_ids = data['role_ids']
        if isinstance(role_ids, list):
            admin_role_db = Role.query.filter(func.lower(Role.name) == 'admin').first()
            admin_role_id_in_db = admin_role_db.id if admin_role_db else None
            is_trying_to_remove_admin_role = admin_role_id_in_db and admin_role_id_in_db not in role_ids
            
            if user.email.lower() == "admin@admin.com" and is_trying_to_remove_admin_role:
                 return jsonify({"msg": "Tidak dapat menghapus role 'Admin' dari akun super admin utama."}), 400

            new_roles = Role.query.filter(Role.id.in_(role_ids)).all()
            user.roles = new_roles
            updated = True
        else:
            return jsonify({"msg": "'role_ids' harus berupa array."}), 400

    # 3. Update Assessment Limits
    if 'assessment_limits' in data:
        limits_data = data['assessment_limits']
        limit_fields = {
            "dasar": "limit_dasar",
            "madya": "limit_madya",
            "ai": "limit_ai",
            "template_peta": "limit_template_peta",
            "horizon": "limit_horizon"
        }
        for key, db_field in limit_fields.items():
            if key in limits_data and 'limit' in limits_data[key]:
                try:
                    new_limit = int(limits_data[key]['limit']) if limits_data[key]['limit'] is not None else None
                    if getattr(user, db_field) != new_limit:
                        setattr(user, db_field, new_limit)
                        updated = True
                except (ValueError, TypeError):
                    pass # Abaikan jika limit tidak valid
                
    if 'limit_qrc_standard' in data:
        try:
            val = data['limit_qrc_standard']
            new_limit = int(val) if val is not None else None
            
            if user.limit_qrc_standard != new_limit:
                user.limit_qrc_standard = new_limit
                updated = True
        except (ValueError, TypeError):
            pass # Abaikan jika input tidak valid

    if 'limit_qrc_essay' in data:
        try:
            val = data['limit_qrc_essay']
            new_limit = int(val) if val is not None else None
            
            if user.limit_qrc_essay != new_limit:
                user.limit_qrc_essay = new_limit
                updated = True
        except (ValueError, TypeError):
            pass
    
    if 'department_id' in data:
        dept_id = data.get('department_id')
        
        # Cek apakah departemen valid untuk institusi user ini
        if dept_id:
            dept = Department.query.get(dept_id)
            if not dept or dept.institution != user.institution:
                return jsonify({"msg": "Departemen tidak valid untuk institusi user ini."}), 400
            user.department_id = dept_id
        else:
            user.department_id = None # Hapus departemen
        
        updated = True

    if updated:
        try:
            db.session.commit()
            count_dasar = db.session.query(func.count(BasicAssessment.id)).filter_by(user_id=user_id).scalar() or 0
            count_madya = db.session.query(func.count(MadyaAssessment.id)).filter_by(user_id=user_id).scalar() or 0
            count_template_peta = db.session.query(func.count(RiskMapTemplate.id)).filter_by(user_id=user_id, is_default=False).scalar() or 0
            updated_user_data = {
                "id": user.id, "nama_lengkap": user.nama_lengkap, "email": user.email,
                "phone_number": getattr(user, 'phone_number', None),
                "institution": getattr(user, 'institution', None),
                "department_id": user.department_id,
                "role_ids": [role.id for role in user.roles],
                "roles": [role.name for role in user.roles],
                "assessment_limits": {
                    "dasar": {"count": count_dasar, "limit": user.limit_dasar},
                    "madya": {"count": count_madya, "limit": user.limit_madya},
                    "template_peta": {"count": count_template_peta, "limit": user.limit_template_peta}
                }
            }
            return jsonify({
                "msg": f"Data pengguna {user.email} berhasil diperbarui.",
                "user": updated_user_data
            }), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating user {user_id}: {e}")
            return jsonify({"msg": "Gagal memperbarui data pengguna."}), 500
    else:
        return jsonify({"msg": "Tidak ada data yang valid untuk diperbarui."}), 400
    
@admin_bp.route('/users', methods=['POST'])
@admin_required()
def create_user_admin():
    """[Admin] Membuat user baru."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    nama_lengkap = data.get('nama_lengkap')
    role_ids = data.get('role_ids', [])

    if not email or not password or not nama_lengkap:
        return jsonify({"msg": "Email, password, dan nama lengkap wajib diisi."}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email sudah terdaftar."}), 409
    
    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(
        email=email,
        password_hash=hashed_password,
        nama_lengkap=nama_lengkap,
        phone_number=data.get('phone_number'),
        institution=data.get('institution'),
        department_id=data.get('department_id'),
        # Set default limits (atau ambil dari request jika ada)
        limit_dasar=data.get('limit_dasar', 10),
        limit_madya=data.get('limit_madya', 5),
        limit_template_peta=data.get('limit_template_peta', 5)
    )
    
    # Assign roles
    if role_ids:
        roles = Role.query.filter(Role.id.in_(role_ids)).all()
        new_user.roles.extend(roles)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Kembalikan data user baru (tanpa password)
        # (Hitungan assessment masih 0 karena baru dibuat)
        created_user_data = {
            "id": new_user.id,
            "nama_lengkap": new_user.nama_lengkap,
            "email": new_user.email,
            "phone_number": new_user.phone_number,
            "institution": new_user.institution,
            "department_id": new_user.department_id,
            "role_ids": [role.id for role in new_user.roles],
            "roles": [role.name for role in new_user.roles],
            "assessment_limits": {
                "dasar": {"count": 0, "limit": new_user.limit_dasar},
                "madya": {"count": 0, "limit": new_user.limit_madya},
                "template_peta": {"count": 0, "limit": new_user.limit_template_peta}
            }
        }
        return jsonify({"msg": "User berhasil dibuat.", "user": created_user_data}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {e}")
        return jsonify({"msg": "Gagal membuat user."}), 500

# === ENDPOINT BARU: DELETE /users/<id> (Hapus User) ===
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user_admin(user_id):
    """[Admin] Menghapus user berdasarkan ID."""
    current_admin_id_str = get_jwt_identity()
    current_admin_id = int(current_admin_id_str)

    # Keamanan: Admin tidak bisa menghapus diri sendiri
    if user_id == current_admin_id:
        return jsonify({"msg": "Anda tidak dapat menghapus akun Anda sendiri."}), 403

    user_to_delete = User.query.get_or_404(user_id)
    
    # Keamanan: Admin tidak bisa menghapus super admin 'admin@admin.com'
    if user_to_delete.email.lower() == "admin@admin.com":
        return jsonify({"msg": "Akun super admin utama tidak dapat dihapus."}), 403

    try:
        db.session.delete(user_to_delete)
        db.session.commit()
        return jsonify({"msg": f"User {user_to_delete.email} berhasil dihapus."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user {user_id}: {e}")
        return jsonify({"msg": "Gagal menghapus user. Pastikan user tidak memiliki data terkait (misal: assessment)."}), 500

@admin_bp.route('/departments-list', methods=['GET'])
@jwt_required()
@permission_required('manage_departments')
def get_departments_list():
    """
    Mengambil daftar departemen.
    Jika ?institution=... ada, filter berdasarkan itu (untuk Super Admin).
    Jika tidak, filter berdasarkan institusi user yang login (untuk Manajer Risiko).
    """
    try:
        institution_filter = request.args.get('institution')
        departments_query = Department.query

        if institution_filter:
            # Mode Super Admin: Filter berdasarkan parameter
            departments_query = departments_query.filter_by(
                institution=institution_filter
            )
        else:
            # Mode Manajer Risiko: Filter berdasarkan institusi sendiri
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or not user.institution:
                # Jika Manajer Risiko tidak punya institusi, kembalikan daftar kosong
                return jsonify([]), 200 
            
            departments_query = departments_query.filter_by(
                institution=user.institution
            )
        
        departments = departments_query.order_by(Department.name).all()
        return DepartmentSchema(many=True).jsonify(departments), 200
        
    except Exception as e:
        print(f"Error di get_departments_list: {e}") 
        return jsonify({"msg": "Gagal mengambil data departemen", "error": str(e)}), 500
    
@admin_bp.route('/departments', methods=['GET'])
@jwt_required()
@permission_required('manage_departments')
def get_departments_for_institution():
    """Mengambil daftar departemen untuk tabel manajemen."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.institution:
        return jsonify({"msg": "User tidak memiliki institusi."}), 400
    departments = Department.query.filter_by(
        institution=user.institution
    ).order_by(Department.name).all()
    
    return DepartmentSchema(many=True).jsonify(departments), 200

@admin_bp.route('/departments', methods=['POST'])
@jwt_required()
@permission_required('manage_departments')
def create_department_for_institution():
    """Membuat departemen baru untuk institusi user."""
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"msg": "Nama departemen wajib diisi."}), 400

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.institution:
        return jsonify({"msg": "User tidak memiliki institusi."}), 400
        
    # Cek duplikat HANYA di dalam institusi mereka
    existing = Department.query.filter_by(
        name=data['name'], 
        institution=user.institution
    ).first()
    
    if existing:
        return jsonify({"msg": "Nama departemen sudah ada untuk institusi ini."}), 409
        
    new_dept = Department(
        name=data['name'],
        institution=user.institution
    )
    db.session.add(new_dept)
    db.session.commit()
    
    return DepartmentSchema().jsonify(new_dept), 201

@admin_bp.route('/departments/<int:dept_id>', methods=['PUT'])
@jwt_required()
@permission_required('manage_departments')
def update_department_for_institution(dept_id):
    """Update departemen (HANYA JIKA MILIK INSTITUSINYA)."""
    dept = Department.query.get_or_404(dept_id)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or dept.institution != user.institution:
        return jsonify({"msg": "Akses ditolak: Anda tidak memiliki izin untuk departemen ini."}), 403
        
    data = request.get_json()
    dept.name = data.get('name', dept.name)
    db.session.commit()
    
    return DepartmentSchema().jsonify(dept), 200

@admin_bp.route('/departments/<int:dept_id>', methods=['DELETE'])
@jwt_required()
@permission_required('manage_departments')
def delete_department_for_institution(dept_id):
    """Hapus departemen."""
    dept = Department.query.get_or_404(dept_id)
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or dept.institution != user.institution:
        return jsonify({"msg": "Akses ditolak: Anda tidak memiliki izin untuk departemen ini."}), 403
        
    db.session.delete(dept)
    db.session.commit()
    
    return jsonify({"msg": "Departemen berhasil dihapus."}), 200
    
@admin_bp.route('/system-config/api-key', methods=['GET', 'POST'])
@admin_required()
def manage_api_key():
    """
    Mengelola API Key Gemini (System Config).
    GET: Cek apakah key sudah ada (return masked key).
    POST: Simpan/Update key baru.
    """
    if request.method == 'GET':
        # Cari config dengan key GEMINI_API_KEY
        config = MasterData.query.filter_by(category='SYSTEM_CONFIG', key='GEMINI_API_KEY').first()
        has_key = False
        masked_key = ""
        
        if config and config.value:
            has_key = True
            val = config.value
            # Masking: Tampilkan 4 huruf awal ... 4 huruf akhir
            if len(val) > 8:
                masked_key = f"{val[:4]}...{val[-4:]}"
            else:
                masked_key = "********"
        
        return jsonify({
            'has_key': has_key,
            'masked_key': masked_key
        }), 200

    if request.method == 'POST':
        data = request.get_json()
        new_key = data.get('api_key')
        
        if not new_key:
            return jsonify({'message': 'API Key tidak boleh kosong'}), 400
            
        # Cek apakah sudah ada di database
        config = MasterData.query.filter_by(category='SYSTEM_CONFIG', key='GEMINI_API_KEY').first()
        
        if not config:
            # Jika belum ada, buat baru
            config = MasterData(
                category='SYSTEM_CONFIG',
                key='GEMINI_API_KEY',
                value=new_key,
            )
            db.session.add(config)
        else:
            # Jika sudah ada, update nilainya
            config.value = new_key
            
        try:
            db.session.commit()
            return jsonify({'message': 'API Key berhasil diperbarui'}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error saving API Key: {e}")
            return jsonify({'message': 'Gagal menyimpan API Key ke database'}), 500