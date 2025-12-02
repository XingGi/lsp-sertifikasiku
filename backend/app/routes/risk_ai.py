# backend/app/routes/risk_ai.py
import os
import json
from flask import request, jsonify, Blueprint
from app.models import db, User, RiskAssessment, RiskRegister, MainRiskRegister
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from app.ai_services import analyze_assessment_with_gemini, generate_detailed_risk_analysis_with_gemini

# Membuat Blueprint untuk fitur Risk Management AI
risk_ai_bp = Blueprint('risk_ai_bp', __name__)

# --- Endpoint untuk Risk Assessment ---

@risk_ai_bp.route('/assessments', methods=['POST'])
@jwt_required()
def create_assessment():
    """Endpoint untuk membuat proyek risk assessment baru."""
    current_user_id = get_jwt_identity()
    
    user = User.query.get(current_user_id)
    if user.limit_ai is not None:
        current_count = db.session.query(func.count(RiskAssessment.id)).filter_by(user_id=current_user_id).scalar() or 0
        if current_count >= user.limit_ai:
            return jsonify({"msg": f"Kuota Asesmen AI penuh ({current_count}/{user.limit_ai})."}), 403
    
    data = request.get_json()

    # Validasi input
    if not data or not data.get('nama_asesmen'):
        return jsonify({"msg": "Nama asesmen wajib diisi"}), 400

    # Validasi minimal 1 kategori risiko
    if not data.get('risk_categories') or len(data.get('risk_categories')) == 0:
        return jsonify({"msg": "Pilih minimal satu Kategori Risiko."}), 400

    # Coba konversi risk_limit ke float, default ke 0 jika gagal atau tidak ada
    try:
        risk_limit_val = float(data.get('risk_limit', 0))
    except (ValueError, TypeError):
        risk_limit_val = 0

    # Buat instance RiskAssessment baru
    new_assessment = RiskAssessment(
        nama_asesmen=data['nama_asesmen'],
        tanggal_mulai=datetime.utcnow().date(),
        company_industry=data.get('company_industry'),
        company_type=data.get('company_type'),
        company_assets=data.get('company_assets'),
        currency=data.get('currency'),
        risk_limit=risk_limit_val,
        risk_categories=",".join(data.get('risk_categories', [])),
        project_objective=data.get('project_objective'),
        relevant_regulations=data.get('relevant_regulations'),
        involved_departments=data.get('involved_departments'),
        completed_actions=data.get('completed_actions'),
        additional_risk_context=data.get('additional_risk_context'),
        user_id=current_user_id
    )

    db.session.add(new_assessment)
    db.session.commit()

    return jsonify({
        "msg": "Risk assessment berhasil dibuat",
        "assessment_id": new_assessment.id
    }), 201
    
@risk_ai_bp.route('/assessments', methods=['GET'])
@jwt_required()
def get_all_assessments():
    """Mengambil semua proyek asesmen milik pengguna (hanya data ringkas)."""
    current_user_id = get_jwt_identity()
    assessments = RiskAssessment.query.filter_by(user_id=current_user_id).order_by(RiskAssessment.tanggal_mulai.desc()).all()
    
    assessment_list = []
    for a in assessments:
        assessment_list.append({
            "id": a.id,
            "nama_asesmen": a.nama_asesmen,
            "tanggal_mulai": a.tanggal_mulai.isoformat(),
            "tanggal_selesai": a.tanggal_selesai.isoformat() if a.tanggal_selesai else None,
            # --- TAMBAHAN BARU: Sertakan data industri dan risiko ---
            "company_industry": a.company_industry,
            "risks": [{
                "inherent_likelihood": r.inherent_likelihood,
                "inherent_impact": r.inherent_impact
            } for r in a.risk_register_entries]
        })
        
    return jsonify(assessment_list)

@risk_ai_bp.route('/assessments/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment_details(assessment_id):
    """Mengambil data detail dari satu asesmen, termasuk risk register-nya."""
    current_user_id = get_jwt_identity()
    assessment = RiskAssessment.query.filter_by(id=assessment_id, user_id=current_user_id).first_or_404()
    
    creator_user = User.query.get(assessment.user_id)
    created_by_user_name = creator_user.nama_lengkap if creator_user else "N/A"
    created_by_user_email = creator_user.email if creator_user else ""
    
    risk_entries = [{
        "id": r.id,
        "kode_risiko": r.kode_risiko,
        "objective": r.objective,
        "risk_type": r.risk_type,
        "deskripsi_risiko": r.deskripsi_risiko,
        "risk_causes": r.risk_causes,
        "risk_impacts": r.risk_impacts,
        "existing_controls": r.existing_controls,
        "control_effectiveness": r.control_effectiveness,
        "inherent_likelihood": r.inherent_likelihood,
        "inherent_impact": r.inherent_impact,
        "mitigation_plan": r.mitigation_plan,
        "residual_likelihood": r.residual_likelihood,
        "residual_impact": r.residual_impact,
    } for r in assessment.risk_register_entries]
    
    def safe_json_loads(json_string):
        if not json_string: return None
        try:
            return json.loads(json_string)
        except (json.JSONDecodeError, TypeError):
            return None
    
    return jsonify({
        "id": assessment.id,
        "nama_asesmen": assessment.nama_asesmen,
        "tanggal_mulai": assessment.tanggal_mulai.isoformat(),
        "created_by_user_name": created_by_user_name,
        "created_by_user_email": created_by_user_email,
        "company_industry": assessment.company_industry,
        "company_type": assessment.company_type,
        "company_assets": assessment.company_assets,
        "currency": assessment.currency,
        "risk_limit": assessment.risk_limit,
        "risk_categories": assessment.risk_categories,
        "project_objective": assessment.project_objective,
        "relevant_regulations": assessment.relevant_regulations,
        "involved_departments": assessment.involved_departments,
        "completed_actions": assessment.completed_actions,
        "additional_risk_context": assessment.additional_risk_context,
        "risks": risk_entries,
        "ai_executive_summary": assessment.ai_executive_summary,
        "ai_risk_profile_analysis": safe_json_loads(assessment.ai_risk_profile_analysis),
        "ai_immediate_priorities": safe_json_loads(assessment.ai_immediate_priorities),
        "ai_critical_risks_discussion": safe_json_loads(assessment.ai_critical_risks_discussion),
        "ai_implementation_plan": safe_json_loads(assessment.ai_implementation_plan),
        "ai_next_steps": assessment.ai_next_steps,
    })

@risk_ai_bp.route('/assessments/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    """Menghapus Risk Assessment AI beserta semua data terkaitnya."""
    current_user_id = get_jwt_identity()
    
    # Cari asesmen milik user
    assessment = RiskAssessment.query.filter_by(id=assessment_id, user_id=current_user_id).first_or_404(
        "Asesmen tidak ditemukan atau bukan milik Anda."
    )
    
    try:
        MainRiskRegister.query.filter_by(
            source_assessment_id=assessment_id, 
            user_id=current_user_id
        ).update({"source_assessment_id": None}, synchronize_session=False)
        
        db.session.delete(assessment)
        db.session.commit()
        
        return jsonify({"msg": f"Asesmen '{assessment.nama_asesmen}' dan semua risiko terkait berhasil dihapus."}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting assessment {assessment_id}: {e}")
        return jsonify({"msg": "Gagal menghapus asesmen. Terjadi kesalahan internal."}), 500
    
@risk_ai_bp.route('/assessments/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_assessments():
    """Menghapus beberapa Risk Assessment AI berdasarkan daftar ID."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    requested_ids = data.get('risk_ids') # Harapannya ini adalah array [1, 2, 3]

    if not requested_ids or not isinstance(requested_ids, list):
        return jsonify({"msg": "Data 'risk_ids' (berupa array) wajib diisi."}), 400

    try:
        valid_assessments_to_delete = RiskAssessment.query.with_entities(RiskAssessment.id).filter(
            RiskAssessment.id.in_(requested_ids),
            RiskAssessment.user_id == current_user_id
        ).all()
        
        valid_ids = [a_id[0] for a_id in valid_assessments_to_delete]
        num_deleted = len(valid_ids)
        
        if num_deleted == 0:
             return jsonify({"msg": "Tidak ada asesmen yang ditemukan atau Anda tidak punya izin untuk menghapusnya."}), 404

        MainRiskRegister.query.filter(
            MainRiskRegister.source_assessment_id.in_(valid_ids),
            MainRiskRegister.user_id == current_user_id
        ).update({"source_assessment_id": None}, synchronize_session=False)
        
        RiskRegister.query.filter(
            RiskRegister.assessment_id.in_(valid_ids)
        ).delete(synchronize_session=False)

        RiskAssessment.query.filter(
            RiskAssessment.id.in_(valid_ids)
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({"msg": f"{num_deleted} asesmen berhasil dihapus."}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error during bulk delete assessments: {e}") 
        return jsonify({"msg": "Gagal menghapus asesmen. Terjadi kesalahan internal pada database."}), 500
    
# === ENDPOINT ANALISIS AI ===
@risk_ai_bp.route('/assessments/analyze', methods=['POST'])
@jwt_required()
def analyze_assessment():
    current_user_id = get_jwt_identity()
    form_data = request.get_json()
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User tidak ditemukan"}), 404
        
    # Cek jika limit AI di-set (bukan None)
    if user.limit_ai is not None:
        # Hitung jumlah asesmen AI yang sudah dibuat user
        current_ai_count = db.session.query(func.count(RiskAssessment.id)).filter_by(user_id=current_user_id).scalar() or 0
        
        if current_ai_count >= user.limit_ai:
            return jsonify({
                "msg": f"Batas pembuatan Asesmen AI Anda telah tercapai ({current_ai_count}/{user.limit_ai}). Hubungi admin untuk menambah kuota."
            }), 403 #

    # --- Validasi Input ---
    if not form_data or not form_data.get('nama_asesmen'):
        return jsonify({"msg": "Nama asesmen wajib diisi"}), 400
    if not form_data.get('risk_categories'):
        return jsonify({"msg": "Pilih minimal satu Kategori Risiko."}), 400

    # 1. Buat Asesmen Terlebih Dahulu
    new_assessment = RiskAssessment(
        nama_asesmen=form_data.get('nama_asesmen'),
        tanggal_mulai=datetime.utcnow().date(),
        company_industry=form_data.get('company_industry'),
        company_type=form_data.get('company_type'),
        company_assets=form_data.get('company_assets'),
        currency=form_data.get('currency'),
        risk_limit=float(form_data.get('risk_limit', 0)),
        risk_categories=",".join(form_data.get('risk_categories', [])),
        project_objective=form_data.get('project_objective'),
        relevant_regulations=form_data.get('relevant_regulations'),
        involved_departments=form_data.get('involved_departments'),
        completed_actions=form_data.get('completed_actions'),
        additional_risk_context=form_data.get('additional_risk_context'),
        user_id=current_user_id
    )
    db.session.add(new_assessment)
    db.session.flush()
    assessment_id = new_assessment.id

    # 2. Panggil Layanan AI  ---
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        db.session.rollback()
        return jsonify({"msg": "Konfigurasi API Key AI tidak ditemukan."}), 500
        
    identified_risks = analyze_assessment_with_gemini(form_data, gemini_api_key)

    # 3. Simpan hasil identifikasi ke RiskRegister
    if identified_risks:
        for i, risk in enumerate(identified_risks):
            def safe_int(value):
                try:
                    return int(value)
                except (ValueError, TypeError):
                    return None
            
            risk_type_prefix = risk.get('risk_type', 'XX').upper()
            kode_risiko_unik = f"A{assessment_id}-{risk_type_prefix}{str(i+1).zfill(2)}"
            
            generated_title = risk.get('title')
            if not generated_title or generated_title.strip() == "":
                deskripsi = risk.get('deskripsi_risiko', 'Risiko Tanpa Judul')
                generated_title = ' '.join(deskripsi.split()[:7]) + '...'

            new_risk_entry = RiskRegister(
                kode_risiko=kode_risiko_unik,
                title=generated_title,
                objective=risk.get('objective'),
                risk_type=risk.get('risk_type'),
                deskripsi_risiko=risk.get('deskripsi_risiko'),
                risk_causes=risk.get('risk_causes'),
                risk_impacts=risk.get('risk_impacts'),
                existing_controls=risk.get('existing_controls'),
                control_effectiveness=risk.get('control_effectiveness'),
                mitigation_plan=risk.get('mitigation_plan'),
                assessment_id=assessment_id,
                
                inherent_likelihood=safe_int(risk.get('inherent_likelihood')),
                inherent_impact=safe_int(risk.get('inherent_impact')),
                residual_likelihood=safe_int(risk.get('residual_likelihood')),
                residual_impact=safe_int(risk.get('residual_impact')),
            )
            db.session.add(new_risk_entry)
    else:
        db.session.rollback() # Batalkan jika AI gagal membuat risiko
        return jsonify({"msg": "Asesmen gagal dibuat, analisis AI tidak mengembalikan risiko.", "assessment_id": assessment_id}), 500

    db.session.commit()
    return jsonify({"msg": "Analisis risiko AI berhasil dan disimpan.", "assessment_id": assessment_id}), 201

@risk_ai_bp.route('/assessments/<int:assessment_id>/generate-summary', methods=['POST'])
@jwt_required()
def generate_summary_for_assessment(assessment_id):
    current_user_id = get_jwt_identity()
    assessment = RiskAssessment.query.filter_by(id=assessment_id, user_id=current_user_id).first_or_404()

    # Cek apakah summary sudah ada (jangan generate ulang jika tidak perlu)
    if assessment.ai_executive_summary:
        print(f"Summary untuk Asesmen {assessment_id} sudah ada. Mengembalikan data lama.")
        # Kita perlu memuat ulang data yang sudah di-JSON-kan
        def safe_json_loads(json_string):
            if not json_string: return None
            try: return json.loads(json_string)
            except (json.JSONDecodeError, TypeError): return None
            
        return jsonify({
            "ai_executive_summary": assessment.ai_executive_summary,
            "ai_risk_profile_analysis": safe_json_loads(assessment.ai_risk_profile_analysis),
            "ai_immediate_priorities": safe_json_loads(assessment.ai_immediate_priorities),
            "ai_critical_risks_discussion": safe_json_loads(assessment.ai_critical_risks_discussion),
            "ai_implementation_plan": safe_json_loads(assessment.ai_implementation_plan),
            "ai_next_steps": assessment.ai_next_steps,
        }), 200 # 200 OK (bukan 201 Created)

    # Jika summary belum ada, panggil AI
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        return jsonify({"msg": "Konfigurasi API Key AI tidak ditemukan."}), 500

    # Kumpulkan data risiko yang sudah ada di DB
    risks_from_db = assessment.risk_register_entries
    risk_list_for_ai = [
        {
            "kode_risiko": r.kode_risiko,
            "deskripsi_risiko": r.deskripsi_risiko,
            "inherent_likelihood": r.inherent_likelihood,
            "inherent_impact": r.inherent_impact,
            "risk_type": r.risk_type
        } for r in risks_from_db
    ]

    print(f"Membuat ringkasan untuk Asesmen {assessment_id}...")
    analysis_content = generate_detailed_risk_analysis_with_gemini(risk_list_for_ai, gemini_api_key)
    
    if analysis_content:
        # Simpan hasil ke asesmen yang ada
        assessment.ai_executive_summary = analysis_content.get("executive_summary")
        assessment.ai_risk_profile_analysis = json.dumps(analysis_content.get("risk_profile_analysis"))
        assessment.ai_immediate_priorities = json.dumps(analysis_content.get("immediate_priorities"))
        assessment.ai_critical_risks_discussion = json.dumps(analysis_content.get("critical_risks_discussion"))
        assessment.ai_implementation_plan = json.dumps(analysis_content.get("implementation_plan"))
        assessment.ai_next_steps = analysis_content.get("next_steps")
        
        db.session.commit()
        print("Analisis detail berhasil dibuat dan disimpan.")
        
        # Kembalikan data yang baru saja dibuat
        return jsonify(analysis_content), 200
    else:
        return jsonify({"msg": "Gagal membuat ringkasan eksekutif."}), 500

@risk_ai_bp.route('/risks/<int:risk_id>', methods=['PUT'])
@jwt_required()
def update_risk_item(risk_id):
    """Memperbarui detail satu item risiko."""
    current_user_id = get_jwt_identity()
    
    # Cari risk item berdasarkan ID-nya
    risk_item = RiskRegister.query.get_or_404(risk_id)

    # Otorisasi: Pastikan risk item ini milik asesmen yang dibuat oleh user yang sedang login
    assessment_owner_id = str(risk_item.assessment.user_id)
    if assessment_owner_id != current_user_id:
        return jsonify({"msg": "Akses ditolak. Anda bukan pemilik asesmen ini."}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body tidak boleh kosong"}), 400

    # Update semua field yang mungkin diubah dari sidebar
    risk_item.objective = data.get('objective', risk_item.objective)
    risk_item.deskripsi_risiko = data.get('deskripsi_risiko', risk_item.deskripsi_risiko)
    risk_item.risk_causes = data.get('risk_causes', risk_item.risk_causes)
    risk_item.risk_impacts = data.get('risk_impacts', risk_item.risk_impacts)
    risk_item.existing_controls = data.get('existing_controls', risk_item.existing_controls)
    risk_item.control_effectiveness = data.get('control_effectiveness', risk_item.control_effectiveness)
    risk_item.mitigation_plan = data.get('mitigation_plan', risk_item.mitigation_plan)
    
    # Helper untuk memastikan nilai integer tidak error jika kosong
    def safe_int(value, default):
        try:
            return int(value) if value is not None else default
        except (ValueError, TypeError):
            return default

    risk_item.inherent_likelihood = safe_int(data.get('inherent_likelihood'), risk_item.inherent_likelihood)
    risk_item.inherent_impact = safe_int(data.get('inherent_impact'), risk_item.inherent_impact)
    risk_item.residual_likelihood = safe_int(data.get('residual_likelihood'), risk_item.residual_likelihood)
    risk_item.residual_impact = safe_int(data.get('residual_impact'), risk_item.residual_impact)

    # Simpan perubahan ke database
    db.session.commit()

    return jsonify({"msg": "Item risiko berhasil diperbarui."}), 200

@risk_ai_bp.route('/risk-register/import', methods=['POST'])
@jwt_required()
def import_to_main_register():
    """Mengimpor risiko dari asesmen ke register utama."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    risk_ids_to_import = data.get('risk_ids')

    if not risk_ids_to_import:
        return jsonify({"msg": "Tidak ada ID risiko yang diberikan"}), 400

    imported_count = 0
    for risk_id in risk_ids_to_import:
        original_risk = RiskRegister.query.get(risk_id)
        
        # Otorisasi: pastikan risiko ini milik pengguna
        if original_risk and str(original_risk.assessment.user_id) == current_user_id:
            new_main_risk = MainRiskRegister(
                title=original_risk.title,
                kode_risiko=original_risk.kode_risiko,
                objective=original_risk.objective,
                risk_type=original_risk.risk_type,
                deskripsi_risiko=original_risk.deskripsi_risiko,
                risk_causes=original_risk.risk_causes,
                risk_impacts=original_risk.risk_impacts,
                existing_controls=original_risk.existing_controls,
                control_effectiveness=original_risk.control_effectiveness,
                inherent_likelihood=original_risk.inherent_likelihood,
                inherent_impact=original_risk.inherent_impact,
                mitigation_plan=original_risk.mitigation_plan,
                residual_likelihood=original_risk.residual_likelihood,
                residual_impact=original_risk.residual_impact,
                user_id=current_user_id,
                source_assessment_id=original_risk.assessment_id
            )
            db.session.add(new_main_risk)
            imported_count += 1
            
    db.session.commit()
    return jsonify({"msg": f"{imported_count} risiko berhasil diimpor ke Register Utama."}), 201