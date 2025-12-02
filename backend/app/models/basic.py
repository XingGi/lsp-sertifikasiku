# backend/app/models/basic.py
from app import db
from datetime import datetime

# Tabel Asosiasi
basic_assessment_contexts = db.Table('basic_assessment_contexts',
    db.Column('basic_assessment_id', db.Integer, db.ForeignKey('basic_assessments.id'), primary_key=True),
    db.Column('organizational_context_id', db.Integer, db.ForeignKey('organizational_contexts.id'), primary_key=True)
)

class OrganizationalContext(db.Model):
    __tablename__ = 'organizational_contexts'
    id = db.Column(db.Integer, primary_key=True)
    external_context = db.Column(db.Text, nullable=False)
    internal_context = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return f'<OrganizationalContext {self.id}>'

class BasicAssessment(db.Model):
    __tablename__ = 'basic_assessments'

    id = db.Column(db.Integer, primary_key=True)
    nama_unit_kerja = db.Column(db.String(200), nullable=False)
    nama_perusahaan = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    contexts = db.relationship('OrganizationalContext', secondary=basic_assessment_contexts, lazy='subquery',
                               backref=db.backref('basic_assessments', lazy=True))
    risks = db.relationship('BasicRiskIdentification', backref='assessment', lazy=True, cascade="all, delete-orphan")
    risk_analyses = db.relationship('BasicRiskAnalysis', backref='assessment', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<BasicAssessment {self.nama_unit_kerja}>'

class BasicRiskIdentification(db.Model):
    __tablename__ = 'basic_risk_identifications'
    id = db.Column(db.Integer, primary_key=True)
    
    kode_risiko = db.Column(db.String(50), nullable=True)
    kategori_risiko = db.Column(db.String(100), nullable=False)
    unit_kerja = db.Column(db.String(200), nullable=False)
    sasaran = db.Column(db.Text, nullable=True)
    tanggal_identifikasi = db.Column(db.Date, nullable=False)
    deskripsi_risiko = db.Column(db.Text, nullable=False)
    akar_penyebab = db.Column(db.Text, nullable=True)
    indikator_risiko = db.Column(db.Text, nullable=True)
    internal_control = db.Column(db.Text, nullable=True)
    deskripsi_dampak = db.Column(db.Text, nullable=True)
    
    assessment_id = db.Column(db.Integer, db.ForeignKey('basic_assessments.id'), nullable=False)

    def __repr__(self):
        return f'<BasicRiskIdentification {self.kode_risiko}>'

class BasicRiskAnalysis(db.Model):
    __tablename__ = 'basic_risk_analysis'
    id = db.Column(db.Integer, primary_key=True)
    
    risk_identification_id = db.Column(db.Integer, db.ForeignKey('basic_risk_identifications.id'), nullable=False, unique=True)
    
    probabilitas = db.Column(db.Integer, nullable=True)
    dampak = db.Column(db.Integer, nullable=True)
    probabilitas_kualitatif = db.Column(db.Float, nullable=True)
    dampak_finansial = db.Column(db.Float, nullable=True)
    
    assessment_id = db.Column(db.Integer, db.ForeignKey('basic_assessments.id'), nullable=False)

    risk_identification = db.relationship('BasicRiskIdentification', backref=db.backref("analysis", uselist=False))

    def __repr__(self):
        return f'<BasicRiskAnalysis for Risk ID: {self.risk_identification_id}>'