import google.generativeai as genai
import re
import json
import os
from app.models.master import MasterData

def configure_genai():
    """
    [BARU] Fungsi Helper untuk konfigurasi API Key.
    Prioritas:
    1. Ambil dari Database (MasterData)
    2. Fallback ke Environment Variable (.env)
    """
    api_key = None
    
    # 1. Coba ambil dari Database
    try:
        config = MasterData.query.filter_by(category='SYSTEM_CONFIG', key='GEMINI_API_KEY').first()
        if config and config.value:
            api_key = config.value
    except Exception as e:
        print(f"Warning: Gagal membaca API Key dari DB, mencoba environment variable. Error: {e}")

    # 2. Fallback ke .env jika di DB kosong
    if not api_key:
        api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        # Lempar error agar bisa ditangkap oleh fungsi pemanggil
        raise ValueError("Gemini API Key tidak ditemukan di Database maupun .env!")

    # Konfigurasi ulang genai
    genai.configure(api_key=api_key)

def summarize_text_with_gemini(text_to_summarize: str) -> str | None:
    """
    Meringkas teks menggunakan Google Gemini API menjadi 3 poin.

    Args:
        text_to_summarize: Teks panjang yang akan diringkas.
        api_key: Kunci API untuk Google AI Studio.

    Returns:
        String berisi ringkasan dalam 3 poin, atau None jika terjadi error.
    """
    try:
        # Konfigurasi API key
        configure_genai()

        # Inisialisasi model
        model = genai.GenerativeModel('gemini-2.5-pro')

        # Membuat prompt yang spesifik untuk AI
        prompt = f"""
        Anda adalah seorang analis risiko yang ahli. 
        Ringkas teks berikut menjadi tepat 3 (tiga) poin utama yang paling krusial. 
        Gunakan format bullet points (markdown) untuk setiap poin.

        Teks untuk diringkas:
        ---
        {text_to_summarize}
        ---
        """

        # Mengirim prompt ke model AI
        response = model.generate_content(prompt)

        # Mengembalikan hasil teks dari respons
        return response.text

    except Exception as e:
        # Penanganan error jika terjadi masalah saat memanggil API
        print(f"Error saat memanggil Gemini API: {e}")
        return None
    
def analyze_rsca_answers_with_gemini(text):
    """Menganalisis jawaban RSCA dan mengembalikan ringkasan terstruktur dalam Markdown."""
    configure_genai()
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    prompt = f"""
    PERAN: Anda adalah seorang analis GRC (Governance, Risk, and Compliance) profesional.
    TUGAS: Analisis jawaban kuesioner RSCA (Risk & Control Self-Assessment) dari berbagai departemen. Buatlah laporan analisis yang rapi, tersusun, dan jelas dalam format MARKDOWN.

    JAWABAN KUESIONER UNTUK DIANALISIS:
    ---
    {text}
    ---

    INSTRUKSI LAPORAN (Harus dalam format Markdown):

    ## 1. Kesimpulan Ringkas (Executive Summary)
    (Berikan ringkasan 2-3 kalimat tentang temuan utama dan kesehatan kontrol secara keseluruhan berdasarkan jawaban.)

    ## 2. Analisis Profil Risiko & Temuan Utama
    (Identifikasi tema risiko yang muncul. Apakah ada risiko spesifik, seperti 'Risiko Keamanan Siber' atau 'Risiko Kepatuhan', yang sering dilaporkan 'Tidak Efektif' atau 'Perlu Perbaikan'? Sebutkan temuan paling kritis.)

    ## 3. Prioritas Tindakan Segera
    (Berdasarkan temuan di atas, berikan daftar 3 prioritas tindakan perbaikan yang paling mendesak.)

    ## 4. Pembahasan Risiko Kritis (Jika Ada)
    (Jelaskan secara singkat mengapa temuan 'Tidak EfektIF' atau 'Perlu Perbaikan' yang paling menonjol itu penting dan apa potensial dampaknya jika tidak ditangani.)

    ## 5. Rencana Implementasi & Langkah Selanjutnya
    (Sarankan langkah-langkah umum berikutnya untuk Manajer Risiko, seperti 'Melakukan investigasi mendalam pada Departemen IT' atau 'Menjadwalkan pelatihan kepatuhan'.)
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error saat memanggil Gemini: {e}")
        return None
    
def suggest_risks_for_process_step(step_description: str) -> str | None:
    """
    Memberikan saran potensi risiko berdasarkan deskripsi sebuah langkah proses.
    """
    try:
        configure_genai()
        model = genai.GenerativeModel('gemini-2.5-pro')

        prompt = f"""
        Anda adalah seorang konsultan manajemen risiko dan auditor internal yang sangat berpengalaman.
        Berdasarkan deskripsi singkat dari sebuah langkah dalam proses bisnis berikut, 
        identifikasi dan sebutkan 5 (lima) potensi risiko paling umum yang bisa terjadi.

        Sajikan hasilnya HANYA sebagai daftar nama risiko. Setiap nama risiko harus berada di baris baru.
        JANGAN gunakan bullet points, penomoran, atau karakter tambahan apa pun.

        Contoh output yang diinginkan:
        Risiko A
        Risiko B
        Risiko C
        Risiko D
        Risiko E

        Deskripsi Langkah Proses:
        ---
        {step_description}
        ---
        """
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Error saat menyarankan risiko dengan Gemini API: {e}")
        return None
    
def analyze_bia_with_gemini(failed_asset_name: str, downtime: int, impacted_assets: list, kris: list) -> str | None:
    """
    Menganalisis dampak bisnis dari sebuah aset yang lumpuh menggunakan Gemini.
    """
    try:
        configure_genai()
        model = genai.GenerativeModel('gemini-2.5-pro')

        # Format data yang dikumpulkan menjadi teks yang mudah dibaca AI
        impacted_assets_str = ", ".join(impacted_assets) if impacted_assets else "Tidak ada aset lain yang terdampak langsung."
        kri_str = "\n".join([f"- {kri['nama_kri']} (Batas Kritis: {kri['ambang_batas_kritis']})" for kri in kris]) if kris else "Tidak ada data KRI relevan yang tersedia."

        prompt = f"""
        Anda adalah seorang ahli Business Continuity dan konsultan manajemen risiko kelas dunia.
        Lakukan sebuah simulasi Business Impact Analysis (BIA).

        Skenario:
        - Aset Kritis yang Gagal: "{failed_asset_name}"
        - Estimasi Waktu Henti (Downtime): {downtime} jam
        - Aset Lain yang Terdampak (karena ketergantungan): {impacted_assets_str}
        - Key Risk Indicators (KRI) relevan untuk konteks finansial/operasional:
        {kri_str}

        Tugas Anda:
        Buat laporan analisis dampak yang ringkas namun informatif. Laporan harus memiliki dua bagian jelas:

        1.  **Analisis Dampak Kualitatif:** Jelaskan potensi dampak non-finansial dalam 3 poin utama. Fokus pada dampak terhadap operasional, reputasi perusahaan, dan kepuasan pelanggan.
        
        2.  **Estimasi Dampak Kuantitatif:** Berdasarkan skenario dan data KRI yang diberikan, berikan estimasi kasar (order-of-magnitude) mengenai potensi kerugian finansial. Jelaskan secara singkat bagaimana Anda sampai pada estimasi tersebut.

        Sajikan hasilnya dalam format Markdown dan table yang rapi.
        """
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Error saat menganalisis BIA dengan Gemini API: {e}")
        return None
    
def analyze_assessment_with_gemini(form_data: dict) -> list | None:
    """
    Menganalisis data lengkap dari form asesmen untuk menghasilkan Risk Register yang detail.
    """
    try:
        configure_genai()
        json_config = genai.GenerationConfig(response_mime_type="application/json")
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config=json_config)

        konteks = f"""
        **Nama Proyek:** {form_data.get('nama_asesmen')}
        **Info Perusahaan:** Industri: {form_data.get('company_industry')}, Tipe: {form_data.get('company_type')}
        **Regulasi Terkait:** {form_data.get('relevant_regulations')}
        **Tujuan Proyek:** {form_data.get('project_objective')}
        **Konteks Tambahan:** {form_data.get('additional_risk_context')}
        """

        prompt = f"""
        Anda adalah seorang Chief Risk Officer (CRO) profesional. Berdasarkan konteks proyek di bawah ini, identifikasi 10 potensi risiko paling signifikan.
        Jawaban Anda HARUS berupa array JSON yang valid. Setiap objek dalam array harus memiliki kunci-kunci berikut: "title", "objective", "risk_type", "risk_description", "potential_cause", "potential_impact", "existing_control", "control_effectiveness", "inherent_likelihood", "inherent_impact", "mitigation_plan", "residual_likelihood", "residual_impact".

        - "title": (WAJIB) Buat judul risiko yang singkat dan deskriptif, maksimal 5-7 kata.
        - "objective" adalah tujuan dari mitigasi risiko.
        - "risk_type" harus salah satu dari: 'RP' (Risiko Pasar), 'RK' (Risiko Kepatuhan), 'RO' (Risiko Operasional), atau 'RR' (Risiko Reputasi).
        - "control_effectiveness" harus salah satu dari: 'Not Effective', 'Partially Effective', 'Fully Effective'.
        - Semua skor likelihood dan impact HARUS berupa angka integer antara 1 dan 5.
        - Semua field lain HARUS berupa string singkat dan jelas dalam Bahasa Indonesia.
        - JANGAN menyertakan kunci "kode_risiko" dalam output JSON Anda.
        - Pastikan outputnya adalah array JSON yang valid.

        Konteks Proyek:
        ---
        {konteks}
        ---
        """

        response = model.generate_content(prompt)
        
        print("--- RAW AI RESPONSE ---"); print(response.text); print("-----------------------")
        
        # cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        
        parsed_risks = json.loads(response.text)

        risks_for_db = []
        # Gunakan enumerate untuk mendapatkan 'i' (index)
        for i, risk in enumerate(parsed_risks): 
            risk_type_prefix = risk.get('risk_type', 'XX').upper()
            
            risks_for_db.append({
                "title": risk.get('title'),
                # "kode_risiko": kode_risiko,
                "objective": risk.get('objective'),
                "risk_type": risk.get('risk_type'),
                "deskripsi_risiko": risk.get('risk_description'),
                "risk_causes": risk.get('potential_cause'),
                "risk_impacts": risk.get('potential_impact'),
                "existing_controls": risk.get('existing_control'),
                "control_effectiveness": risk.get('control_effectiveness'),
                "inherent_likelihood": risk.get('inherent_likelihood'),
                "inherent_impact": risk.get('inherent_impact'),
                "mitigation_plan": risk.get('mitigation_plan'),
                "residual_likelihood": risk.get('residual_likelihood'),
                "residual_impact": risk.get('residual_impact'),
            })
        return risks_for_db

    except Exception as e:
        print(f"Error saat menganalisis asesmen dengan Gemini API: {e}")
        return None
    
def generate_detailed_risk_analysis_with_gemini(risks: list) -> dict | None:
    """
    Menganalisis daftar risiko dan menghasilkan laporan multi-bagian yang mendalam.
    """
    try:
        configure_genai()
        model = genai.GenerativeModel('gemini-2.5-pro')

        risk_details = ""
        for r in risks:
            likelihood = r.get('inherent_likelihood') or 0
            impact = r.get('inherent_impact') or 0
            risk_level_score = likelihood * impact
            risk_details += f"- Kode: {r.get('kode_risiko')}, Deskripsi: {r.get('deskripsi_risiko')} (Level Inherent: {risk_level_score}, Tipe: {r.get('risk_type')})\n"

        prompt = f"""
        Anda adalah seorang Chief Risk Officer (CRO) virtual kelas dunia. Anda sedang menyiapkan laporan analisis risiko untuk dewan direksi.
        Berdasarkan daftar risiko yang telah diidentifikasi berikut ini:
        ---
        {risk_details}
        ---
        Buatlah laporan analisis yang komprehensif. Jawaban Anda HARUS berupa sebuah objek JSON tunggal yang valid tanpa markdown.
        Objek JSON tersebut harus memiliki kunci-kunci berikut: "executive_summary", "risk_profile_analysis", "immediate_priorities", "critical_risks_discussion", "implementation_plan", "next_steps".

        Ikuti instruksi detail untuk setiap kunci:
        1. "executive_summary": (string) Tulis paragraf kesimpulan umum (4-5 kalimat) tentang lanskap risiko proyek ini.
        2. "risk_profile_analysis": (object) Buat objek dengan dua kunci: "summary" (sebuah paragraf string yang menganalisis distribusi risiko) dan "distribution" (sebuah objek yang berisi jumlah risiko untuk setiap level, contoh: {{"High": 2, "Moderate to High": 3, ...}}).
        3. "immediate_priorities": (array of strings) Identifikasi 3 area prioritas teratas yang memerlukan tindakan segera, sajikan sebagai array string.
        4. "critical_risks_discussion": (array of objects) Pilih 2 risiko paling kritis dari daftar. Untuk setiap risiko, buat objek dengan kunci: "risk_code" (string), "discussion" (paragraf string yang membahas mengapa risiko ini kritis), dan "mitigation_target" (string, contoh: "Target mitigasi ini adalah Q2 2026.").
        5. "implementation_plan": (array of strings) Buat daftar 4 langkah implementasi mitigasi yang paling penting, beri target kuartal (contoh: "Q1 2026: Lakukan audit keamanan siber menyeluruh.").
        6. "next_steps": (string) Tulis satu paragraf berisi rekomendasi langkah selanjutnya yang lebih bersifat umum dan strategis.
        """

        response = model.generate_content(prompt)
        
        try:
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                json_string = match.group(0)
                analysis_result = json.loads(json_string)
                return analysis_result
            else:
                return None
        except (json.JSONDecodeError, TypeError):
            print("Peringatan: Gagal mem-parse output dari AI untuk analisis detail. Output mentah:")
            print(response.text)
            return None

    except Exception as e:
        print(f"Error saat membuat analisis detail dengan Gemini API: {e}")
        return None
    
def summarize_horizon_scan(scan_params, news_list):
    """
    Menganalisis daftar berita dan membuat laporan intelijen risiko strategis
    dengan fokus pada kompetitor dan implikasi bisnis.
    """
    try:
        configure_genai()
    except ValueError as e:
         return "Konfigurasi Error", f"<p>Error: {str(e)}</p>"
    
    try:
        generation_config = {
            "temperature": 0.3,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
    
        model = genai.GenerativeModel('gemini-2.5-pro', generation_config=generation_config)

        # Siapkan data berita untuk prompt
        news_context = ""
        for idx, news in enumerate(news_list[:15]): 
            news_context += f"{idx+1}. [{news.get('source', 'N/A')}] {news.get('title', '')}: {news.get('summary', '')}\n"

        industry = scan_params.get('industry', 'Umum')
        competitors_raw = scan_params.get('input_competitors', '')
        topics_raw = scan_params.get('input_topics', '')
        competitors = competitors_raw if competitors_raw.strip() else '-'
        topics = topics_raw if topics_raw.strip() else '-'

        risk_cats = scan_params.get('risk_categories', [])
        value_chains = scan_params.get('value_chain', [])
        
        focus_instruction = ""
        if len(risk_cats) > 4 or len(value_chains) > 4:
            focus_instruction = "(PENTING: Karena cakupan luas, JANGAN bahas semua kategori satu per satu. Identifikasi dan bahas HANYA 3-5 area dengan dampak paling kritikal/signifikan.)"
        else:
            focus_instruction = "(Bahas secara spesifik area-area yang dipilih di atas)."
            
        prompt = f"""
        BERTINDAK SEBAGAI:
        Chief Risk Officer (CRO) Korporat. Anda menyusun 'Strategic Intelligence Brief' untuk {scan_params.get('report_perspective', 'Board of Directors')}.

        KONTEKS ORGANISASI:
        • Industri: {industry}
        • Lingkup: {scan_params.get('geo_scope')}
        • Horizon: {scan_params.get('time_horizon')}
        • Selera Risiko: {scan_params.get('risk_appetite')}
        • Strategi: {scan_params.get('strategic_driver')}
        
        LINGKUP ANALISIS (INPUT USER):
        • KOMPETITOR (ENTITAS BISNIS): {competitors} 
        (Catatan: Ini adalah nama-nama perusahaan pesaing. Fokus pada pergerakan bisnis, market share, atau strategi mereka.)
        • TOPIK SPESIFIK (ISU/TREN): {topics}
        (Catatan: Ini adalah isu spesifik yang sedang dipantau.)
        • Kategori Risiko Terpilih: {', '.join(risk_cats)}
        • Value Chain Terpilih: {', '.join(value_chains)}
        
        DATA BERITA (NEWS FEED):
        {news_context}

        INSTRUKSI PENULISAN (STRICT):
        1. Gunakan Bahasa Indonesia Bisnis Formal (C-Level Executive Style).
        2. {focus_instruction} <- IKUTI INI AGAR TIDAK STUCK.
        3. Analisis harus menghubungkan berita eksternal dengan posisi kompetitor dan strategi perusahaan.
        4. Gunakan struktur HTML di bawah ini (Hanya body, tanpa head/html tag).

        FORMAT OUTPUT JSON:
        {{
            "title": "Judul Laporan (Max 8 kata, Tajam & Strategis)",
            "report_html": "HTML Content..."
        }}

        STRUKTUR HTML:
        
        <h3>1. Executive Intelligence Summary</h3>
        <p>[Sintesis level tinggi situasi pasar saat ini. Apakah sentimen mendukung strategi '{scan_params.get('strategic_driver')}'? Jawab dalam 1-2 paragraf padat.]</p>

        <h3>2. Competitor Landscape & Market Dynamics</h3>
        <p>[Analisis pergerakan kompetitor ({competitors}) atau tren pasar. Apakah ada ancaman disrupsi? Fokus pada implikasi bagi kita.]</p>

        <h3>3. Impact on Strategic Objectives</h3>
        <p>[Analisis dampak langsung terhadap Revenue, Cost, atau Reputasi perusahaan berdasarkan berita yang ada.]</p>

        <h3>4. Key Risks Analysis (Prioritized)</h3>
        <ul>
            <li><strong>Critical Threats:</strong> [Sebutkan risiko dengan dampak terbesar saat ini]</li>
            <li><strong>Emerging Risks:</strong> [Sinyal risiko baru yang perlu diwaspadai di masa depan]</li>
        </ul>

        <h3>5. Value Chain Vulnerabilities</h3>
        <p>[Identifikasi titik lemah pada rantai nilai. Fokus pada area yang paling tertekan (misal Supply Chain atau IT).]</p>

        <h3>6. Strategic Opportunities (Upside Risk)</h3>
        <ul>
            <li>[Peluang 1: Cara memanfaatkan situasi/kelemahan kompetitor]</li>
            <li>[Peluang 2: Inovasi atau celah pasar yang terbuka]</li>
        </ul>

        <h3>7. Priority Mitigation & Action Plan</h3>
        <ol>
            <li><strong>Strategic Response:</strong> [Keputusan level direksi]</li>
            <li><strong>Operational Action:</strong> [Tindakan taktis segera]</li>
            <li><strong>Monitoring Focus:</strong> [Indikator yang harus dipantau ketat]</li>
        </ol>
        """

        response = model.generate_content(prompt)
        text_resp = response.text.strip()
        
        # Pembersihan format JSON
        if text_resp.startswith("```json"): text_resp = text_resp.replace("```json", "", 1)
        if text_resp.startswith("```"): text_resp = text_resp.replace("```", "", 1)
        if text_resp.endswith("```"): text_resp = text_resp[:-3]
            
        data = json.loads(text_resp)
        return data.get('title'), data.get('report_html')
    
    except Exception as e:
        print(f"AI Horizon Scan Error: {e}")
        return f"Laporan Horizon Scan: {industry}", f"<p>Maaf, terjadi kesalahan pemrosesan AI (Timeout/Limit). Mohon kurangi jumlah kategori yang dipilih atau coba lagi. Detail: {str(e)}</p>"
  
# Quick Risk Check (QRC)  
def analyze_qrc_assessment(assessment_type, answers_data, client_name, institution):
    """
    Menganalisis hasil Quick Risk Check (QRC) menggunakan Gemini.
    Mendukung tipe 'standard' (Multiple Choice) dan 'essay' (Kualitatif).
    Output: Format Surat Resmi Konsultan (Letter Style).
    """
    try:
        configure_genai()
        
        # 1. Konstruksi Prompt berdasarkan Tipe
        prompt_context = f"""
        PERAN: Anda adalah Senior Risk Management Consultant dari SIRICO.
        TUGAS: Buatlah Laporan Analisis Risiko Eksekutif dalam bentuk **SURAT RESMI** untuk klien di bawah ini.
        
        DATA KLIEN:
        Nama: {client_name}
        Institusi: {institution}
        Tipe Asesmen: {assessment_type.upper()}
        
        Data Jawaban Klien:
        {json.dumps(answers_data, indent=2)}
        
       INSTRUKSI GAYA BAHASA & FORMATTING (PENTING):
        1.  **Format Surat:** Gunakan struktur surat resmi (Kepada, Perihal, Salam Pembuka, Isi, Salam Penutup).
        2.  **Gaya Bahasa:** Profesional, konsultatif, strategis, dan meyakinkan (C-Level Executive Style).
        3.  **Penggunaan BOLD (Tebal):** HANYA gunakan bold untuk **Judul Bagian** (Header) dan **Nama Poin Utama**. JANGAN gunakan bold di tengah kalimat deskripsi agar teks terlihat bersih dan elegan.
        4.  **Isi Analisis:** Jangan sekadar mengulang jawaban. Berikan *insight* mengapa suatu hal menjadi kekuatan atau kelemahan (analisis dampak).
        5. Analisis jawaban di atas secara komprehensif.
        6. Identifikasi Area Kelemahan Utama (Key Vulnerabilities).
        7. Identifikasi Area Kekuatan (Key Strengths).
        8. Berikan 3-5 Rekomendasi Strategis yang konkret dan dapat ditindaklanjuti (Actionable Insights).
        9. Gunakan bahasa Indonesia yang profesional, formal, dan meyakinkan.
        
        STRUKTUR OUTPUT YANG DIHARAPKAN (MARKDOWN):
        
        **Kepada Yth. Bapak/Ibu {client_name}**
        **{institution}**

        **Perihal: Laporan Analisis Risiko (Quick Risk Scan) & Rekomendasi Strategis**

        Dengan hormat,

        [Paragraf Pembuka: Ucapan terima kasih formal atas kepercayaan melakukan asesmen dan pengantar tujuan dokumen ini.]

        ### Ringkasan Eksekutif
        [Satu atau dua paragraf naratif yang merangkum 'Big Picture' profil risiko klien. Jelaskan apakah mereka cenderung reaktif atau proaktif, dan sebutkan urgensi pembenahan secara umum.]

        ### Analisis Kekuatan & Kelemahan
        Berdasarkan data asesmen, kami memetakan postur risiko Anda sebagai berikut:

        **Kekuatan Utama (Key Strengths)**
        * **[Nama Kekuatan 1]:** [Penjelasan mengapa ini menjadi aset positif bagi perusahaan.]
        * **[Nama Kekuatan 2]:** [Penjelasan mengapa ini menjadi aset positif bagi perusahaan.]

        **Area Perbaikan (Key Vulnerabilities)**
        * **[Nama Kelemahan 1]:** [Penjelasan risiko atau dampak negatif jika hal ini tidak diperbaiki.]
        * **[Nama Kelemahan 2]:** [Penjelasan risiko atau dampak negatif jika hal ini tidak diperbaiki.]

        ### Rekomendasi Strategis
        Untuk memperkuat ketahanan organisasi, kami merekomendasikan langkah-langkah prioritas berikut:

        1.  **[Judul Strategis 1]**
            [Penjelasan langkah implementasi konkret.]

        2.  **[Judul Strategis 2]**
            [Penjelasan langkah implementasi konkret.]

        3.  **[Judul Strategis 3]**
            [Penjelasan langkah implementasi konkret.]

        [Paragraf Penutup: Kalimat penutup profesional yang menawarkan diskusi lebih lanjut untuk pendampingan implementasi.]

        Hormat kami,

        **Tim Konsultan SIRICO**
        """

        # 2. Panggil Gemini
        model = genai.GenerativeModel('gemini-2.5-pro')
        response = model.generate_content(prompt_context)
        
        clean_text = response.text.strip()
        
        return clean_text

    except Exception as e:
        print(f"Error in analyze_qrc_assessment: {e}")
        return "Maaf, terjadi kesalahan saat menghasilkan analisis AI. Silakan coba lagi nanti atau lakukan analisis manual."