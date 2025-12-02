# backend/app/models/user.py
from app import db
from datetime import datetime

# Tabel Asosiasi
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True)
)

role_permissions = db.Table('role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id'), primary_key=True)
)

class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))
    permissions = db.relationship('Permission', secondary=role_permissions, lazy='subquery',
                                backref=db.backref('roles', lazy=True))

    def __repr__(self):
        return f'<Role {self.name}>'

class Permission(db.Model):
    __tablename__ = 'permissions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))

    def __repr__(self):
        return f'<Permission {self.name}>'

class Department(db.Model):
    """Model untuk departemen perusahaan."""
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    institution = db.Column(db.String(255), nullable=True)
    
    users = db.relationship('User', back_populates='department')
    # Relasi rsca_cycles menggunakan string reference untuk menghindari circular import di top-level
    rsca_cycles = db.relationship('RscaCycle', secondary='rsca_cycle_departments', back_populates='departments')

    def __repr__(self):
        return f'<Department {self.name}>'

class User(db.Model):
    """Model untuk tabel pengguna (users)"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    nama_lengkap = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(50), nullable=True)
    institution = db.Column(db.String(200), nullable=True)
    
    # Limits
    limit_dasar = db.Column(db.Integer, nullable=True, default=10)
    limit_madya = db.Column(db.Integer, nullable=True, default=5)
    limit_ai = db.Column(db.Integer, nullable=True, default=15)
    limit_template_peta = db.Column(db.Integer, nullable=True, default=5)
    limit_horizon = db.Column(db.Integer, nullable=True, default=5)
    limit_qrc_standard = db.Column(db.Integer, nullable=True, default=2)
    limit_qrc_essay = db.Column(db.Integer, nullable=True, default=1)
    
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    department = db.relationship('Department', back_populates='users')
    
    # String references untuk relasi agar tidak perlu import file lain di sini (mencegah circular import)
    kris = db.relationship('KRI', backref='owner', lazy=True, cascade="all, delete-orphan")
    assessments = db.relationship('RiskAssessment', backref='assessor', lazy=True, cascade="all, delete-orphan")
    critical_assets = db.relationship('CriticalAsset', backref='owner', lazy=True, cascade="all, delete-orphan")
    impact_scenarios = db.relationship('ImpactScenario', backref='owner', lazy=True, cascade="all, delete-orphan")
    
    main_risk_register_entries = db.relationship('MainRiskRegister', backref='owner', lazy=True, cascade="all, delete-orphan")
    organizational_contexts = db.relationship('OrganizationalContext', backref='owner', lazy=True, cascade="all, delete-orphan")
    basic_assessments = db.relationship('BasicAssessment', backref='owner', lazy=True, cascade="all, delete-orphan")
    risk_map_templates = db.relationship('RiskMapTemplate', backref='owner', lazy=True, cascade="all, delete-orphan")
    madya_assessments = db.relationship('MadyaAssessment', backref='owner', lazy=True, cascade="all, delete-orphan")
    
    roles = db.relationship('Role', secondary=user_roles, lazy='subquery',
                            backref=db.backref('users', lazy=True))

    def __repr__(self):
        return f'<User {self.email}>'
    
    def has_permission(self, permission_name):
        for role in self.roles:
            for permission in role.permissions:
                if permission.name == permission_name:
                    return True
        return False

    def has_role(self, role_name):
         for role in self.roles:
             if role.name == role_name:
                 return True
         return False