# backend/app/routes/auth.py
from flask import request, jsonify, Blueprint
from app.models import User, Role, BasicAssessment, MadyaAssessment, RiskAssessment, RiskMapTemplate, HorizonScanResult, QrcAssessment
from app import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from functools import wraps
from sqlalchemy import func

# Membuat Blueprint khusus untuk otentikasi
auth_bp = Blueprint('auth_bp', __name__)

# --- Helper Decorator untuk Admin ---
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            # Cek apakah 'role' di dalam token adalah 'admin'
            if claims.get("role") != "admin":
                return jsonify(msg="Hanya admin yang diizinkan!"), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def permission_required(permission_name):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_permissions = claims.get("permissions", [])
            is_admin = claims.get("role") == "admin"
            if is_admin:
                return fn(*args, **kwargs)
            if permission_name in user_permissions:
                return fn(*args, **kwargs)
            return jsonify(msg=f"Akses ditolak: Membutuhkan permission '{permission_name}'."), 403
        return decorator
    return wrapper

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint untuk registrasi pengguna baru."""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('nama_lengkap'):
        return jsonify({"msg": "Data yang dikirim tidak lengkap"}), 400

    # Cek apakah email sudah terdaftar
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email sudah terdaftar"}), 409

    # Buat user baru
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        email=data['email'],
        nama_lengkap=data['nama_lengkap'],
        password_hash=hashed_password
    )
    
    try:
        user_role = Role.query.filter_by(name='User').first()
        if user_role:
            new_user.roles.append(user_role)
            print(f"Assigning default 'User' role to new user: {new_user.email}")
        else:
            print(f"WARNING: Default 'User' role not found in database during registration for {new_user.email}. User created without roles.")
    except Exception as e:
         print(f"Error finding or assigning default 'User' role: {e}")
         
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Registrasi berhasil"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint untuk login pengguna."""
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Email atau password tidak boleh kosong"}), 400

    user = User.query.filter_by(email=data['email']).first()
    
    if user:
        print(f"--- Login attempt for: {user.email} ---")
        print(f"User ID from DB: {user.id}")
        # Coba akses relasi roles
        try:
            user_roles_list = user.roles
            print(f"User Roles from DB relationship: {[r.name for r in user_roles_list]}")
        except Exception as e:
            print(f"Error accessing user.roles: {e}")

    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        user_permissions = set()
        user_roles_names = []
        is_admin = False
        print("Processing roles for token:")
        for role in user.roles:
             print(f"  - Found role: {role.name} (ID: {role.id})") # Log role yang ditemukan
             user_roles_names.append(role.name)
             if role.name.lower() == 'admin':
                 is_admin = True
             for perm in role.permissions:
                 user_permissions.add(perm.name)

        additional_claims = {
            "role": "admin" if is_admin else (user_roles_names[0] if user_roles_names else "user"),
            "permissions": list(user_permissions), # Kirim list permission unik
            "nama_lengkap": user.nama_lengkap,
            "email": user.email
        }
        
        print(f"Final additional_claims for token: {additional_claims}")
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Email atau password salah"}), 401


# === ENDPOINT BARU: UNTUK MENGAMBIL INFO USER YANG SEDANG LOGIN ===
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Mengambil detail pengguna yang sedang login."""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User tidak ditemukan"}), 404
    
    claims = get_jwt()
    
    return jsonify({
        "id": user.id,
        "nama_lengkap": user.nama_lengkap,
        "email": user.email,
        "role": claims.get('role', 'user')
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Endpoint untuk logout."""
    return jsonify({"msg": "Logout berhasil"}), 200

@auth_bp.route('/account/details', methods=['GET'])
@jwt_required()
def get_account_details():
    """Mengambil detail lengkap pengguna yang sedang login."""
    current_user_id_str = get_jwt_identity()
    
    try:
        current_user_id = int(current_user_id_str) # Konversi ke integer
    except ValueError:
        return jsonify({"msg": "User ID tidak valid"}), 400

    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "User tidak ditemukan"}), 404
    
    count_dasar = db.session.query(func.count(BasicAssessment.id)).filter_by(user_id=current_user_id).scalar() or 0
    count_madya = db.session.query(func.count(MadyaAssessment.id)).filter_by(user_id=current_user_id).scalar() or 0
    count_ai = db.session.query(func.count(RiskAssessment.id)).filter_by(user_id=current_user_id).scalar() or 0
    count_template_peta = db.session.query(func.count(RiskMapTemplate.id)).filter_by(user_id=current_user_id, is_default=False).scalar() or 0
    count_horizon = db.session.query(func.count(HorizonScanResult.id)).filter_by(user_id=current_user_id).scalar() or 0
    count_qrc_standard = db.session.query(func.count(QrcAssessment.id)).filter_by(user_id=current_user_id, assessment_type='standard').scalar() or 0
    count_qrc_essay = db.session.query(func.count(QrcAssessment.id)).filter_by(user_id=current_user_id, assessment_type='essay').scalar() or 0

    assessment_limits = {
        "dasar": {"count": count_dasar, "limit": user.limit_dasar},
        "madya": {"count": count_madya, "limit": user.limit_madya},
        "ai": {"count": count_ai, "limit": user.limit_ai},
        "template_peta": {"count": count_template_peta, "limit": user.limit_template_peta},
        "horizon": {"count": count_horizon, "limit": user.limit_horizon}
    }
    
    phone_number = getattr(user, 'phone_number', None)
    institution = getattr(user, 'institution', None)

    return jsonify({
        "id": user.id,
        "nama_lengkap": user.nama_lengkap,
        "email": user.email,
        "phone_number": phone_number,
        "institution": institution,   
        "assessment_limits": assessment_limits,
        "department_id": user.department_id,
        "department_name": user.department.name if user.department else None,
        "limit_qrc_standard": user.limit_qrc_standard,
        "limit_qrc_essay": user.limit_qrc_essay,
        "usage_qrc_standard": count_qrc_standard,
        "usage_qrc_essay": count_qrc_essay
    }), 200

# === ENDPOINT BARU UNTUK UPDATE AKUN ===
@auth_bp.route('/account/update', methods=['PUT']) # Atau ganti auth_bp
@jwt_required()
def update_account_details():
    """Memperbarui detail (non-sensitif) pengguna yang sedang login."""
    current_user_id_str = get_jwt_identity()
    try:
        current_user_id = int(current_user_id_str)
    except ValueError:
        return jsonify({"msg": "User ID tidak valid"}), 400
    
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "User tidak ditemukan"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body tidak boleh kosong"}), 400
    
    claims = get_jwt()
    is_admin = claims.get("role") == "admin"
    
    updated = False

    # Field yang boleh diupdate oleh user sendiri
    allowed_profile_updates = ['nama_lengkap', 'phone_number']
    for field in allowed_profile_updates:
        if field in data:
            setattr(user, field, data[field])
            updated = True

    if is_admin and 'assessment_limits' in data:
        limits_data = data['assessment_limits']
        limit_fields = {
            "dasar": "limit_dasar",
            "madya": "limit_madya",
            "ai": "limit_ai",
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
                    pass

    if updated:
        try:
            db.session.commit()
            return jsonify({"msg": "Profil berhasil diperbarui."}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating profile: {e}") # Log error di server
            return jsonify({"msg": "Gagal memperbarui profil."}), 500
    else:
        return jsonify({"msg": "Tidak ada data yang valid untuk diperbarui."}), 400
    
@auth_bp.route('/account/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Mengubah password pengguna yang sedang login."""
    current_user_id_str = get_jwt_identity()
    try:
        current_user_id = int(current_user_id_str)
    except ValueError:
        return jsonify({"msg": "User ID tidak valid"}), 400

    user = User.query.get(current_user_id)
    if not user:
        # Seharusnya tidak terjadi jika token valid, tapi cek untuk keamanan
        return jsonify({"msg": "User tidak ditemukan"}), 404

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"msg": "Password lama dan baru wajib diisi."}), 400

    # 1. Verifikasi password lama
    if not bcrypt.check_password_hash(user.password_hash, old_password):
        return jsonify({"msg": "Password lama salah."}), 401 # Unauthorized

    # 3. Hash password baru
    new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

    # 4. Update hash di database
    user.password_hash = new_hashed_password
    try:
        db.session.commit()
        return jsonify({"msg": "Password berhasil diperbarui."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error changing password for user {user.id}: {e}")
        return jsonify({"msg": "Gagal memperbarui password."}), 500