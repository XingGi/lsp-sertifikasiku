import os
import google.generativeai as genai
from dotenv import load_dotenv

# Muat environment variable dari .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY tidak ditemukan di file .env")
else:
    try:
        genai.configure(api_key=api_key)

        print("\n" + "="*40)
        print(" MENCARI MODEL GEMINI YANG TERSEDIA")
        print("="*40)

        found_models = False
        for m in genai.list_models():
            # Kita hanya akan menampilkan model yang mendukung 'generateContent'
            if 'generateContent' in m.supported_generation_methods:
                print(f"-> {m.name}")
                found_models = True

        if not found_models:
            print("Tidak ada model yang mendukung 'generateContent' ditemukan.")

        print("="*40)
        print("\n>>> Salin dan gunakan salah satu nama model di atas (contoh: 'models/gemini-pro') di file ai_services.py Anda.\n")

    except Exception as e:
        print(f"\nTerjadi error saat mencoba mengambil daftar model: {e}")
        print("Pastikan API Key Anda valid dan memiliki akses ke Generative Language API.")