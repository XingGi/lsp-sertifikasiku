# backend/app/models/workflow.py
from app import db
from datetime import datetime

class WorkflowTemplate(db.Model):
    __tablename__ = 'workflow_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False) # e.g. "Skenario Uji Kompetensi 2025"
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    stages = db.relationship('WorkflowStage', backref='template', order_by='WorkflowStage.order_index', cascade="all, delete-orphan")

class WorkflowStage(db.Model):
    __tablename__ = 'workflow_stages'
    
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('workflow_templates.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False) # e.g. "Tahap 1: Pendaftaran"
    order_index = db.Column(db.Integer, nullable=False)
    
    tasks = db.relationship('WorkflowTask', backref='stage', order_by='WorkflowTask.order_index', cascade="all, delete-orphan")

class WorkflowTask(db.Model):
    __tablename__ = 'workflow_tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    stage_id = db.Column(db.Integer, db.ForeignKey('workflow_stages.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False) # e.g. "2.1 Upload KTP"
    order_index = db.Column(db.Integer, nullable=False)
    task_type = db.Column(db.String(50), nullable=False) 
    content_config = db.Column(db.JSON, nullable=True) 
    
    is_required = db.Column(db.Boolean, default=True)

class UjiKompProgress(db.Model):
    """Menyimpan jawaban user per task"""
    __tablename__ = 'uji_komp_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('competency_tests.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('workflow_tasks.id'), nullable=False)
    
    status = db.Column(db.String(50), default='DRAFT')
    user_response = db.Column(db.JSON, nullable=True) 
    submitted_at = db.Column(db.DateTime, nullable=True)
    assessor_notes = db.Column(db.Text, nullable=True)