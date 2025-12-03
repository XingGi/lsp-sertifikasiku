# backend/app/routes/competency.py
from flask import request, jsonify, Blueprint
from app.models import db, CompetencyTest, CertificationScheme
from flask_jwt_extended import jwt_required, get_jwt_identity

competency_bp = Blueprint('competency_bp', __name__)

@competency_bp.route('/competency-tests', methods=['POST'])
@jwt_required()
def create_competency_test():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('scheme_id'):
         return jsonify({"msg": "Judul dan Skema wajib diisi"}), 400
     
    scheme = CertificationScheme.query.get(data['scheme_id'])
    if not scheme:
        return jsonify({"msg": "Skema tidak ditemukan"}), 404

    new_test = CompetencyTest(
        title=data['title'],
        description=f"Uji Kompetensi untuk Skema: {scheme.title}", # Auto description
        scheme_id=data['scheme_id'], # Save Relasi
        created_by_id=current_user_id,
        status='DRAFT'
    )
    
    try:
        db.session.add(new_test)
        db.session.commit()
        return jsonify({
            "msg": "Competency test created successfully",
            "id": new_test.id,
            "title": new_test.title
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating competency test: {e}")
        return jsonify({"msg": "Failed to create data"}), 500

@competency_bp.route('/competency-tests', methods=['GET'])
@jwt_required()
def get_competency_tests():
    tests = CompetencyTest.query.order_by(CompetencyTest.created_at.desc()).all()
    
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
        })
        
    return jsonify(result), 200

@competency_bp.route('/competency-tests/<int:id>', methods=['GET'])
@jwt_required()
def get_competency_test_detail(id):
    test = CompetencyTest.query.get_or_404(id)
    
    return jsonify({
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "status": test.status,
        "created_at": test.created_at.isoformat() if test.created_at else None,
        "scheme_name": test.scheme.title if test.scheme else "-"
    }), 200