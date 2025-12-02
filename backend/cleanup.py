from app import create_app, db
from app.models import RiskMapTemplate

app = create_app()

with app.app_context():
    print("Mencari template default yang lama...")

    # cascade="all, delete-orphan" di model akan menghapus semua data terkait
    default_template = RiskMapTemplate.query.filter_by(is_default=True).first()

    if default_template:
        print(f"Template default ditemukan (ID: {default_template.id}). Menghapus...")
        db.session.delete(default_template)
        db.session.commit()
        print("Template default yang lama berhasil dihapus.")
    else:
        print("Tidak ada template default lama yang ditemukan. Tidak ada yang perlu dilakukan.")

print("Cleanup selesai.")