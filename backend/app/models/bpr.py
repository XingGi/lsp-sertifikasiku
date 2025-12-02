# backend/app/models/bpr.py
from app import db
from datetime import datetime
import json

class BprDocument(db.Model):
    """
    Header dokumen Business Process Review (BPR).
    Mendukung versioning dan siklus hidup (Lifecycle).
    """
    __tablename__ = 'bpr_documents'

    id = db.Column(db.Integer, primary_key=True)
    
    # Informasi Dasar
    name = db.Column(db.String(255), nullable=False) # Nama Proses (misal: "Rekrutmen Karyawan")
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Versioning & Siklus Hidup
    period = db.Column(db.String(50)) # Contoh: "2025-Q1"
    version = db.Column(db.Integer, default=1) # Versi urut: 1, 2, 3...
    status = db.Column(db.String(50), default='Draft') # Draft, In Review, Final, Archived
    
    # Cloning History (Parent)
    # Jika dokumen ini hasil kloning dari periode lalu, catat ID asalnya
    parent_document_id = db.Column(db.Integer, db.ForeignKey('bpr_documents.id'), nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    change_log = db.Column(db.Text, nullable=True) # Catatan perubahan jika revisi

    # Relasi
    department = db.relationship('Department')
    creator = db.relationship('User')
    # Relasi ke dirinya sendiri (History)
    parent = db.relationship('BprDocument', remote_side=[id], backref='children')
    
    # Relasi ke komponen diagram
    nodes = db.relationship('BprNode', backref='document', lazy=True, cascade="all, delete-orphan")
    edges = db.relationship('BprEdge', backref='document', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<BprDocument {self.name} v{self.version}>'

class BprNode(db.Model):
    """
    Menyimpan data Node (Langkah Proses) untuk React Flow.
    """
    __tablename__ = 'bpr_nodes'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('bpr_documents.id'), nullable=False)
    
    # React Flow Specifics
    react_flow_id = db.Column(db.String(100), nullable=False) # ID unik di kanvas (misal: "node-1")
    type = db.Column(db.String(50), default='default') # Tipe node (start, process, decision, end)
    label = db.Column(db.Text, nullable=True) # Teks dalam kotak
    
    # Posisi (Koordinat X, Y di kanvas)
    position_x = db.Column(db.Float, default=0)
    position_y = db.Column(db.Float, default=0)
    
    # Style & Data Tambahan (disimpan sebagai JSON string agar fleksibel)
    # Contoh: warna background, ukuran, dll.
    style_config = db.Column(db.Text, nullable=True) 

    # Relasi ke Risiko (Risk Overlay)
    risks = db.relationship('BprRisk', backref='node', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<BprNode {self.label}>'

class BprEdge(db.Model):
    """
    Menyimpan data Edge (Garis Penghubung) untuk React Flow.
    """
    __tablename__ = 'bpr_edges'

    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('bpr_documents.id'), nullable=False)
    
    # React Flow Specifics
    react_flow_id = db.Column(db.String(100), nullable=False) # ID unik edge
    source_node_ref = db.Column(db.String(100), nullable=False) # ID React Flow node asal
    target_node_ref = db.Column(db.String(100), nullable=False) # ID React Flow node tujuan
    
    label = db.Column(db.String(100), nullable=True) # Label garis (misal: "Ya", "Tidak")
    animated = db.Column(db.Boolean, default=False) # Apakah garis bergerak?

    def __repr__(self):
        return f'<BprEdge {self.source_node_ref} -> {self.target_node_ref}>'

class BprRisk(db.Model):
    """
    Data Risiko & Kontrol yang menempel pada sebuah Node Langkah.
    """
    __tablename__ = 'bpr_risks'

    id = db.Column(db.Integer, primary_key=True)
    node_id = db.Column(db.Integer, db.ForeignKey('bpr_nodes.id'), nullable=False)
    
    # Identifikasi
    risk_code = db.Column(db.String(50), nullable=True)
    risk_description = db.Column(db.Text, nullable=False)
    risk_cause = db.Column(db.Text, nullable=True)
    risk_impact = db.Column(db.Text, nullable=True)
    
    # Kontrol (Existing)
    existing_control = db.Column(db.Text, nullable=True)
    control_effectiveness = db.Column(db.String(50), nullable=True) # Efektif / Tidak Efektif
    
    # Penilaian (Simple High/Medium/Low atau 1-5)
    inherent_risk_level = db.Column(db.String(50), nullable=True)
    residual_risk_level = db.Column(db.String(50), nullable=True)
    
    # Approval Status (Penting untuk workflow kolaboratif)
    approval_status = db.Column(db.String(50), default='Draft') # Draft, Approved, Rejected
    reviewer_notes = db.Column(db.Text, nullable=True) # Catatan dari Manajer Risiko

    def __repr__(self):
        return f'<BprRisk {self.risk_code}>'