# SIRICO - Platform GRC (Governance, Risk, & Compliance) Cerdas

SIRICO adalah platform GRC berbasis web yang dirancang untuk membantu organisasi mengidentifikasi, menganalisis, dan memitigasi risiko secara efisien. Dibangun dengan stack teknologi modern, SIRICO menggabungkan alur kerja manajemen risiko manual (Dasar & Madya) dengan kekuatan analisis AI (menggunakan Google Gemini) untuk memberikan wawasan risiko yang komprehensif.

## 🚀 Fitur Utama

Platform ini dibagi menjadi beberapa modul inti:

- **Dashboard**: Tampilan ringkasan metrik utama, daftar asesmen terbaru, dan _horizon scanner_ untuk berita risiko terkini.
- **Risk Management AI**: Fitur unggulan untuk asesmen risiko otomatis:
  - **Assessment Studio**: Mengisi konteks proyek (tujuan, regulasi, dll) untuk dianalisis oleh AI.
  - **AI Analysis**: Menggunakan Google Gemini untuk bertindak sebagai CRO virtual, menghasilkan daftar risiko teridentifikasi, analisis mendalam, dan rencana mitigasi.
  - **Risk Register**: Mengelola dan mengedit risiko yang dihasilkan AI sebelum mengimpornya ke Register Utama.
- **Risk Management Levels (Manual)**:
  - **Modul Dasar**: Alur kerja 3 langkah (Konteks, Identifikasi, Analisis) untuk asesmen tingkat unit kerja, dengan fitur ekspor ke Excel.
  - **Modul Madya**: Alur kerja 5 langkah (Struktur, Kriteria, KPI, Input Risiko, Peta Risiko) yang lebih detail dan terhubung dengan template peta risiko kustom.
- **Modul GRC**:
  - **RSCA (Risk & Control Self-Assessment)**: Memungkinkan admin membuat siklus kuesioner untuk diisi oleh departemen.
  - **BPR (Business Process Review)**: Memetakan langkah-langkah proses bisnis dan mengidentifikasi potensi risiko di setiap langkah.
  - **BIA (Business Impact Analysis)**: Mendefinisikan aset kritis dan dependensinya, serta menjalankan simulasi AI untuk memprediksi dampak kegagalan.
- **Quick Risk Scan (QRC)**: 🆕 Modul diagnosa cepat kesehatan risiko perusahaan:
  - **QRC Client**: Dashboard khusus untuk pengguna eksternal/klien. Memungkinkan pemilihan metode asesmen:
    - **Standard**: Kuesioner pilihan ganda cepat dengan skor otomatis.
    - **Deep Analysis (Essay)**: Kuesioner deskriptif mendalam untuk analisis kualitatif.
    - **Limitasi & Kuota**: Sistem kuota otomatis untuk membatasi penggunaan fitur per pengguna.
  - **QRC Consultant**: Dashboard khusus konsultan untuk memantau, me-review, dan memberikan analisis ahli.
    - **AI Assistant**: Integrasi Google Gemini untuk menghasilkan analisis SWOT dan rekomendasi strategis otomatis berdasarkan jawaban klien.
    - **Expert Review**: Konsultan dapat memberikan penilaian manual, catatan, dan menyunting laporan akhir.
    - **PDF Export**: Cetak laporan analisis profesional langsung dari sistem.
- **Admin Panel**:
  - **Member Management**: Mengelola pengguna, peran (roles), dan batasan (limits) asesmen.
  - **Role & Permission**: Mengatur hak akses granular untuk setiap fitur.
  - **Master Data**: Mengelola data untuk _dropdown_ di seluruh aplikasi (Industri, Tipe Perusahaan, dll).
  - **Master Regulasi**: Mengunggah dan mengelola dokumen regulasi untuk referensi.

## 🛠️ Teknologi yang Digunakan

- **Backend**:
  - Framework: **Flask**
  - Database: **PostgreSQL** (via `psycopg2`)
  - ORM: **SQLAlchemy**
  - Migrasi: **Flask-Migrate** (Alembic)
  - Autentikasi: **Flask-JWT-Extended** (JWT)
  - AI: **Google Gemini** (Model: `gemini-1.5-flash` untuk analisis QRC cepat & akurat)
- **Frontend**:
  - Library: **React 18**
  - Bundler: **Vite**
  - Styling: **Tailwind CSS**
  - Komponen UI: **Tremor**
  - Client API: **Axios**
  - Routing: **React Router v7**

## ⚡ Instalasi & Konfigurasi

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah berikut:

### 1. Prasyarat

- Git
- Python 3.10+
- Node.js 18+
- PostgreSQL (atau database lain yang didukung SQLAlchemy)

### 2. Clone Repository

```bash
git clone [https://github.com/URL_GITHUB_KAMU/sirico-dev.git](https://github.com/URL_GITHUB_KAMU/sirico-dev.git)
cd sirico-dev
```

### 3. Konfigurasi Backend

1.  **Masuk ke direktori backend:**

    ```bash
    cd backend
    ```

2.  **Buat dan aktifkan virtual environment:**

    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependensi Python:**
    Buat file `requirements.txt` di dalam folder `backend` dan isi dengan dependensi berikut, lalu jalankan `pip install -r requirements.txt`.

    ```txt
    flask
    flask-sqlalchemy
    flask-migrate
    flask-bcrypt
    flask-jwt-extended
    flask-cors
    flask-marshmallow
    marshmallow-sqlalchemy
    python-dotenv
    google-generativeai
    psycopg2-binary
    feedparser
    beautifulsoup4
    lxml
    requests
    deep-translator
    openpyxl
    gunicorn
    ```

    ```bash
    pip install -r requirements.txt
    ```

4.  **Setup Database:**

    - Buat database baru di PostgreSQL (contoh: `sirico_db`).
    - Salin `.env.example` (jika ada) atau buat file `.env` baru di dalam folder `backend`.

5.  **Konfigurasi Environment Variables (`backend/.env`):**
    Isi file `.env` dengan kredensial kamu.

    ```ini
    # Ganti dengan URL koneksi database PostgreSQL kamu
    # Format: postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]
    DATABASE_URL="postgresql://postgres:password@localhost:5432/sirico_db"

    # Buat kunci rahasia yang kuat (bisa pakai `openssl rand -hex 32`)
    SECRET_KEY="KUNCI_RAHASIA_SUPER_KUAT_UNTUK_FLASK_DAN_JWT"

    # Masukkan API Key kamu dari Google AI Studio
    GEMINI_API_KEY="AIzaSy...KEY_ANDA...s9c"
    ```

### 4. Konfigurasi Frontend

1.  **Masuk ke direktori frontend (dari root proyek):**

    ```bash
    cd ../frontend
    ```

2.  **Install dependensi Node.js:**

    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables (`frontend/.env.local`):**
    Buat file `.env.local` di dalam folder `frontend` dan isi sesuai [file contoh .env.example].

    ```ini
    # URL dasar untuk API backend kita
    REACT_APP_API_BASE_URL="[http://127.0.0.1:5000/api](http://127.0.0.1:5000/api)"
    ```

## 🚀 Menjalankan Aplikasi

### 1. Inisialisasi & Migrasi Database (Backend)

Buka terminal di direktori `backend` (dengan `venv` aktif).

```bash
# Inisialisasi folder migrasi (hanya dijalankan sekali saat pertama kali)
flask db init

# Membuat file migrasi awal berdasarkan models.py
flask db migrate -m "Initial migration"

# Menerapkan migrasi ke database
flask db upgrade
```

_Catatan: Setiap kali kamu mengubah `backend/app/models.py`, jalankan `flask db migrate` dan `flask db upgrade` lagi._

### 2. Seeding Data Awal (Backend)

Proyek ini memerlukan data awal (roles, permissions, admin user, dll) untuk berfungsi. Jalankan skrip seeder:

```bash
python run_seeds.py
```

Skrip ini akan mengisi:

- Permissions: Izin granular (mis. `view_risk_dasar`, `manage_users`).
- Roles: Role "Admin" (izin penuh) dan "User" (izin dasar).
- Admin User: Akun admin default (`admin@admin.com` / `12345678`).
- Master Data: Opsi dropdown (Industri, Tipe Perusahaan, dll).
- Risk Map Templates: Template Peta Risiko default.

### 3. Menjalankan Server

Kamu perlu dua terminal yang berjalan bersamaan.

- **Terminal 1 (Backend):**
  Pastikan kamu di direktori `backend` dan `venv` aktif.

  ```bash
  python run.py
  ```

  Server Flask akan berjalan di `http://127.0.0.1:5000`.

- **Terminal 2 (Frontend):**
  Pastikan kamu di direktori `frontend`.
  ```bash
  npm run dev
  ```
  Server Vite akan berjalan di `http://localhost:5173` (atau port lain jika 5173 terpakai).

Buka `http://localhost:5173` di browser kamu untuk melihat aplikasi.

## 📁 Struktur Proyek

```
Struktur folder utama proyek ini adalah sebagai berikut:
├── backend/
│ ├── app/
│ │ ├── routes/ # API Blueprints (Auth, Admin, BIA, BPR, dll)
│ │ ├── **init**.py # Inisialisasi aplikasi Flask & blueprints
│ │ ├── ai_services.py# Logika integrasi Google Gemini
│ │ ├── models.py # Skema database SQLAlchemy
│ │ └── seeds.py # Data awal (roles, permissions, master data)
│ ├── migrations/ # Folder Alembic untuk migrasi database
│ ├── uploads/ # Tempat file (regulasi, gambar struktur) diunggah
│ ├── .env # (Perlu dibuat) Kunci API dan koneksi DB
│ ├── run.py # Entry point untuk menjalankan server Flask
│ └── run_seeds.py # Skrip untuk menjalankan database seeder
│
└── frontend/
├── public/ # Aset statis
├── src/
│ ├── api/ # Konfigurasi Axios (api.js)
│ ├── components/ # Komponen UI umum (Layout, Sidebar, dll)
│ ├── context/ # AuthContext (Manajemen state JWT)
│ ├── features/ # Komponen utama yang dikelompokkan per modul
│ │ ├── account/
│ │ ├── admin/
│ │ ├── bia/
│ │ ├── bpr/
│ │ ├── dashboard/
│ │ ├── landing/
│ │ ├── risk-ai/
│ │ ├── risk-management/
│ │ └── rsca/
│ ├── App.jsx # Definisi semua rute aplikasi
│ └── main.jsx # Entry point aplikasi React
├── .env.example # Contoh variabel lingkungan (URL API)
└── package.json # Dependensi frontend
```

## 🧭 Modul & Fungsionalitas (Lebih Rinci)

Berikut adalah penjelasan lebih rinci tentang cara kerja beberapa modul utama:

### Risk Management AI

Modul ini adalah fitur unggulan SIRICO.

- **Assessment Studio**: Pengguna mengisi formulir `CreateAssessmentForm` dengan konteks proyek (tujuan, industri, regulasi, dll).
- **AI Analysis**: Saat disubmit, data dikirim ke endpoint `/api/assessments/analyze`.
- **Gemini Service**: Backend memanggil fungsi `analyze_assessment_with_gemini`, yang menginstruksikan Google Gemini untuk bertindak sebagai CRO (Chief Risk Officer) dan menghasilkan 10 risiko paling signifikan dalam format JSON.
- **Database**: Hasil JSON dari AI disimpan ke tabel `RiskAssessment` dan `RiskRegister`.
- **Detail Page**: Pengguna diarahkan ke `AssessmentDetailPage`, di mana mereka dapat melihat, mengedit (`EditRiskItemSidebar`), dan mengelola risiko yang dihasilkan AI.
- **Import**: Risiko yang sudah final dapat diimpor ke `MainRiskRegister`.

### Risk Management Levels (Dasar & Madya)

Menyediakan alur kerja manual untuk asesmen.

- **Modul Dasar**: Dibuat berdasarkan formulir `BasicAssessmentFormPage`, mengikuti 3 tugas utama: Penetapan Konteks, Identifikasi Risiko, dan Analisis Risiko, yang kemudian dapat diekspor ke Excel.
- **Modul Madya**: Alur yang lebih kompleks. Pengguna pertama-tama memilih `RiskMapTemplate`. Kemudian, pada `MadyaAssessmentFormPage`, mereka mengisi 5 kartu:
  1.  `StrukturOrganisasiCard`: Mendefinisikan unit kerja.
  2.  `MadyaCriteriaReference`: Referensi kriteria (statis).
  3.  `SasaranKPIAppetiteCard`: Mendefinisikan KPI dan target risk appetite.
  4.  `RiskInputCard`: Formulir input risiko utama yang terhubung ke Sasaran dan Unit Kerja.
  5.  `RiskMapCard`: Visualisasi otomatis risiko (Inherent & Residual) pada Peta Risiko yang dipilih.

### Modul GRC (RSCA, BPR, BIA)

- **RSCA**: Admin membuat siklus dan pertanyaan. Pengguna dari departemen terkait (dilihat dari `user.department_id`) mengisi kuesioner. AI dapat dipanggil untuk menganalisis semua jawaban dan menemukan kelemahan.
- **BPR**: Pengguna memetakan proses bisnis dan langkah-langkahnya (`ProcessStepNode`). AI dapat memberikan saran potensi risiko untuk setiap langkah.
- **BIA**: Pengguna mendefinisikan Aset Kritis (`CriticalAsset`) dan dependensinya. AI dapat menjalankan simulasi (`analyze_bia_with_gemini`) untuk memprediksi dampak kualitatif dan kuantitatif jika sebuah aset gagal.

### Quick Risk Scan (QRC)

Modul end-to-end untuk penilaian risiko cepat antara Klien dan Konsultan.

- **Input (Client)**:
  - Menggunakan `QrcWizardPage` (Standard) atau `QrcEssayWizardPage` (Deep Analysis) untuk pengumpulan data.
  - Validasi kuota (`limit_qrc_standard`, `limit_qrc_essay`) dilakukan di backend sebelum asesmen dimulai.
- **Review (Consultant)**:
  - Konsultan mengakses `QrcReviewWorkspace` untuk melihat jawaban klien.
  - Untuk tipe Standard, skor dihitung otomatis. Untuk tipe Essay, konsultan dapat memberikan _Expert Judgment Scoring_ melalui slider manual.
  - Fitur **Generate AI Analysis** mengirimkan seluruh konteks jawaban ke Gemini Pro (`gemini-1.5-flash`) untuk menghasilkan narasi: _Ringkasan Eksekutif, Analisis Kekuatan/Kelemahan, dan Rekomendasi Strategis_.
- **Output**: Laporan final dapat diekspor ke PDF menggunakan template cetak HTML yang rapi.

### Admin Panel

Area khusus (`/admin/*`) yang dilindungi oleh `admin_required` decorator dan `ProtectedRoute`.

- **Member Management**: Menggunakan `EditUserModal` dan `AddUserModal` untuk mengelola pengguna, role, dan batasan penggunaan (limits) asesmen.
- **Role & Permission**: Mengelola peran dan izin granular yang terhubung melalui tabel `role_permissions`.

## 🤝 Kontribusi

Kontribusi sangat kami harapkan! Jika Anda memiliki ide untuk perbaikan atau menemukan bug, silakan:

1.  Fork Proyek ini
2.  Buat Branch Fitur Anda (`git checkout -b feature/FiturBaru`)
3.  Commit Perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`)
4.  Push ke Branch (`git push origin feature/FiturBaru`)
5.  Buka Pull Request

## 📜 Lisensi

Didistribusikan di bawah Lisensi MIT. Anda perlu menambahkan file `LICENSE` sendiri jika belum ada.

## 📬 Kontak

Nama Proyek: [Nama Anda/Organisasi] - (email@anda.com)

Link Proyek: [https://github.com/URL_ANDA]
