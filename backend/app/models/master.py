# backend/app/models/master.py
from app import db
from datetime import datetime
from sqlalchemy import JSON

class MasterData(db.Model):
    __tablename__ = 'master_data'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False, index=True)
    key = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<MasterData {self.category} - {self.key}>'
    
class Regulation(db.Model):
    __tablename__ = 'regulations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    filename = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Regulation {self.name}>'

class CriticalAsset(db.Model):
    __tablename__ = 'critical_assets'
    id = db.Column(db.Integer, primary_key=True)
    nama_aset = db.Column(db.String(200), nullable=False)
    tipe_aset = db.Column(db.String(100), nullable=False)
    deskripsi = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return f'<CriticalAsset {self.nama_aset}>'

class Dependency(db.Model):
    __tablename__ = 'dependencies'
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('critical_assets.id'), nullable=False)
    depends_on_asset_id = db.Column(db.Integer, db.ForeignKey('critical_assets.id'), nullable=False)

    asset = db.relationship('CriticalAsset', foreign_keys=[asset_id], backref='dependencies_on')
    depends_on = db.relationship('CriticalAsset', foreign_keys=[depends_on_asset_id], backref='depended_on_by')

    def __repr__(self):
        return f'<Dependency: Asset {self.asset_id} depends on {self.depends_on_asset_id}>'

class ImpactScenario(db.Model):
    __tablename__ = 'impact_scenarios'
    id = db.Column(db.Integer, primary_key=True)
    nama_skenario = db.Column(db.String(200), nullable=False)
    deskripsi = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def __repr__(self):
        return f'<ImpactScenario {self.nama_skenario}>'