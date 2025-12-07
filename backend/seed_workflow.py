# backend/seed_workflow.py
from app import create_app, db
from app.models import WorkflowTemplate, WorkflowStage, WorkflowTask, CompetencyTest, UjiKompProgress

app = create_app()

with app.app_context():
    print("Mulai Seeding Workflow Data...")
    
    # 1. Buat Template Workflow
    # Cek dulu biar ga duplikat
    template = WorkflowTemplate.query.filter_by(title="Skenario Standar LSP 2025").first()
    if not template:
        template = WorkflowTemplate(title="Skenario Standar LSP 2025", description="Alur default untuk semua skema")
        db.session.add(template)
        db.session.commit()
        print(f"Template '{template.title}' dibuat.")
    
    # 2. Buat Stages (Tahapan)
    # Hapus stage lama kalau ada (buat reset dummy data) biar bersih
    existing_stages = WorkflowStage.query.filter_by(template_id=template.id).all()
    if not existing_stages:
        stage1 = WorkflowStage(template_id=template.id, title="Tahap 1: Pendaftaran & Info", order_index=1)
        stage2 = WorkflowStage(template_id=template.id, title="Tahap 2: Pemberkasan Mandiri", order_index=2)
        db.session.add_all([stage1, stage2])
        db.session.commit()
        print("Stages dibuat.")
        
        # 3. Buat Tasks (Butir Kegiatan)
        
        # Task 1.1: Info HTML (Baca Tata Tertib)
        task1 = WorkflowTask(
            stage_id=stage1.id, 
            title="Membaca Tata Tertib Asesmen", 
            order_index=1, 
            task_type="INFO",
            content_config={
                "html": """
                <h3>Tata Tertib Uji Kompetensi</h3>
                <ul>
                    <li>Peserta wajib hadir 15 menit sebelum jadwal.</li>
                    <li>Dilarang melakukan kecurangan dalam bentuk apapun.</li>
                    <li>Pastikan koneksi internet stabil.</li>
                </ul>
                <p>Klik tombol di bawah jika Anda menyetujui aturan ini.</p>
                """
            }
        )
        
        # Task 2.1: Form JSON Schema (Biodata)
        # Ini format RJSF (React JSON Schema Form)
        form_schema = {
            "title": "Formulir Data Diri Peserta",
            "type": "object",
            "required": ["nik", "nama_lengkap", "alamat"],
            "properties": {
                "nik": {"type": "string", "title": "NIK", "minLength": 16},
                "nama_lengkap": {"type": "string", "title": "Nama Lengkap"},
                "alamat": {"type": "string", "title": "Alamat Domisili", "format": "textarea"},
                "pendidikan": {
                    "type": "string", 
                    "title": "Pendidikan Terakhir",
                    "enum": ["SMA/SMK", "D3", "S1", "S2"],
                    "default": "S1"
                }
            }
        }
        
        task2 = WorkflowTask(
            stage_id=stage2.id, 
            title="Lengkapi Biodata Peserta", 
            order_index=1, 
            task_type="FORM",
            content_config={
                "schema": form_schema,
                "uiSchema": {
                    "alamat": {"ui:widget": "textarea", "ui:rows": 3}
                }
            }
        )
        
        db.session.add_all([task1, task2])
        db.session.commit()
        print("Tasks dibuat.")

        # 4. Assign Workflow ke Data Uji Kompetensi yang sudah ada (biar ga error pas dibuka)
        # Ambil task pertama buat inisialisasi
        first_task_id = task1.id
        
        tests = CompetencyTest.query.all()
        count = 0
        for t in tests:
            if not t.workflow_template_id:
                t.workflow_template_id = template.id
                t.current_task_id = first_task_id # Set ke task awal
                count += 1
        
        db.session.commit()
        print(f"Updated {count} existing tests with workflow template.")

    else:
        print("Data workflow sudah ada, skip seeding.")

    print("Seeding Selesai!")