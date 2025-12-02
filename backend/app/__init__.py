import os
from datetime import timedelta
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
ma = Marshmallow()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}, allow_headers=["Authorization", "Content-Type"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    UPLOAD_FOLDER = os.path.join(app.root_path, '..', 'uploads')
    if not os.path.isabs(app.config.get('UPLOAD_FOLDER', 'uploads')):
         app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads') # Gunakan current working directory

    # Buat folder jika belum ada
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    print(f"!!! DEBUG: Kunci JWT yang sedang digunakan: {app.config['JWT_SECRET_KEY']}")
     
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    CORS(app)

    with app.app_context():
        # Import blueprint dari setiap file di folder routes
        from .routes.auth import auth_bp
        from .routes.dashboard import dashboard_bp
        from .routes.risk_ai import risk_ai_bp
        from .routes.risk_register import risk_register_bp
        from .routes.risk_management_levels import risk_management_levels_bp
        from .routes.bia import bia_bp
        from .routes.bpr import bpr_bp
        from .routes.rsca import rsca_bp
        from .routes.master_data import master_data_bp
        from .routes.admin import admin_bp
        from .routes.horizon import horizon_bp
        from app.routes.qrc import qrc_bp

        # Daftarkan semua blueprint ke aplikasi
        app.register_blueprint(auth_bp, url_prefix='/api')
        app.register_blueprint(dashboard_bp, url_prefix='/api')
        app.register_blueprint(risk_ai_bp, url_prefix='/api')
        app.register_blueprint(risk_register_bp, url_prefix='/api')
        app.register_blueprint(risk_management_levels_bp, url_prefix='/api')
        app.register_blueprint(bia_bp, url_prefix='/api')
        app.register_blueprint(bpr_bp, url_prefix='/api')
        app.register_blueprint(rsca_bp, url_prefix='/api')
        app.register_blueprint(master_data_bp, url_prefix='/api')
        app.register_blueprint(admin_bp, url_prefix='/api/admin')
        app.register_blueprint(horizon_bp, url_prefix='/api')
        app.register_blueprint(qrc_bp, url_prefix='/api/qrc')
        
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

        # Kita tidak perlu lagi mengimpor dari routes.py yang lama
        # from . import routes

    return app