import os
import psycopg2
from dotenv import load_dotenv

# Memuat variabel dari file .env
load_dotenv()

# Mengambil URL database dari environment
db_url = os.getenv("DATABASE_URL")

print("Mencoba terhubung ke database...")
print(f"URL: {db_url}")

try:
    # Mencoba membuat koneksi
    conn = psycopg2.connect(db_url)
    
    # Jika berhasil, tutup koneksi dan beri pesan sukses
    conn.close()
    
    print("\n✅ SUKSES! Koneksi ke database PostgreSQL berhasil.")
    
except Exception as e:
    # Jika gagal, tampilkan error
    print("\n❌ GAGAL! Tidak bisa terhubung ke database.")
    print(f"Error: {e}")