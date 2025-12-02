# backend/app/models/rsca.py
from app import db
from datetime import datetime

# Tabel Asosiasi Many-to-Many antara Cycle dan Department
rsca_cycle_departments = db.Table('rsca_cycle_departments',
    db.Column('rsca_cycle_id', db.Integer, db.ForeignKey('rsca_cycles.id'), primary_key=True),
    db.Column('department_id', db.Integer, db.ForeignKey('departments.id'), primary_key=True)
)

class RscaCycle(db.Model):
    __tablename__ = 'rsca_cycles'
    id = db.Column(db.Integer, primary_key=True)
    nama_siklus = db.Column(db.String(200), nullable=False)
    tanggal_mulai = db.Column(db.Date, nullable=False)
    tanggal_selesai = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Draft')
    ai_summary = db.Column(db.Text, nullable=True)
    institution = db.Column(db.String(255), nullable=True)

    # Relasi Many-to-Many ke Department (gunakan string 'Department')
    departments = db.relationship('Department', secondary=rsca_cycle_departments, back_populates='rsca_cycles')
    questionnaires = db.relationship('RscaQuestionnaire', backref='cycle', lazy=True, cascade="all, delete-orphan")
    submitted_risks = db.relationship('SubmittedRisk', back_populates='cycle', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<RscaCycle {self.nama_siklus}>'

class RscaQuestionnaire(db.Model):
    __tablename__ = 'rsca_questionnaires'
    id = db.Column(db.Integer, primary_key=True)
    pertanyaan = db.Column(db.Text, nullable=False)
    kategori = db.Column(db.String(100), nullable=True)
    question_type = db.Column(db.String(50), nullable=False, default='text')
    
    cycle_id = db.Column(db.Integer, db.ForeignKey('rsca_cycles.id'), nullable=False)

    def __repr__(self):
        return f'<RscaQuestionnaire {self.id}>'

class RscaAnswer(db.Model):
    __tablename__ = 'rsca_answers'
    id = db.Column(db.Integer, primary_key=True)
    jawaban = db.Column(db.Text, nullable=True)
    catatan = db.Column(db.Text, nullable=True)
    control_effectiveness_rating = db.Column(db.String(50), nullable=True)
    
    cycle_id = db.Column(db.Integer, db.ForeignKey('rsca_cycles.id'), nullable=False)
    questionnaire_id = db.Column(db.Integer, db.ForeignKey('rsca_questionnaires.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    
    risk_register_id = db.Column(db.Integer, db.ForeignKey('risk_register.id'), nullable=True)
    
    questionnaire = db.relationship('RscaQuestionnaire')
    department = db.relationship('Department')
    action_plans = db.relationship('ActionPlan', back_populates='origin_answer', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<RscaAnswer {self.id}>'

class SubmittedRisk(db.Model):
    __tablename__ = 'submitted_risks'
    id = db.Column(db.Integer, primary_key=True)
    risk_description = db.Column(db.Text, nullable=False)
    potential_cause = db.Column(db.Text, nullable=True)
    potential_impact = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Menunggu Persetujuan')
    
    submitted_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    institution = db.Column(db.String(255), nullable=False)
    cycle_id = db.Column(db.Integer, db.ForeignKey('rsca_cycles.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    submitter = db.relationship('User')
    department = db.relationship('Department')
    cycle = db.relationship('RscaCycle', back_populates='submitted_risks')
    action_plans = db.relationship('ActionPlan', back_populates='origin_submitted_risk', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<SubmittedRisk {self.id} (Status: {self.status})>'

class ActionPlan(db.Model):
    __tablename__ = 'action_plans'
    id = db.Column(db.Integer, primary_key=True)
    action_description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Belum Mulai')
    due_date = db.Column(db.Date, nullable=True)
    
    assigned_department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    institution = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    origin_answer_id = db.Column(db.Integer, db.ForeignKey('rsca_answers.id'), nullable=True)
    origin_submitted_risk_id = db.Column(db.Integer, db.ForeignKey('submitted_risks.id'), nullable=True)

    assigned_department = db.relationship('Department')
    creator = db.relationship('User')
    origin_answer = db.relationship('RscaAnswer', back_populates='action_plans')
    origin_submitted_risk = db.relationship('SubmittedRisk', back_populates='action_plans')

    def __repr__(self):
        return f'<ActionPlan {self.id}>'