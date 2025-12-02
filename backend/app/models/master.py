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