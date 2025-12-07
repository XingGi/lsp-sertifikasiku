# backend/app/models/competency.py
from app import db
from datetime import datetime

class CompetencyTest(db.Model):
    """
    Table: competency_tests
    Menyimpan header kegiatan uji kompetensi.
    """
    __tablename__ = 'competency_tests'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='DRAFT', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scheme_id = db.Column(db.Integer, db.ForeignKey('certification_schemes.id'), nullable=True)
    
    workflow_template_id = db.Column(db.Integer, db.ForeignKey('workflow_templates.id'), nullable=True)
    current_task_id = db.Column(db.Integer, db.ForeignKey('workflow_tasks.id'), nullable=True)
    
    creator = db.relationship('User', backref=db.backref('created_competency_tests', lazy=True))
    scheme = db.relationship('CertificationScheme', back_populates='competency_tests')
    workflow = db.relationship('WorkflowTemplate')
    current_task = db.relationship('WorkflowTask')
    progress_entries = db.relationship('UjiKompProgress', backref='test', lazy=True)

    def __repr__(self):
        return f'<CompetencyTest {self.title}>'