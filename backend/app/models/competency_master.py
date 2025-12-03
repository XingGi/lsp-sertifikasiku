# backend/app/models/competency_master.py
from app import db
from datetime import datetime

# Tabel Asosiasi (Many-to-Many) antara Skema dan Unit
scheme_units = db.Table('scheme_units',
    db.Column('scheme_id', db.Integer, db.ForeignKey('certification_schemes.id'), primary_key=True),
    db.Column('unit_id', db.Integer, db.ForeignKey('competency_units.id'), primary_key=True)
)

class CompetencyUnit(db.Model):
    """
    Master Data: Gudang Unit Kompetensi
    Table: competency_units
    """
    __tablename__ = 'competency_units'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False) # Kode Unit
    title = db.Column(db.String(255), nullable=False)            # Judul Unit
    standard_type = db.Column(db.String(255), nullable=False)     # SKKNI/Internasional/Khusus
    description = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<CompetencyUnit {self.code}>'

class CertificationScheme(db.Model):
    """
    Master Data: Skema Sertifikasi (Kumpulan Unit)
    Table: certification_schemes
    """
    __tablename__ = 'certification_schemes'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='ACTIVE') # ACTIVE, INACTIVE
    
    # Relasi ke Unit (Many-to-Many)
    units = db.relationship('CompetencyUnit', secondary=scheme_units, lazy='subquery',
        backref=db.backref('schemes', lazy=True))
        
    # Relasi ke Uji Kompetensi (One-to-Many)
    competency_tests = db.relationship('CompetencyTest', back_populates='scheme', lazy=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<CertificationScheme {self.title}>'