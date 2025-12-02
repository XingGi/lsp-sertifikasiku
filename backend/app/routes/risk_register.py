# backend/app/routes/risk_register.py
from flask import request, jsonify, Blueprint
from app.models import MainRiskRegister
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

# Membuat Blueprint untuk Main Risk Register
risk_register_bp = Blueprint('risk_register_bp', __name__)

@risk_register_bp.route('/risk-register', methods=['GET'])
@jwt_required()
def get_main_risk_register():
    """Mengambil semua risiko dari register utama milik pengguna."""
    current_user_id = get_jwt_identity()
    risks = MainRiskRegister.query.filter_by(user_id=current_user_id).order_by(MainRiskRegister.created_at.desc()).all()
    
    risk_list = [{
        "id": r.id,
        "title": r.title,
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
        "status": r.status,
        "treatment_option": r.treatment_option,
        "created_at": r.created_at.isoformat()
    } for r in risks]
    
    return jsonify(risk_list)


@risk_register_bp.route('/risk-register/<int:risk_id>', methods=['PUT'])
@jwt_required()
def update_main_risk_register_item(risk_id):
    """Memperbarui satu item di Main Risk Register."""
    current_user_id = get_jwt_identity()
    risk_item = MainRiskRegister.query.filter_by(id=risk_id, user_id=current_user_id).first_or_404()

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Request body tidak boleh kosong"}), 400
    
    fields_to_update = [
        'title', 'objective', 'deskripsi_risiko', 'risk_causes', 'risk_impacts', 
        'existing_controls', 'control_effectiveness', 'mitigation_plan', 
        'inherent_likelihood', 'inherent_impact', 'residual_likelihood', 
        'residual_impact', 'status', 'treatment_option'
    ]

    # Loop melalui semua field yang bisa di-update
    for field in fields_to_update:
        if field in data:
            setattr(risk_item, field, data[field])
    
    db.session.commit()
    return jsonify({"msg": "Item risk register berhasil diperbarui.", "risk": {
        "id": risk_item.id,
        "kode_risiko": risk_item.kode_risiko,
        "objective": risk_item.objective,
        "title": risk_item.title
    }}), 200

@risk_register_bp.route('/risk-register/<int:risk_id>', methods=['DELETE'])
@jwt_required()
def delete_main_risk_register_item(risk_id):
    """Menghapus satu item dari Main Risk Register."""
    current_user_id = get_jwt_identity()
    risk_item = MainRiskRegister.query.filter_by(id=risk_id, user_id=current_user_id).first_or_404()

    db.session.delete(risk_item)
    db.session.commit()
    
    return jsonify({"msg": "Item risk register berhasil dihapus."}), 200

@risk_register_bp.route('/risk-register/bulk-delete', methods=['POST'])
@jwt_required()
def bulk_delete_main_risk_register_items():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    risk_ids_to_delete = data.get('risk_ids')

    if not risk_ids_to_delete:
        return jsonify({"msg": "Tidak ada ID risiko yang diberikan"}), 400

    # Hapus hanya risiko yang dimiliki oleh user yang sedang login
    MainRiskRegister.query.filter(
        MainRiskRegister.id.in_(risk_ids_to_delete),
        MainRiskRegister.user_id == current_user_id
    ).delete(synchronize_session=False)
    
    db.session.commit()
    return jsonify({"msg": f"{len(risk_ids_to_delete)} risiko berhasil dihapus."}), 200