# backend/app/seeds.py

from .models import User, MasterData, RiskMapTemplate, RiskMapLikelihoodLabel, RiskMapImpactLabel, RiskMapLevelDefinition, RiskMapScore, Role, Permission, QrcAssessment, QrcQuestion
from . import db, bcrypt

DEFAULT_PERMISSIONS = {
    'view_dashboard': 'Melihat halaman dashboard',
    # Risk Management AI
    'view_risk_assessment_ai': 'Melihat daftar Risk Assessment AI',
    'create_risk_assessment_ai': 'Membuat Risk Assessment AI baru',
    'edit_risk_assessment_ai': 'Mengedit Risk Assessment AI',
    'delete_risk_assessment_ai': 'Menghapus Risk Assessment AI',
    'view_risk_register_main': 'Melihat Risk Register Utama',
    'manage_risk_register_main': 'Tambah/Edit/Hapus item di Risk Register Utama',
    # Risk Management Levels
    'view_risk_dasar': 'Melihat daftar Asesmen Dasar',
    'manage_risk_dasar': 'Membuat/Edit/Hapus Asesmen Dasar',
    'view_risk_madya': 'Melihat daftar Asesmen Madya',
    'manage_risk_madya': 'Membuat/Edit/Hapus Asesmen Madya',
    'view_risk_templates': 'Melihat daftar Template Peta Risiko',
    'manage_risk_templates': 'Membuat/Edit/Hapus Template Peta Risiko',
    # Modules
    'view_rsca': 'Melihat tugas & siklus RSCA',
    'submit_rsca': 'Mengisi dan mengirim jawaban RSCA',
    'view_bpr': 'Melihat menu Business Process Review',
    'manage_bpr': 'Membuat dan Mengelola Business Process Review',
    'approve_bpr': 'Menyetujui, Finalisasi, dan Membuat Header BPR (Manajer)',
    'view_bia': 'Melihat halaman BIA',
    'run_bia_simulation': 'Menjalankan simulasi BIA',
    'manage_critical_assets': 'Mengelola Aset Kritis & Dependensi (BIA)',
    'view_addons_menu': 'Melihat menu Add-ons',
    'view_cba_calculator': 'Melihat CBA Calculator',
    'view_monte_carlo': 'Melihat Monte Carlo Simulator',
    'view_horizon_scanner': 'Melihat Horizon Scanner',
    # Quick Risk Check
    'view_qrc_menu': 'Melihat menu induk Quick Risk Scan',
    'view_qrc_client': 'Melihat Dashboard QRC Client',
    'submit_qrc_assessment': 'Mengisi dan mengirim Quick Risk Scan',
    'view_qrc_consultant': 'Melihat Dashboard QRC Consultant',
    'review_qrc_assessment': 'Melakukan review dan validasi asesmen QRC',
    'manage_qrc_templates': 'Mengelola Template Pertanyaan QRC (Admin)',
    # Admin Area
    'view_admin_area': 'Mengakses menu Admin', # Permission umum untuk menu admin
    'manage_users': 'Melihat & Mengelola data pengguna (Admin)',
    'manage_roles': 'Melihat & Mengelola Roles & Permissions (Admin)',
    'manage_master_data': 'Mengelola Master Data (Admin)',
    'manage_regulations': 'Mengelola Master Regulasi (Admin)',
    'manage_rsca_cycles': 'Membuat/Mengelola siklus RSCA (Admin)',
    'manage_departments': 'Membuat/Edit/Hapus Departemen (Admin Institusi)',
    'view_mitigation_monitor': 'Melihat halaman Pemantauan Mitigasi (Rencana Aksi)',
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

    # 4. Seed Role Staf (Lini 1)
    staff_role = Role.query.filter_by(name='Staf').first()
    if not staff_role:
        print("  Creating 'Staf' role...")
        staff_role = Role(name='Staf', description='Akses Lini 1 (Operasional).')
        db.session.add(staff_role)
    
    # Daftar Permission Wajib untuk Staf
    staff_perms_list = [
        'view_dashboard', 'view_addons_menu',
        'view_rsca', 'submit_rsca',
        'view_risk_dasar', 'view_risk_madya',
        'view_bpr', 'manage_bpr' # Permission BPR
    ]
    assign_perms(staff_role, staff_perms_list)

    # 5. Seed Role Manajer Risiko (Lini 2)
    manager_role = Role.query.filter_by(name='Manajer Risiko').first()
    if not manager_role:
        print("  Creating 'Manajer Risiko' role...")
        manager_role = Role(name='Manajer Risiko', description='Akses Lini 2 (Reviewer).')
        db.session.add(manager_role)
    
    # Daftar Permission Wajib untuk Manajer Risiko
    manager_perms_list = [
        'view_dashboard',
        'view_admin_area',
        'manage_departments', 'manage_rsca_cycles',
        'view_mitigation_monitor', 'view_addons_menu',
        'view_horizon_scanner',
        'view_bpr', 'manage_bpr', 'approve_bpr' # Permission BPR Lengkap
    ]
    assign_perms(manager_role, manager_perms_list)
    
    qrc_user_role = Role.query.filter_by(name='QRC User').first()
    if not qrc_user_role:
        print("  Creating 'QRC User' role...")
        qrc_user_role = Role(name='QRC User', description='User Eksternal untuk Quick Risk Scan.')
        db.session.add(qrc_user_role)
    
    assign_perms(qrc_user_role, ['view_qrc_menu', 'view_qrc_client', 'submit_qrc_assessment'])

    qrc_consultant_role = Role.query.filter_by(name='QRC Consultant').first()
    if not qrc_consultant_role:
        print("  Creating 'QRC Consultant' role...")
        qrc_consultant_role = Role(name='QRC Consultant', description='Konsultan Profesional Reviewer QRC.')
        db.session.add(qrc_consultant_role)

    qrc_consultant_perms = [
        'view_qrc_menu',
        'view_qrc_consultant', 
        'review_qrc_assessment',
        'view_dashboard',
        'view_admin_area',
        'manage_qrc_templates'
    ]
    assign_perms(qrc_consultant_role, qrc_consultant_perms)

    try:
        db.session.commit()
        print("Roles and Permissions seeding committed successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing roles/permissions: {e}")
        
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
    
def seed_qrc_users():
    """Membuat user dummy khusus untuk testing fitur QRC."""
    print("Seeding QRC Dummy Users...")
    
    # 1. Buat User Client
    client_email = "client@qrc.com"
    client_user = User.query.filter_by(email=client_email).first()
    qrc_user_role = Role.query.filter_by(name='QRC User').first()
    
    if not qrc_user_role:
        print("  Error: Role 'QRC User' not found. Run seed_roles_permissions first.")
    elif not client_user:
        hashed_password = bcrypt.generate_password_hash("Sertif123!").decode('utf-8')
        new_client = User(
            email=client_email,
            nama_lengkap="Demo Client QRC",
            password_hash=hashed_password,
            institution="PT Maju Mundur Sejahtera",
            limit_qrc_standard=2,
            limit_qrc_essay=1
        )
        new_client.roles.append(qrc_user_role)
        db.session.add(new_client)
        print(f"  Created user: {client_email} (Role: QRC User)")
    else:
        print(f"  User {client_email} already exists.")

    # 2. Buat User Consultant
    consultant_email = "consultant@qrc.com"
    consultant_user = User.query.filter_by(email=consultant_email).first()
    qrc_consultant_role = Role.query.filter_by(name='QRC Consultant').first()

    if not qrc_consultant_role:
        print("  Error: Role 'QRC Consultant' not found. Run seed_roles_permissions first.")
    elif not consultant_user:
        hashed_password = bcrypt.generate_password_hash("Sertif123!").decode('utf-8')
        new_consultant = User(
            email=consultant_email,
            nama_lengkap="Expert Manrisk",
            password_hash=hashed_password,
            institution="Internal Manrisk Team"
        )
        new_consultant.roles.append(qrc_consultant_role)
        db.session.add(new_consultant)
        print(f"  Created user: {consultant_email} (Role: QRC Consultant)")
    else:
        print(f"  User {consultant_email} already exists.")
        
    try:
        db.session.commit()
        print("QRC Users seeding committed.")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding QRC users: {e}")
        
def seed_qrc_questions():
    print("Seeding QRC Questions...")
    
    # Cek jika sudah ada data, skip agar tidak duplikat
    if QrcQuestion.query.first():
        print("  QRC Questions already seeded.")
        return

    # --- DATA PERTANYAAN STANDARD (20 Soal) ---
    standard_questions = [
        # Dimensi A
        {
            "category": "Tata Kelola & Budaya",
            "text": "Apakah perusahaan memiliki dokumen kebijakan manajemen risiko yang tertulis?",
            "options": [{"label": "Tidak ada", "value": 0}, {"label": "Ada tapi hanya formalitas", "value": 5}, {"label": "Ada dan diterapkan aktif", "value": 10}]
        },
        {
            "category": "Tata Kelola & Budaya",
            "text": "Apakah ada tim atau individu khusus yang ditunjuk untuk mengawasi risiko (Risk Officer)?",
            "options": [{"label": "Tidak ada", "value": 0}, {"label": "Merangkap jabatan lain", "value": 5}, {"label": "Ada unit khusus independen", "value": 10}]
        },
        {
            "category": "Tata Kelola & Budaya",
            "text": "Seberapa sadar karyawan terhadap risiko dalam pekerjaan sehari-hari mereka?",
            "options": [{"label": "Tidak peduli", "value": 0}, {"label": "Hanya level manajer", "value": 5}, {"label": "Seluruh pegawai sadar risiko", "value": 10}]
        },
        {
            "category": "Tata Kelola & Budaya",
            "text": "Apakah ada mekanisme pelaporan pelanggaran (Whistleblowing) atau anti-fraud?",
            "options": [{"label": "Tidak ada", "value": 0}, {"label": "Ada tapi jarang dipakai", "value": 5}, {"label": "Ada sistem anonim dan aktif", "value": 10}]
        },
        {
            "category": "Tata Kelola & Budaya",
            "text": "Seberapa sering Direksi/Pimpinan membahas isu risiko dalam rapat manajemen?",
            "options": [{"label": "Tidak pernah", "value": 0}, {"label": "Hanya saat ada masalah", "value": 5}, {"label": "Rutin dalam agenda rapat", "value": 10}]
        },
        # Dimensi B
        {
            "category": "Identifikasi & Proses",
            "text": "Apakah perusahaan rutin mendata potensi bahaya/risiko (Risk Register)?",
            "options": [{"label": "Tidak pernah", "value": 0}, {"label": "Kadang-kadang", "value": 5}, {"label": "Rutin minimal setahun sekali", "value": 10}]
        },
        {
            "category": "Identifikasi & Proses",
            "text": "Dalam 12 bulan terakhir, apakah ada insiden operasional yang menyebabkan kerugian signifikan?",
            "options": [{"label": "Sering terjadi", "value": 0}, {"label": "Pernah sekali-kali", "value": 5}, {"label": "Tidak ada insiden berarti", "value": 10}]
        },
        {
            "category": "Identifikasi & Proses",
            "text": "Apakah setiap proses bisnis kritis sudah memiliki SOP (Standard Operating Procedure)?",
            "options": [{"label": "Belum ada", "value": 0}, {"label": "Sebagian ada", "value": 5}, {"label": "Lengkap dan terintegrasi", "value": 10}]
        },
        {
            "category": "Identifikasi & Proses",
            "text": "Apakah risiko yang teridentifikasi dinilai dampak dan kemungkinannya (Scoring)?",
            "options": [{"label": "Hanya didata saja", "value": 0}, {"label": "Dinilai pakai kira-kira", "value": 5}, {"label": "Dinilai dengan matriks terukur", "value": 10}]
        },
        {
            "category": "Identifikasi & Proses",
            "text": "Apakah status risiko dilaporkan secara berkala kepada manajemen?",
            "options": [{"label": "Tidak pernah", "value": 0}, {"label": "Kalau diminta saja", "value": 5}, {"label": "Laporan rutin bulanan/kuartalan", "value": 10}]
        },
        # Dimensi C
        {
            "category": "Ketahanan & Teknologi",
            "text": "Apakah perusahaan memiliki perlindungan data (firewall, antivirus, backup) yang rutin dicek?",
            "options": [{"label": "Tidak ada", "value": 0}, {"label": "Standar", "value": 5}, {"label": "Canggih dan rutin diuji", "value": 10}]
        },
        {
            "category": "Ketahanan & Teknologi",
            "text": "Jika kantor/pabrik utama lumpuh (misal: kebakaran), apakah bisnis bisa tetap jalan?",
            "options": [{"label": "Bisnis berhenti total", "value": 0}, {"label": "Bisa jalan sebagian", "value": 5}, {"label": "Berjalan normal (punya DRC)", "value": 10}]
        },
        {
            "category": "Ketahanan & Teknologi",
            "text": "Seberapa bergantung perusahaan pada vendor/supplier tunggal?",
            "options": [{"label": "Sangat bergantung (Risiko Tinggi)", "value": 0}, {"label": "Ada backup vendor", "value": 5}, {"label": "Vendor sangat beragam", "value": 10}]
        },
        {
            "category": "Ketahanan & Teknologi",
            "text": "Apakah perusahaan mengelola data nasabah sesuai UU PDP (Privasi)?",
            "options": [{"label": "Tidak tahu aturannya", "value": 0}, {"label": "Sedang menyesuaikan", "value": 5}, {"label": "Sudah patuh sepenuhnya", "value": 10}]
        },
        {
            "category": "Ketahanan & Teknologi",
            "text": "Seberapa sering terjadi kerusakan alat/sistem yang mengganggu operasional?",
            "options": [{"label": "Sering rusak", "value": 0}, {"label": "Kadang-kadang", "value": 5}, {"label": "Sangat jarang (Maintenance Rutin)", "value": 10}]
        },
        # Dimensi D
        {
            "category": "Keuangan & Strategis",
            "text": "Apakah perusahaan memiliki dana cadangan darurat untuk operasional 3-6 bulan?",
            "options": [{"label": "Tidak ada", "value": 0}, {"label": "Kurang dari 3 bulan", "value": 5}, {"label": "Aman (Lebih dari 3 bulan)", "value": 10}]
        },
        {
            "category": "Keuangan & Strategis",
            "text": "Bagaimana tingkat kepatuhan terhadap regulasi wajib (Pajak, OJK, Izin Usaha)?",
            "options": [{"label": "Sering telat/kena denda", "value": 0}, {"label": "Cukup patuh", "value": 5}, {"label": "Sangat patuh dan tertib", "value": 10}]
        },
        {
            "category": "Keuangan & Strategis",
            "text": "Apakah karyawan kunci memiliki skill yang cukup untuk menjalankan strategi masa depan?",
            "options": [{"label": "Banyak gap skill", "value": 0}, {"label": "Cukup memadai", "value": 5}, {"label": "Sangat kompeten dan terlatih", "value": 10}]
        },
        {
            "category": "Keuangan & Strategis",
            "text": "Bagaimana sentimen pelanggan di media sosial/internet terhadap brand perusahaan?",
            "options": [{"label": "Banyak negatif", "value": 0}, {"label": "Netral", "value": 5}, {"label": "Positif dan terjaga", "value": 10}]
        },
        {
            "category": "Keuangan & Strategis",
            "text": "Seberapa cepat perubahan tren pasar/pesaing mengancam produk utama perusahaan?",
            "options": [{"label": "Pasar sangat berubah-ubah", "value": 0}, {"label": "Stabil tapi menurun", "value": 5}, {"label": "Stabil dan dikuasai", "value": 10}]
        },
    ]

    for idx, q in enumerate(standard_questions):
        db.session.add(QrcQuestion(
            question_type='standard',
            category=q['category'],
            text=q['text'],
            options=q['options'],
            order=idx + 1,
            is_active=True
        ))

    # --- DATA PERTANYAAN ESSAY (15 Soal) ---
    essay_questions = [
        {"category": "Tata Kelola & Budaya", "text": "Jelaskan bagaimana struktur organisasi manajemen risiko di perusahaan Anda saat ini. Siapa yang bertanggung jawab utama?", "placeholder": "Contoh: Kami memiliki Komite Risiko..."},
        {"category": "Tata Kelola & Budaya", "text": "Bagaimana budaya risiko diterapkan? Apakah ada program pelatihan atau sosialisasi rutin kepada karyawan?", "placeholder": "Deskripsikan frekuensi pelatihan..."},
        {"category": "Tata Kelola & Budaya", "text": "Deskripsikan mekanisme pelaporan insiden atau 'whistleblowing' yang tersedia. Apakah sistem tersebut menjamin anonimitas?", "placeholder": "Jelaskan alur pelaporan..."},
        {"category": "Tata Kelola & Budaya", "text": "Jelaskan bagaimana pernyataan selera risiko (Risk Appetite Statement) didefinisikan dan dikomunikasikan kepada seluruh unit bisnis.", "placeholder": "Apakah ada batasan kuantitatif..."},
        
        {"category": "Identifikasi & Proses", "text": "Jelaskan metodologi yang digunakan perusahaan dalam mengidentifikasi dan menilai risiko (Risk Assessment).", "placeholder": "Contoh: Metode ISO 31000..."},
        {"category": "Identifikasi & Proses", "text": "Sebutkan 3 risiko utama (Top Risks) yang saat ini menjadi perhatian terbesar perusahaan dan alasannya.", "placeholder": "1. Risiko Siber, 2. ..."},
        {"category": "Identifikasi & Proses", "text": "Bagaimana prosedur penanganan insiden (Incident Response) jika terjadi gangguan operasional yang signifikan?", "placeholder": "Langkah tanggap darurat..."},
        {"category": "Identifikasi & Proses", "text": "Apakah indikator risiko (KRI) telah terintegrasi dengan indikator kinerja utama (KPI) perusahaan? Berikan contoh konkret.", "placeholder": "Contoh: KPI Penjualan dikaitkan dengan KRI..."},
        
        {"category": "Ketahanan & Teknologi", "text": "Gambarkan arsitektur keamanan siber dan perlindungan data yang diterapkan untuk melindungi aset informasi perusahaan.", "placeholder": "Tools keamanan, backup..."},
        {"category": "Ketahanan & Teknologi", "text": "Apakah perusahaan memiliki rencana kelangsungan bisnis (BCP) dan pemulihan bencana (DRP)? Kapan terakhir kali diuji coba?", "placeholder": "Skenario simulasi terakhir..."},
        {"category": "Ketahanan & Teknologi", "text": "Bagaimana mekanisme perusahaan dalam memantau dan merespons risiko yang baru muncul (Emerging Risks) seperti perubahan regulasi mendadak atau disrupsi teknologi?", "placeholder": "Tim khusus atau horizon scanning..."},
        
        {"category": "Strategis & Keuangan", "text": "Bagaimana strategi perusahaan dalam menjaga likuiditas dan stabilitas keuangan menghadapi ketidakpastian pasar?", "placeholder": "Kebijakan cash buffer..."},
        {"category": "Strategis & Keuangan", "text": "Apa tantangan regulasi terbesar yang dihadapi perusahaan saat ini dan bagaimana strategi pemenuhannya?", "placeholder": "Isu kepatuhan utama..."},
        {"category": "Strategis & Keuangan", "text": "Uraikan strategi pembiayaan risiko (Risk Financing) yang diterapkan, termasuk cakupan asuransi utama dan efektivitasnya.", "placeholder": "Aset kritis diasuransikan..."},
        {"category": "Strategis & Keuangan", "text": "Bagaimana perusahaan mengintegrasikan risiko LST (Lingkungan, Sosial, dan Tata Kelola/ESG) ke dalam strategi jangka panjang?", "placeholder": "Inisiatif keberlanjutan..."}
    ]

    for idx, q in enumerate(essay_questions):
        db.session.add(QrcQuestion(
            question_type='essay',
            category=q['category'],
            text=q['text'],
            placeholder=q['placeholder'],
            order=idx + 1,
            is_active=True
        ))

    db.session.commit()
    print("  QRC Questions seeded successfully.")