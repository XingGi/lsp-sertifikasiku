# backend/app/models/qrc.py

from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB

class QrcAssessment(db.Model):
    __tablename__ = 'qrc_assessments'

    id = db.Column(db.Integer, primary_key=True)
    
    # --- Identitas Pengisi (Client) ---
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    assessment_type = db.Column(db.String(50), default='standard')
    
    status = db.Column(db.String(20), default='submitted', index=True) 
    submission_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated_date = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # --- Hasil Scoring (System Generated) ---
    risk_score = db.Column(db.Float, default=0.0) 
    risk_level = db.Column(db.String(50))
    
    answers_data = db.Column(JSONB, default={})
    
    # --- Bagian Consultant (Reviewer) ---
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    
    consultant_notes = db.Column(db.Text, nullable=True)
    ai_generated_analysis = db.Column(db.Text, nullable=True)
    final_report_content = db.Column(db.Text, nullable=True)
    
    is_archived = db.Column(db.Boolean, default=False, index=True)

    # --- Relasi ---
    client = db.relationship('User', foreign_keys=[user_id], backref='qrc_submissions')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by_id], backref='qrc_reviews')

    def to_dict(self):
        """Helper untuk konversi ke JSON response"""
        return {
            'id': self.id,
            'client_name': self.client.nama_lengkap if self.client else 'Unknown',
            'client_email': self.client.email if self.client else '-',
            # Asumsi model User punya field 'institution', jika tidak ada bisa dihapus
            'institution': getattr(self.client, 'institution', '-'),
            'assessment_type': self.assessment_type,
            'status': self.status,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewer_name': self.reviewer.nama_lengkap if self.reviewer else '-',
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'answers_data': self.answers_data,
            'consultant_notes': self.consultant_notes,
            # AI Analysis & Final Report mungkin hanya ditampilkan di dashboard Consultant
            'ai_generated_analysis': self.ai_generated_analysis,
            'final_report_content': self.final_report_content,
            'is_archived': self.is_archived
        }
        
class QrcQuestion(db.Model):
    __tablename__ = 'qrc_questions'

    id = db.Column(db.Integer, primary_key=True)
    
    # Tipe: 'standard' (Multiple Choice) atau 'essay'
    question_type = db.Column(db.String(50), nullable=False, default='standard')
    
    # Kategori / Dimensi (contoh: 'Tata Kelola & Budaya')
    category = db.Column(db.String(100), nullable=False)
    
    # Isi Pertanyaan
    text = db.Column(db.Text, nullable=False)
    
    # Khusus Standard: Pilihan Ganda (JSON) -> [{"label": "Ya", "value": 10}, ...]
    options = db.Column(JSONB, nullable=True)
    
    # Khusus Essay: Placeholder teks
    placeholder = db.Column(db.String(255), nullable=True)
    
    # Urutan tampilan
    order = db.Column(db.Integer, default=0)
    
    # Status aktif
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'question_type': self.question_type,
            'category': self.category,
            'text': self.text,
            'options': self.options,
            'placeholder': self.placeholder,
            'order': self.order,
            'is_active': self.is_active
        }