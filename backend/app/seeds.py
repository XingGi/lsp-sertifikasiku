# backend/app/seeds.py

from .models import User, MasterData, RiskMapTemplate, RiskMapLikelihoodLabel, RiskMapImpactLabel, RiskMapLevelDefinition, RiskMapScore, Role, Permission
from . import db, bcrypt

DEFAULT_PERMISSIONS = {
    'view_dashboard': 'Melihat halaman dashboard',
    # Risk Management Levels
    'view_risk_dasar': 'Melihat daftar Asesmen Dasar',
    'manage_risk_dasar': 'Membuat/Edit/Hapus Asesmen Dasar',
    'view_risk_madya': 'Melihat daftar Asesmen Madya',
    'manage_risk_madya': 'Membuat/Edit/Hapus Asesmen Madya',
    'view_risk_templates': 'Melihat daftar Template Peta Risiko',
    'manage_risk_templates': 'Membuat/Edit/Hapus Template Peta Risiko',
    # Admin Area
    'view_admin_area': 'Mengakses menu Admin', # Permission umum untuk menu admin
    'manage_users': 'Melihat & Mengelola data pengguna (Admin)',
    'manage_roles': 'Melihat & Mengelola Roles & Permissions (Admin)',
    'manage_master_data': 'Mengelola Master Data (Admin)',
    'manage_regulations': 'Mengelola Master Regulasi (Admin)',
    'manage_departments': 'Membuat/Edit/Hapus Departemen (Admin Institusi)',
}

# --- Perubahan 3: Buat fungsi seed Roles & Permissions ---
def seed_roles_permissions():
    """Membuat role default (Admin, User) dan permissions jika belum ada."""
    print("Seeding Roles and Permissions...")
    created_items = 0

    # 1. Seed Permissions
    existing_permissions = {p.name for p in Permission.query.all()}
    for name, description in DEFAULT_PERMISSIONS.items():
        if name not in existing_permissions:
            new_perm = Permission(name=name, description=description)
            db.session.add(new_perm)
            print(f"  Creating permission: {name}")
            created_items += 1

    if created_items > 0:
        db.session.commit() # Commit agar bisa di-query di bawah
        print(f"  {created_items} new permissions created.")
    else:
        print("  All default permissions already exist.")
        
    perms = {p.name: p for p in Permission.query.all()}

    # Helper untuk assign permission ke role dengan aman
    def assign_perms(role, perm_names):
        count = 0
        for p_name in perm_names:
            perm_obj = perms.get(p_name)
            if perm_obj and perm_obj not in role.permissions:
                role.permissions.append(perm_obj)
                count += 1
        if count > 0:
            print(f"  -> Added {count} missing permissions to role '{role.name}'.")

    # 2. Seed Role Admin
    admin_role = Role.query.filter_by(name='Admin').first()
    if not admin_role:
        print("  Creating 'Admin' role...")
        admin_role = Role(name='Admin', description='Akses penuh ke semua fitur sistem.')
        db.session.add(admin_role)
    
    # Admin selalu dapat SEMUA permission
    all_permissions = list(perms.values())
    for p in all_permissions:
        if p not in admin_role.permissions:
            admin_role.permissions.append(p)

    # 3. Seed Role User
    user_role = Role.query.filter_by(name='User').first()
    if not user_role:
        print("  Creating 'User' role...")
        user_role = Role(name='User', description='Akses standar untuk pengguna biasa.')
        db.session.add(user_role)
    
    assign_perms(user_role, ['view_dashboard'])
        
def seed_admin():
    """Membuat akun admin jika belum ada."""
    
    # Cek apakah admin sudah ada
    admin_email = "admin@admin.com"
    admin_pass = "12345678" # Sesuaikan jika perlu

    admin_user = User.query.filter_by(email=admin_email).first()
    admin_role = Role.query.filter_by(name='Admin').first()
    
    if not admin_role:
        print("ERROR: Role 'Admin' not found. Please run seed_roles_permissions first or check seeding.")
        return
    
    if not admin_user:
        print("Admin user not found, creating one...")
        
        hashed_password = bcrypt.generate_password_hash(admin_pass).decode('utf-8')
        new_admin = User(
            email=admin_email,
            password_hash=hashed_password,
            nama_lengkap="Admin SIRICO",
        )
        
        new_admin.roles.append(admin_role)
        db.session.add(new_admin)
        try:
            db.session.commit()
            print(f"Admin user '{admin_email}' created successfully with 'Admin' role.")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {e}")
    else:
        print(f"Admin user '{admin_email}' already exists.")
        # Pastikan user admin punya Role Admin
        if admin_role not in admin_user.roles:
            print(f"  Assigning 'Admin' role to existing admin user '{admin_email}'...")
            admin_user.roles.append(admin_role)
            try:
                db.session.commit()
                print("  'Admin' role assigned.")
            except Exception as e:
                db.session.rollback()
                print(f"  Error assigning role: {e}")
        else:
            print("  Admin user already has 'Admin' role.")

def seed_master_data():
    print("Seeding master data...")
    options = {
        'INDUSTRY': [
            {'key': 'banking', 'value': 'Perbankan'}, 
            {'key': 'insurance', 'value': 'Asuransi'},
            {'key': 'capital_market', 'value': 'Pasar Modal'},
            {'key': 'fintech', 'value': 'Teknologi Finansial (Fintech)'},
            {'key': 'multifinance', 'value': 'Multifinance'},
            {'key': 'savings_loan_coop', 'value': 'Koperasi Simpan Pinjam'},
            {'key': 'digital_asset_trading', 'value': 'Pedagang Aset Digital'},
            {'key': 'manufacturing', 'value': 'Manufaktur'},
            {'key': 'automotive', 'value': 'Otomotif'},
            {'key': 'textile', 'value': 'Tekstil'},
            {'key': 'chemical', 'value': 'Kimia'},
            {'key': 'pharmaceutical', 'value': 'Farmasi'},
            {'key': 'electronics', 'value': 'Elektronik'},
            {'key': 'metal_machinery', 'value': 'Logam & Mesin'},
            {'key': 'it', 'value': 'Teknologi Informasi'},
            {'key': 'telecom', 'value': 'Telekomunikasi'},
            {'key': 'ecommerce', 'value': 'E-commerce'},
            {'key': 'media_creative', 'value': 'Media & Kreatif'},
            {'key': 'energy', 'value': 'Energi'},
            {'key': 'mining', 'value': 'Pertambangan'},
            {'key': 'oil_gas', 'value': 'Migas'},
            {'key': 'forestry', 'value': 'Kehutanan'},
            {'key': 'plantation', 'value': 'Perkebunan'},
            {'key': 'agriculture', 'value': 'Pertanian'},
            {'key': 'fisheries', 'value': 'Perikanan'},
            {'key': 'construction', 'value': 'Konstruksi'},
            {'key': 'property', 'value': 'Properti'},
            {'key': 'transportation', 'value': 'Transportasi'},
            {'key': 'logistics', 'value': 'Logistik'},
            {'key': 'water_sanitation', 'value': 'Air & Sanitasi'},
            {'key': 'electricity', 'value': 'Kelistrikan'},
            {'key': 'retail', 'value': 'Retail'},
            {'key': 'fnb', 'value': 'Food & Beverage'},
            {'key': 'hospitality', 'value': 'Perhotelan & Pariwisata'},
            {'key': 'consulting', 'value': 'Konsultan'},
            {'key': 'cleaning_services', 'value': 'Jasa Kebersihan'},
            {'key': 'healthcare', 'value': 'Kesehatan'},
            {'key': 'education', 'value': 'Pendidikan'},
            {'key': 'government', 'value': 'Pemerintahan'},
            {'key': 'nonprofit', 'value': 'Nirlaba'},
            {'key': 'intl_organization', 'value': 'Organisasi Internasional'}
        ],
        'COMPANY_TYPE': [
            {'key': 'Public', 'value': 'Public Company'}, 
            {'key': 'Private', 'value': 'Private Company'},
            {'key': 'Startup', 'value': 'Startup'},
            {'key': 'foreign_corp', 'value': 'Perusahaan Asing'},
            {'key': 'bumn', 'value': 'BUMN'},
            {'key': 'bumd', 'value': 'BUMD'},
            {'key': 'umkm', 'value': 'UMKM (Usaha Mikro, Kecil, dan Menengah)'},
            {'key': 'koperasi', 'value': 'Koperasi'},
            {'key': 'cv', 'value': 'Commanditaire Vennotschap (CV)'},
            {'key': 'firma', 'value': 'Firma (Fa)'},
            {'key': 'persekutuan_perdata', 'value': 'Persekutuan Perdata'},
            {'key': 'sole_proprietorship', 'value': 'Perusahaan Perorangan (UD)'},
            {'key': 'yayasan', 'value': 'Yayasan / Lembaga Nirlaba'},
            {'key': 'ormas_orpol', 'value': 'Ormas / Partai Politik'},
            {'key': 'lembaga_pendidikan', 'value': 'Lembaga Pendidikan / Pesantren'},
            {'key': 'perusahaan_publik', 'value': 'Perusahaan Terbuka (Tbk)'},
            {'key': 'joint_venture', 'value': 'Perusahaan Joint Venture'},
            {'key': 'representative_office', 'value': 'Kantor Perwakilan Perusahaan Asing'}
        ],
        'COMPANY_ASSETS': [
            {'key': 'under_1b', 'value': '< Rp 1 Miliar'},
            {'key': '1b_5b', 'value': 'Rp 1 - 5 Miliar'},
            {'key': '5b_10b', 'value': 'Rp 5 - 10 Miliar'},
            {'key': '10b_25b', 'value': 'Rp 10 - 25 Miliar'},
            {'key': '25b_50b', 'value': 'Rp 25 - 50 Miliar'},
            {'key': '50b_100b', 'value': 'Rp 50 - 100 Miliar'},
            {'key': '100b_250b', 'value': 'Rp 100 - 250 Miliar'},
            {'key': '250b_500b', 'value': 'Rp 250 - 500 Miliar'},
            {'key': '500b_1t', 'value': 'Rp 500 Miliar - 1 Triliun'},
            {'key': '1t_2.5t', 'value': 'Rp 1 Triliun - 2.5 Triliun'},
            {'key': '2.5t_5t', 'value': 'Rp 2.5 Triliun - 5 Triliun'},
            {'key': 'over_5t', 'value': 'Rp > 5 Triliun'}
        ],
        'CURRENCY': [
            {'key': 'idr', 'value': 'IDR'}, 
            {'key': 'usd', 'value': 'USD'},
            {'key': 'eur', 'value': 'EUR'},
            {'key': 'sgd', 'value': 'SGD'}
        ]
    }
    for category, items in options.items():
        for item in items:
            # Cek apakah data sudah ada sebelum memasukkan
            exists = MasterData.query.filter_by(category=category, key=item['key']).first()
            if not exists:
                new_data = MasterData(category=category, key=item['key'], value=item['value'])
                db.session.add(new_data)
                
    db.session.commit()
    print("Master data seeding complete.")
    
def _create_default_template(name, description, level_definitions_data, matrix_scores_data):
    """Membuat satu template peta risiko default if it doesn't exist."""
    if RiskMapTemplate.query.filter_by(name=name, is_default=True).first():
        print(f"Default template '{name}' already exists.")
        return False # Indicate that it was not created

    print(f"Creating default template: {name}...")
    try:
        # 1. Buat Template Induk
        template = RiskMapTemplate(
            name=name,
            description=description,
            is_default=True,
            user_id=None # Milik sistem
        )
        db.session.add(template)
        # Flush diperlukan untuk mendapatkan template.id sebelum menambahkan children
        db.session.flush()

        # 2. Definisikan Label Probabilitas & Dampak (Standar 1-5)
        likelihoods = {
            5: "Hampir Pasti Terjadi", 4: "Sangat Mungkin Terjadi", 3: "Bisa Terjadi",
            2: "Jarang Terjadi", 1: "Sangat Jarang Terjadi"
        }
        impacts = {
            1: "Sangat Rendah", 2: "Rendah", 3: "Moderat", 4: "Tinggi", 5: "Sangat Tinggi"
        }

        for level, label in likelihoods.items():
            db.session.add(RiskMapLikelihoodLabel(template_id=template.id, level=level, label=label))

        for level, label in impacts.items():
            db.session.add(RiskMapImpactLabel(template_id=template.id, level=level, label=label))

        # 3. Definisikan Level Risiko (Skor, Nama, Warna) berdasarkan data input
        for definition in level_definitions_data:
            db.session.add(RiskMapLevelDefinition(
                template_id=template.id,
                level_name=definition['level_name'],
                color_hex=definition['color_hex'],
                min_score=definition['min_score'],
                max_score=definition['max_score']
            ))

        # 4. Definisikan Skor Matriks berdasarkan data input
        if isinstance(matrix_scores_data, list) and len(matrix_scores_data) == 5:
            for l_idx, row in enumerate(matrix_scores_data):
                 likelihood_level = 5 - l_idx
                 if len(row) == 5:
                     for i_idx, score_value in enumerate(row):
                         impact_level = i_idx + 1
                         if score_value is not None:
                             db.session.add(RiskMapScore(
                                 template_id=template.id,
                                 likelihood_level=likelihood_level,
                                 impact_level=impact_level,
                                 score=score_value
                             ))
                 else:
                      print(f"  Warning: Invalid row length for likelihood {likelihood_level} in matrix_scores_data for '{name}'")
        elif isinstance(matrix_scores_data, dict):
             for (likelihood_level, impact_level), score_value in matrix_scores_data.items():
                 if score_value is not None:
                     db.session.add(RiskMapScore(
                         template_id=template.id,
                         likelihood_level=likelihood_level,
                         impact_level=impact_level,
                         score=score_value
                     ))
        else:
            print(f"  Error: Invalid format for matrix_scores_data for '{name}'. Expected list of lists (5x5) or dict.")
            raise ValueError("Invalid matrix score data format") # Stop the process if format is wrong

        # Commit only after all parts of the template are added
        # db.session.commit() # Moved commit outside this helper
        print(f"Default template '{name}' prepared for commit.")
        return True # Indicate successful preparation
    except Exception as e:
        # db.session.rollback() # Rollback is handled outside
        print(f"Error creating template '{name}': {e}")
        return False # Indicate failure
    
# Peta Risiko
def seed_default_risk_map():
    """Membuat template peta risiko default jika belum ada."""
    print("Starting risk map seeding process...")
    created_count = 0

    # --- Data untuk Default SIRICO Matrix 5x5 ---
    sirico_name = "Default SIRICO Matrix 5x5"
    sirico_desc = "Template peta risiko standar berdasarkan matriks 5x5 umum (skor = P x I)."
    sirico_levels = [
        {"level_name": "Sangat Rendah", "color_hex": "#00B050", "min_score": 1, "max_score": 2}, # Hijau Tua
        {"level_name": "Rendah", "color_hex": "#92D050", "min_score": 3, "max_score": 6},       # Hijau Muda
        {"level_name": "Moderat", "color_hex": "#FFFF00", "min_score": 7, "max_score": 12},      # Kuning
        {"level_name": "Tinggi", "color_hex": "#FFC000", "min_score": 13, "max_score": 19},     # Oranye
        {"level_name": "Sangat Tinggi", "color_hex": "#FF0000", "min_score": 20, "max_score": 25} # Merah
    ]
    sirico_scores = {}
    for l in range(1, 6):
        for i in range(1, 6):
            sirico_scores[(l, i)] = l * i

    if _create_default_template(sirico_name, sirico_desc, sirico_levels, sirico_scores):
        created_count += 1

    # --- Data untuk Default BUMN ---
    bumn_name = "Default BUMN"
    bumn_desc = "Template peta risiko standar untuk BUMN berdasarkan matriks 5x5 dengan rentang dan skor spesifik."
    bumn_levels = [
        {"level_name": "Low", "color_hex": "#00B050", "min_score": 1, "max_score": 5},          # Hijau
        {"level_name": "Low to Moderate", "color_hex": "#92D050", "min_score": 6, "max_score": 11}, # Hijau Muda/Lime
        {"level_name": "Moderate", "color_hex": "#FFFF00", "min_score": 12, "max_score": 15},     # Kuning
        {"level_name": "Moderate to High", "color_hex": "#FFC000", "min_score": 16, "max_score": 19},# Oranye
        {"level_name": "High", "color_hex": "#FF0000", "min_score": 20, "max_score": 25}        # Merah
    ]
    bumn_scores_matrix = [
        # Impact:  1  2   3   4   5
        [ 7, 12, 17, 22, 25], # Likelihood 5
        [ 4,  9, 14, 19, 24], # Likelihood 4
        [ 3,  8, 13, 18, 23], # Likelihood 3
        [ 2,  6, 11, 16, 21], # Likelihood 2
        [ 1,  5, 10, 15, 20], # Likelihood 1
    ]

    if _create_default_template(bumn_name, bumn_desc, bumn_levels, bumn_scores_matrix):
        created_count += 1

    # Commit changes only if at least one template was successfully created/prepared
    if created_count > 0:
        try:
            db.session.commit()
            print(f"Successfully committed {created_count} new default template(s).")
        except Exception as e:
            db.session.rollback()
            print(f"Error committing default templates: {e}")
    else:
        print("No new default templates needed committing.")

    print("Risk map seeding process finished.")