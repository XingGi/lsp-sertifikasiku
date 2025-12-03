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
    
    # Status: DRAFT, PUBLISHED, ONGOING, COMPLETED
    status = db.Column(db.String(50), default='DRAFT', nullable=False)
    
    scheme_id = db.Column(db.Integer, db.ForeignKey('certification_schemes.id'), nullable=True)
    scheme = db.relationship('CertificationScheme', back_populates='competency_tests')
    
    # Audit Trail (Standard English)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relasi ke User
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relasi backref
    creator = db.relationship('User', backref=db.backref('created_competency_tests', lazy=True))

    def __repr__(self):
        return f'<CompetencyTest {self.title}>'