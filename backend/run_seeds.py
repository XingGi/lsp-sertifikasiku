# backend/run_seeds.py

from app import create_app
from app.seeds import seed_admin, seed_master_data, seed_default_risk_map, seed_roles_permissions

# Script ini bertujuan untuk menjalankan fungsi seeder kita secara manual
# dengan konteks aplikasi yang benar.

print("Preparing to run database seeds...")

# Membuat instance aplikasi untuk mendapatkan konteks
app = create_app()

# Menggunakan konteks aplikasi untuk berinteraksi dengan database
with app.app_context():
    print("App context created. Running seeder...")
    seed_roles_permissions()
    seed_admin()
    seed_master_data()
    seed_default_risk_map()
    print("Seeding process complete.")