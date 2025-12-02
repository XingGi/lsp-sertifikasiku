# backend/app/models/risk_assessment.py
from app import db
from datetime import datetime

class RiskAssessment(db.Model):
    """Model untuk proyek asesmen risiko (AI Module)."""
    __tablename__ = 'risk_assessments'

    id = db.Column(db.Integer, primary_key=True)
    nama_asesmen = db.Column(db.String(200), nullable=False)
    tanggal_mulai = db.Column(db.Date, nullable=False)
    tanggal_selesai = db.Column(db.Date, nullable=True)
    
    # Company Information
    company_industry = db.Column(db.String(100))
    company_type = db.Column(db.String(100))
    company_assets = db.Column(db.String(50))
    currency = db.Column(db.String(10))
    risk_limit = db.Column(db.Float)
    
    # Risk Categories
    risk_categories = db.Column(db.Text)
    
    # Project Context
    project_objective = db.Column(db.Text)
    relevant_regulations = db.Column(db.Text)
    involved_departments = db.Column(db.Text)
    completed_actions = db.Column(db.Text)
    additional_risk_context = db.Column(db.Text)
    
    # Foreign Key ke User
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relasi
    risk_register_entries = db.relationship('RiskRegister', backref='assessment', lazy=True, cascade="all, delete-orphan")
    
    # AI Analysis Fields
    ai_executive_summary = db.Column(db.Text, nullable=True)
    ai_risk_profile_analysis = db.Column(db.Text, nullable=True)
    ai_immediate_priorities = db.Column(db.Text, nullable=True)
    ai_critical_risks_discussion = db.Column(db.Text, nullable=True)
    ai_implementation_plan = db.Column(db.Text, nullable=True)
    ai_next_steps = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<RiskAssessment {self.nama_asesmen}>'

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

class MainRiskRegister(db.Model):
    """Model untuk Risk Register terpusat."""
    __tablename__ = 'main_risk_register'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    title = db.Column(db.Text, nullable=True)
    
    kode_risiko = db.Column(db.String(50))
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
    
    status = db.Column(db.String(50), default='Open')
    treatment_option = db.Column(db.String(50), default='Reduce')

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    source_assessment_id = db.Column(db.Integer, db.ForeignKey('risk_assessments.id'), nullable=True)

    def __repr__(self):
        return f'<MainRiskRegister {self.kode_risiko}>'