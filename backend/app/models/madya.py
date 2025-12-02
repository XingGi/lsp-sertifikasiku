# backend/app/models/madya.py
from app import db
from datetime import datetime

# --- Template Peta Risiko ---
class RiskMapTemplate(db.Model):
    __tablename__ = 'risk_map_templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    likelihood_labels = db.relationship('RiskMapLikelihoodLabel', backref='template', lazy=True, cascade="all, delete-orphan")
    impact_labels = db.relationship('RiskMapImpactLabel', backref='template', lazy=True, cascade="all, delete-orphan")
    level_definitions = db.relationship('RiskMapLevelDefinition', backref='template', lazy=True, cascade="all, delete-orphan")
    scores = db.relationship('RiskMapScore', backref='template', lazy=True, cascade="all, delete-orphan")
    madya_assessments = db.relationship('MadyaAssessment', back_populates='risk_map_template', lazy=True)

class RiskMapLikelihoodLabel(db.Model):
    __tablename__ = 'risk_map_likelihood_labels'
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('risk_map_templates.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(100), nullable=False)

class RiskMapImpactLabel(db.Model):
    __tablename__ = 'risk_map_impact_labels'
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('risk_map_templates.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(100), nullable=False)

class RiskMapLevelDefinition(db.Model):
    __tablename__ = 'risk_map_level_definitions'
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('risk_map_templates.id'), nullable=False)
    level_name = db.Column(db.String(100), nullable=False)
    color_hex = db.Column(db.String(7), nullable=False)
    min_score = db.Column(db.Integer, nullable=False)
    max_score = db.Column(db.Integer, nullable=False)
    
class RiskMapScore(db.Model):
    __tablename__ = 'risk_map_scores'
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('risk_map_templates.id'), nullable=False)
    likelihood_level = db.Column(db.Integer, nullable=False)
    impact_level = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)

# --- Asesmen Madya ---
class MadyaAssessment(db.Model):
    __tablename__ = 'madya_assessments'
    id = db.Column(db.Integer, primary_key=True)
    nama_asesmen = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    risk_map_template_id = db.Column(db.Integer, db.ForeignKey('risk_map_templates.id'), nullable=True)
    risk_map_template = db.relationship('RiskMapTemplate', back_populates='madya_assessments')
    
    structure_image_filename = db.Column(db.String(300), nullable=True)
    structure_entries = db.relationship('OrganizationalStructureEntry', backref='assessment', lazy=True, cascade="all, delete-orphan")
    sasaran_kpi_entries = db.relationship('SasaranOrganisasiKPI', back_populates='assessment', lazy=True, cascade="all, delete-orphan", order_by='SasaranOrganisasiKPI.id')
    risk_inputs = db.relationship('RiskInputMadya', back_populates='assessment', lazy=True, cascade="all, delete-orphan")
    
    probability_criteria = db.relationship('MadyaCriteriaProbability', backref='assessment', lazy=True, cascade="all, delete-orphan")
    impact_criteria = db.relationship('MadyaCriteriaImpact', backref='assessment', lazy=True, cascade="all, delete-orphan")
    
    filter_organisasi = db.Column(db.String(200), nullable=True)
    filter_direktorat = db.Column(db.String(200), nullable=True)
    filter_divisi = db.Column(db.String(200), nullable=True)
    filter_departemen = db.Column(db.String(200), nullable=True)
    
    def __repr__(self):
        return f'<MadyaAssessment {self.id} - {self.nama_asesmen}>'

class MadyaCriteriaProbability(db.Model):
    __tablename__ = 'madya_criteria_probability'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('madya_assessments.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    parameter = db.Column(db.String(255), nullable=True)
    kemungkinan = db.Column(db.Text, nullable=True)
    frekuensi = db.Column(db.Text, nullable=True)
    persentase = db.Column(db.Text, nullable=True)

class MadyaCriteriaImpact(db.Model):
    __tablename__ = 'madya_criteria_impact'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('madya_assessments.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    kriteriaDampak = db.Column(db.String(255), nullable=True)
    rangeFinansial = db.Column(db.Text, nullable=True)
    deskripsiDampak1 = db.Column(db.Text, nullable=True)
    stra_dampak = db.Column(db.Text, nullable=True)
    hukum_pelanggaran = db.Column(db.Text, nullable=True)
    kepat_pelanggaran = db.Column(db.Text, nullable=True)
    reput_keluhan = db.Column(db.Text, nullable=True)
    reput_berita = db.Column(db.Text, nullable=True)
    reput_saing = db.Column(db.Text, nullable=True)
    sdm_keluhan = db.Column(db.Text, nullable=True)
    sdm_turnover = db.Column(db.Text, nullable=True)
    sdm_regretted_turnover = db.Column(db.Text, nullable=True)
    sistem_gangguan = db.Column(db.Text, nullable=True)
    sistem_siber = db.Column(db.Text, nullable=True)
    sistem_platform = db.Column(db.Text, nullable=True)
    ops_sla = db.Column(db.Text, nullable=True)
    hsse_fatality_1 = db.Column(db.Text, nullable=True)
    hsse_fatality_2 = db.Column(db.Text, nullable=True)
    hsse_fatality_3 = db.Column(db.Text, nullable=True)
    hsse_kerusakan_lingkungan = db.Column(db.Text, nullable=True)
    hsse_penurunan_esg = db.Column(db.Text, nullable=True)
    pmn_tunda = db.Column(db.Text, nullable=True)
    bank_fraud = db.Column(db.Text, nullable=True)
    asuransi_aset_rating = db.Column(db.Text, nullable=True)
    asuransi_aset_peringkat = db.Column(db.Text, nullable=True)
    aktu_rasio = db.Column(db.Text, nullable=True)

class OrganizationalStructureEntry(db.Model):
    __tablename__ = 'organizational_structure_entries'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('madya_assessments.id'), nullable=False)
    direktorat = db.Column(db.String(200), nullable=True)
    divisi = db.Column(db.String(200), nullable=True)
    unit_kerja = db.Column(db.String(200), nullable=True)

class SasaranOrganisasiKPI(db.Model):
    __tablename__ = 'sasaran_organisasi_kpi'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('madya_assessments.id'), nullable=False)
    sasaran_kpi = db.Column(db.Text, nullable=False)
    target_level = db.Column(db.String(50), nullable=True)
    inherent_risk_score = db.Column(db.Integer, nullable=True)
    residual_risk_score = db.Column(db.Integer, nullable=True)

    assessment = db.relationship('MadyaAssessment', back_populates='sasaran_kpi_entries')
    risk_inputs = db.relationship('RiskInputMadya', back_populates='sasaran_organisasi', lazy=True)

class RiskInputMadya(db.Model):
    __tablename__ = 'risk_input_madya'
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('madya_assessments.id'), nullable=False)
    sasaran_id = db.Column(db.Integer, db.ForeignKey('sasaran_organisasi_kpi.id'), nullable=True)

    kode_risiko = db.Column(db.String(50), nullable=True)
    status_risiko = db.Column(db.String(50), default='Risiko Aktif')
    peluang_ancaman = db.Column(db.String(50), default='Ancaman')
    kategori_risiko = db.Column(db.String(100))
    kategori_risiko_lainnya = db.Column(db.String(200), nullable=True)
    unit_kerja = db.Column(db.String(200))
    tanggal_identifikasi = db.Column(db.Date, default=datetime.utcnow)
    deskripsi_risiko = db.Column(db.Text)
    akar_penyebab = db.Column(db.Text, nullable=True)
    indikator_risiko = db.Column(db.Text, nullable=True)
    internal_control = db.Column(db.Text, nullable=True)
    deskripsi_dampak = db.Column(db.Text, nullable=True)

    inherent_probabilitas = db.Column(db.Integer)
    inherent_dampak = db.Column(db.Integer)
    inherent_skor = db.Column(db.Integer, nullable=True)
    inherent_prob_kualitatif = db.Column(db.Float, nullable=True)
    inherent_dampak_finansial = db.Column(db.Float, nullable=True)
    inherent_nilai_bersih = db.Column(db.Float, nullable=True)

    pemilik_risiko = db.Column(db.String(150), nullable=True)
    jabatan_pemilik = db.Column(db.String(150), nullable=True)
    kontak_pemilik_hp = db.Column(db.String(50), nullable=True)
    kontak_pemilik_email = db.Column(db.String(120), nullable=True)

    strategi = db.Column(db.String(100), nullable=True)
    rencana_penanganan = db.Column(db.Text, nullable=True)
    biaya_penanganan = db.Column(db.Float, nullable=True)
    penanganan_dilakukan = db.Column(db.Text, nullable=True)
    status_penanganan = db.Column(db.String(50), nullable=True)
    jadwal_mulai_penanganan = db.Column(db.Date, nullable=True)
    jadwal_selesai_penanganan = db.Column(db.Date, nullable=True)
    pic_penanganan = db.Column(db.String(150), nullable=True)

    residual_probabilitas = db.Column(db.Integer, nullable=True)
    residual_dampak = db.Column(db.Integer, nullable=True)
    residual_skor = db.Column(db.Integer, nullable=True)
    residual_prob_kualitatif = db.Column(db.Float, nullable=True)
    residual_dampak_finansial = db.Column(db.Float, nullable=True)
    residual_nilai_bersih = db.Column(db.Float, nullable=True)
    tanggal_review = db.Column(db.Date, nullable=True)

    assessment = db.relationship('MadyaAssessment', back_populates='risk_inputs')
    sasaran_organisasi = db.relationship('SasaranOrganisasiKPI', back_populates='risk_inputs')