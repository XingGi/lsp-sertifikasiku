# backend/app/models/risk_assessment.py
from app import db
from datetime import datetime

class RiskRegister(db.Model):
    """Model untuk setiap entri risiko dalam sebuah asesmen (AI)."""
    __tablename__ = 'risk_register'

    id = db.Column(db.Integer, primary_key=True)
    kode_risiko = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.Text, nullable=True)
    
    objective = db.Column(db.Text)
    risk_type = db.Column(db.String(50))
    deskripsi_risiko = db.Column(db.Text)
    risk_causes = db.Column(db.Text)
    risk_impacts = db.Column(db.Text)
    existing_controls = db.Column(db.Text)
    control_effectiveness = db.Column(db.String(50))
    mitigation_plan = db.Column(db.Text)
    
    inherent_likelihood = db.Column(db.Integer)
    inherent_impact = db.Column(db.Integer)
    residual_likelihood = db.Column(db.Integer)
    residual_impact = db.Column(db.Integer)

    assessment_id = db.Column(db.Integer, db.ForeignKey('risk_assessments.id'), nullable=False)
    
    # Relasi ke Process Steps didefinisikan di sisi ProcessStep (master.py) dengan backref

    def __repr__(self):
        return f'<RiskRegister {self.kode_risiko}>'