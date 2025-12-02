# backend/app/routes/qrc.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, desc, asc
from datetime import datetime
from app import db
from app.models.qrc import QrcAssessment, QrcQuestion
from app.models.user import User
from app.ai_services import analyze_qrc_assessment

qrc_bp = Blueprint('qrc', __name__)

# --- Helper Function: Hitung Skor ---
def calculate_risk_score(answers):
    # Asumsi: frontend mengirim nilai 0, 5, atau 10 untuk setiap key q1..q20
    total_score = 0
    max_score = 20 * 10 # 200
    
    for key, val in answers.items():
        if isinstance(val, (int, float)):
            total_score += val
            
    # Normalisasi 0-100
    return round((total_score / max_score) * 100, 2)

def determine_risk_level(score):
    if score >= 80: return "Low Risk (Optimized)"
    elif score >= 50: return "Medium Risk (Managed)"
    else: return "High Risk (Vulnerable)"

# Helper: Cek Permission Admin (Untuk Template Management)
def check_admin_permission(user_id):
    user = User.query.get(user_id)
    # Pastikan user punya permission 'manage_qrc_templates' atau role Admin
    if not user or not (user.has_permission('manage_qrc_templates') or user.has_role('Admin')):
        return False
    return True

# ==========================================
#  CLIENT ENDPOINTS (User QRC)
# ==========================================

@qrc_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_assessment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    answers = data.get('answers', {})
    assess_type = data.get('assessment_type', 'standard')
    
    # PERBAIKAN: Handle NoneType dengan fallback default
    # Default Limit: Standard=2, Essay=1 (Jika di DB masih NULL)
    limit_standard = user.limit_qrc_standard if user.limit_qrc_standard is not None else 2
    limit_essay = user.limit_qrc_essay if user.limit_qrc_essay is not None else 1

    # Pilih limit sesuai tipe
    limit = limit_essay if assess_type == 'essay' else limit_standard
    
    current_count = QrcAssessment.query.filter_by(
        user_id=user_id, 
        assessment_type=assess_type
    ).count()

    if current_count >= limit:
        return jsonify({
            "msg": f"Batas kuota habis! Anda hanya memiliki limit {limit} x asesmen untuk tipe ini."
        }), 403
    
    final_score = 0
    risk_lvl = "Menunggu Review"
    status = 'submitted'

    if assess_type == 'standard':
        final_score = calculate_risk_score(answers)
        risk_lvl = determine_risk_level(final_score)
        status = 'completed'
    else:
        # Untuk Essay, skor 0 dulu (nanti dinilai manual/AI)
        final_score = 0
        risk_lvl = "Analisis Kualitatif"
        status = 'submitted'
    
    new_qrc = QrcAssessment(
        user_id=user_id,
        assessment_type=assess_type,
        answers_data=answers,
        risk_score=final_score,
        risk_level=risk_lvl,
        status=status,
        is_archived=False
    )
    
    db.session.add(new_qrc)
    db.session.commit()
    
    return jsonify({
        "msg": "Submitted successfully", 
        "id": new_qrc.id, 
        "score": final_score, 
        "level": risk_lvl,
    }), 201

@qrc_bp.route('/my-history', methods=['GET'])
@jwt_required()
def my_history():
    user_id = get_jwt_identity()
    assessments = QrcAssessment.query.filter_by(user_id=user_id).order_by(desc(QrcAssessment.submission_date)).all()
    return jsonify([a.to_dict() for a in assessments]), 200

@qrc_bp.route('/my-limits', methods=['GET'])
@jwt_required()
def my_limits():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Hitung penggunaan saat ini
    used_standard = QrcAssessment.query.filter_by(user_id=user_id, assessment_type='standard').count()
    used_essay = QrcAssessment.query.filter_by(user_id=user_id, assessment_type='essay').count()
    
    # PERBAIKAN UTAMA: Handle NoneType dengan fallback ke nilai default (2 dan 1)
    # Jika user.limit_qrc_... adalah None, gunakan angka default
    limit_std = user.limit_qrc_standard if user.limit_qrc_standard is not None else 2
    limit_ess = user.limit_qrc_essay if user.limit_qrc_essay is not None else 1
    
    return jsonify({
        "standard": {
            "limit": limit_std,
            "used": used_standard,
            "remaining": max(0, limit_std - used_standard)
        },
        "essay": {
            "limit": limit_ess,
            "used": used_essay,
            "remaining": max(0, limit_ess - used_essay)
        }
    }), 200

# ==========================================
#  TEMPLATE DATA ENDPOINTS (User & Admin)
# ==========================================

# 1. Get Active Questions (Untuk Wizard Client)
@qrc_bp.route('/questions', methods=['GET'])
@jwt_required()
def get_questions():
    # Ambil parameter type (standard/essay)
    q_type = request.args.get('type', 'standard')
    
    # Ambil pertanyaan yang aktif saja, urutkan berdasarkan order
    questions = QrcQuestion.query.filter_by(
        question_type=q_type, 
        is_active=True
    ).order_by(asc(QrcQuestion.order)).all()
    
    return jsonify([q.to_dict() for q in questions]), 200

# ==========================================
#  CONSULTANT ENDPOINTS (Dashboard)
# ==========================================

# 1. Dashboard Stats (Card Counter)
@qrc_bp.route('/consultant/stats', methods=['GET'])
@jwt_required()
def consultant_stats():
    # TODO: Tambahkan pengecekan role di sini (pastikan user adalah Consultant/Admin)
    
    total = QrcAssessment.query.count()
    submitted = QrcAssessment.query.filter_by(status='submitted').count()
    in_review = QrcAssessment.query.filter_by(status='in_review').count()
    completed = QrcAssessment.query.filter_by(status='completed').count()
    
    return jsonify({
        "total_assessments": total,
        "pending_review": submitted,
        "in_progress": in_review,
        "completed": completed
    }), 200

# 2. List All Assessments (Search, Filter, Sort)
@qrc_bp.route('/consultant/list', methods=['GET'])
@jwt_required()
def list_assessments():
    status_filter = request.args.get('status') 
    search_query = request.args.get('search') 
    
    # Filter Arsip
    show_archived = request.args.get('archived', 'false') == 'true'
    
    query = QrcAssessment.query.join(User, QrcAssessment.user_id == User.id)
    
    # PERBAIKAN DISINI: Handle data legacy yang is_archived-nya NULL
    if show_archived:
        # Jika tab Arsip, cari yang True
        query = query.filter(QrcAssessment.is_archived == True)
    else:
        # Jika tab Inbox, cari yang False ATAU None (Null)
        query = query.filter(or_(QrcAssessment.is_archived == False, QrcAssessment.is_archived == None))

    # Filter Status (jika ada)
    if status_filter and status_filter != 'all':
        query = query.filter(QrcAssessment.status == status_filter)
        
    # Search Logic
    if search_query:
        search = f"%{search_query}%"
        query = query.filter(
            or_(
                User.nama_lengkap.ilike(search),
                User.institution.ilike(search),
            )
        )
        
    query = query.order_by(desc(QrcAssessment.submission_date))
    assessments = query.all()
    
    return jsonify([a.to_dict() for a in assessments]), 200

@qrc_bp.route('/consultant/<int:id>/archive', methods=['PUT'])
@jwt_required()
def archive_assessment(id):
    assessment = QrcAssessment.query.get_or_404(id)
    assessment.is_archived = True
    db.session.commit()
    return jsonify({"msg": "Asesmen berhasil diarsipkan"}), 200

@qrc_bp.route('/consultant/<int:id>/restore', methods=['PUT'])
@jwt_required()
def restore_assessment(id):
    assessment = QrcAssessment.query.get_or_404(id)
    assessment.is_archived = False
    db.session.commit()
    return jsonify({"msg": "Asesmen dikembalikan ke Inbox"}), 200

# 3. Get Detail Assessment
@qrc_bp.route('/consultant/<int:id>', methods=['GET'])
@jwt_required()
def get_detail(id):
    assessment = QrcAssessment.query.get_or_404(id)
    return jsonify(assessment.to_dict()), 200

# 4. Update Review & Status (Flag)
@qrc_bp.route('/consultant/<int:id>/review', methods=['PUT'])
@jwt_required()
def update_review(id):
    reviewer_id = get_jwt_identity()
    data = request.get_json()
    
    assessment = QrcAssessment.query.get_or_404(id)
    
    # Update Status (Flag)
    if 'status' in data:
        assessment.status = data['status']
        
    # Update Notes
    if 'consultant_notes' in data:
        assessment.consultant_notes = data['consultant_notes']
        
    # Update AI/Final Report
    if 'final_report_content' in data:
        assessment.final_report_content = data['final_report_content']
        
    if 'risk_score' in data:
        new_score = float(data['risk_score'])
        assessment.risk_score = new_score
        
        assessment.risk_level = determine_risk_level(new_score)
        
    # Set Reviewer Metadata
    assessment.reviewed_by_id = reviewer_id
    assessment.reviewed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({"msg": "Review updated", "status": assessment.status, "risk_score": assessment.risk_score, "risk_level": assessment.risk_level}), 200

# 6. Get All Questions Reference (For Review Workspace)
# Endpoint ini mengambil SEMUA pertanyaan (aktif & non-aktif) untuk keperluan mapping
@qrc_bp.route('/consultant/questions', methods=['GET'])
@jwt_required()
def consultant_get_questions():
    q_type = request.args.get('type', 'standard')
    # Ambil SEMUA pertanyaan (tanpa filter is_active) agar history tetap terbaca
    questions = QrcQuestion.query.filter_by(question_type=q_type).all()
    return jsonify([q.to_dict() for q in questions]), 200

# 5. Generate AI Analysis (NEW)
@qrc_bp.route('/consultant/<int:id>/generate-ai', methods=['POST'])
@jwt_required()
def generate_ai_analysis(id):
    # Pastikan user punya permission consultant
    # (Opsional: Tambah pengecekan role/permission di sini jika perlu strict)
    
    assessment = QrcAssessment.query.get_or_404(id)
    
    # Panggil Service AI
    try:
        analysis_result = analyze_qrc_assessment(
            assessment_type=assessment.assessment_type,
            answers_data=assessment.answers_data,
            client_name=assessment.client.nama_lengkap,
            institution=getattr(assessment.client, 'institution', '-')
        )
        
        # Simpan hasil ke database (update field ai_generated_analysis)
        assessment.ai_generated_analysis = analysis_result
        
        # Opsional: Jika Laporan Final masih kosong, isi juga dengan hasil AI
        if not assessment.final_report_content:
            assessment.final_report_content = analysis_result
            
        db.session.commit()
        
        return jsonify({
            "msg": "AI Analysis generated successfully",
            "analysis": analysis_result
        }), 200
        
    except Exception as e:
        return jsonify({"msg": f"AI Generation failed: {str(e)}"}), 500

# ==========================================
#  ADMIN TEMPLATE MANAGEMENT (CRUD)
# ==========================================

# 2. Get All Questions (Untuk Admin Editor - Termasuk yang tidak aktif)
@qrc_bp.route('/admin/questions', methods=['GET'])
@jwt_required()
def admin_get_all_questions():
    current_user_id = get_jwt_identity()
    if not check_admin_permission(current_user_id):
        return jsonify({"msg": "Unauthorized"}), 403

    q_type = request.args.get('type', 'standard')
    questions = QrcQuestion.query.filter_by(question_type=q_type).order_by(asc(QrcQuestion.order)).all()
    return jsonify([q.to_dict() for q in questions]), 200

# 3. Create New Question
@qrc_bp.route('/admin/questions', methods=['POST'])
@jwt_required()
def create_question():
    current_user_id = get_jwt_identity()
    if not check_admin_permission(current_user_id):
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    
    # Hitung order otomatis (taruh di paling bawah)
    last_q = QrcQuestion.query.filter_by(question_type=data.get('question_type', 'standard'))\
             .order_by(desc(QrcQuestion.order)).first()
    new_order = (last_q.order + 1) if last_q else 1

    new_question = QrcQuestion(
        question_type=data.get('question_type', 'standard'),
        category=data.get('category', 'General'),
        text=data.get('text', ''),
        options=data.get('options'), # Bisa null jika essay
        placeholder=data.get('placeholder'), # Bisa null jika standard
        order=new_order,
        is_active=True
    )
    
    db.session.add(new_question)
    db.session.commit()
    
    return jsonify({"msg": "Question created", "question": new_question.to_dict()}), 201

# 4. Update Question
@qrc_bp.route('/admin/questions/<int:id>', methods=['PUT'])
@jwt_required()
def update_question(id):
    current_user_id = get_jwt_identity()
    if not check_admin_permission(current_user_id):
        return jsonify({"msg": "Unauthorized"}), 403

    question = QrcQuestion.query.get_or_404(id)
    data = request.get_json()
    
    if 'text' in data: question.text = data['text']
    if 'category' in data: question.category = data['category']
    if 'options' in data: question.options = data['options']
    if 'placeholder' in data: question.placeholder = data['placeholder']
    if 'is_active' in data: question.is_active = data['is_active']
    if 'order' in data: question.order = data['order']
    
    db.session.commit()
    return jsonify({"msg": "Question updated", "question": question.to_dict()}), 200

# 5. Delete Question
@qrc_bp.route('/admin/questions/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_question(id):
    current_user_id = get_jwt_identity()
    if not check_admin_permission(current_user_id):
        return jsonify({"msg": "Unauthorized"}), 403

    question = QrcQuestion.query.get_or_404(id)
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({"msg": "Question deleted"}), 200