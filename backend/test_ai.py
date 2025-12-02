import os
from dotenv import load_dotenv
from app.ai_services import summarize_text_with_gemini # Impor fungsi kita

# Muat environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Contoh teks panjang untuk diringkas
contoh_teks = """
Rapat dewan direksi kuartal ketiga membahas beberapa tantangan utama. 
Pertama, laba bersih turun 15% dibandingkan kuartal sebelumnya karena kenaikan biaya bahan baku yang tidak terduga.
Tim keuangan menyarankan penyesuaian harga jual sebesar 5% untuk menutupi biaya ini.
Kedua, laporan dari tim operasional menunjukkan adanya peningkatan waktu henti (downtime) pada mesin produksi utama sebesar 20%, 
yang berdampak pada keterlambatan pengiriman ke klien-klien penting. Rencana perbaikan dan pemeliharaan preventif mendesak untuk segera diimplementasikan.
Terakhir, survei kepuasan karyawan menunjukkan penurunan moral yang signifikan, terutama di departemen penjualan, 
yang mengeluhkan target yang tidak realistis dan kurangnya dukungan manajemen.
"""

if api_key:
    print("Mencoba meringkas teks dengan Gemini...")
    ringkasan = summarize_text_with_gemini(contoh_teks, api_key)
    if ringkasan:
        print("\n--- HASIL RINGKASAN ---")
        print(ringkasan)
    else:
        print("\nGagal mendapatkan ringkasan.")
else:
    print("GEMINI_API_KEY tidak ditemukan di file .env")