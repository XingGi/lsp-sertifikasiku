# backend/app/models/competency_master.py
from app import db
from datetime import datetime

# Tabel Asosiasi: Kelompok Pekerjaan <-> Unit Kompetensi
job_group_units = db.Table('scheme_job_group_units',
    db.Column('job_group_id', db.Integer, db.ForeignKey('scheme_job_groups.id'), primary_key=True),
    db.Column('unit_id', db.Integer, db.ForeignKey('competency_units.id'), primary_key=True)
)

class CompetencyUnit(db.Model):
    __tablename__ = 'competency_units'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    standard_type = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<CompetencyUnit {self.code}>'

class CertificationScheme(db.Model):
    __tablename__ = 'certification_schemes'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='ACTIVE') 
    
    # Relasi Baru: Skema punya banyak Kelompok Pekerjaan
    job_groups = db.relationship('SchemeJobGroup', backref='scheme', lazy=True, cascade="all, delete-orphan")
    
    # Relasi ke Uji Kompetensi (Tetap)
    competency_tests = db.relationship('CompetencyTest', back_populates='scheme', lazy=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SchemeJobGroup(db.Model):
    """
    Menampung 'Kelompok Pekerjaan' atau 'Klaster'.
    Contoh: 'Pengukuran Risiko', 'Mitigasi Risiko'.
    """
    __tablename__ = 'scheme_job_groups'
    id = db.Column(db.Integer, primary_key=True)
    scheme_id = db.Column(db.Integer, db.ForeignKey('certification_schemes.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False) # Nama Kelompok
    
    # Relasi ke Unit (Many-to-Many via job_group_units)
    units = db.relationship('CompetencyUnit', secondary=job_group_units, lazy='subquery',
        backref=db.backref('job_groups', lazy=True))
    
    # Relasi ke Bukti (One-to-Many)
    evidences = db.relationship('SchemeEvidence', backref='job_group', lazy=True, cascade="all, delete-orphan")

class SchemeEvidence(db.Model):
    """
    Daftar bukti yang diperlukan untuk kelompok pekerjaan ini.
    Contoh: 'Laporan Keuangan', 'Sertifikat Pelatihan'.
    """
    __tablename__ = 'scheme_evidences'
    id = db.Column(db.Integer, primary_key=True)
    job_group_id = db.Column(db.Integer, db.ForeignKey('scheme_job_groups.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False) # Nama Bukti
    description = db.Column(db.Text, nullable=True)
    is_mandatory = db.Column(db.Boolean, default=True)