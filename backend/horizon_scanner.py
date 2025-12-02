# backend/horizon_scanner.py
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from deep_translator import GoogleTranslator
import urllib.parse
import os

# Mapping Sektor ke Keyword Pencarian
SECTOR_KEYWORDS = {
    # --- GENERAL ---
    "General": ["ekonomi indonesia", "bisnis", "global economy"],
    
    # --- KEUANGAN ---
    "banking": ["perbankan", "kredit macet", "suku bunga", "banking crisis"],
    "insurance": ["asuransi", "klaim asuransi", "jiwasraya", "insurance risk"],
    "capital_market": ["pasar modal", "IHSG", "saham gorengan", "stock market"],
    "fintech": ["fintech", "pinjol", "p2p lending", "digital payment"],
    
    # --- ENERGI & SDA ---
    "mining": ["pertambangan", "batu bara", "nikel", "mining policy"],
    "oil_gas": ["migas", "minyak dunia", "bbm", "oil price"],
    "energy": ["energi terbarukan", "pln", "listrik", "energy crisis"],
    "agriculture": ["pertanian", "pangan", "pupuk", "agriculture"],
    "plantation": ["perkebunan", "kelapa sawit", "cpo", "palm oil"],
    
    # --- TEKNOLOGI ---
    "it": ["teknologi informasi", "startup", "tech winter", "layoff"],
    "telecom": ["telekomunikasi", "5g indonesia", "satelit", "telco"],
    "ecommerce": ["e-commerce", "tokopedia", "shopee", "tiktok shop"],
    
    # --- LAINNYA ---
    "manufacturing": ["manufaktur", "pabrik tutup", "industri pengolahan"],
    "healthcare": ["kesehatan", "rumah sakit", "bpjs", "pharma"],
    "construction": ["konstruksi", "bumn karya", "infrastruktur"],
    "property": ["properti", "perumahan", "apartemen", "property market"],
    "transportation": ["transportasi", "logistik", "pelabuhan", "bandara"],
    "retail": ["ritel", "pusat perbelanjaan", "daya beli", "retail"],
    "government": ["kebijakan pemerintah", "apbn", "fiskal", "regulasi"],
}

# Keyword Fallback jika industri tidak ditemukan di list spesifik
DEFAULT_KEYWORDS = ["bisnis", "ekonomi", "risiko usaha"]

def translate_text(text, target_lang='id'):
    """Menerjemahkan teks ke Bahasa Indonesia."""
    try:
        return GoogleTranslator(source='auto', target=target_lang).translate(text[:1000]) 
    except Exception as e:
        return text

class NewsScraper:
    def __init__(self, sector_key="General", specific_topics=None):
        self.sector = sector_key
        
        base_keywords = SECTOR_KEYWORDS.get(sector_key, DEFAULT_KEYWORDS)
        
        if specific_topics and isinstance(specific_topics, str) and len(specific_topics.strip()) > 0:
            custom_topics = [t.strip() for t in specific_topics.split(',')]
            self.keywords = custom_topics + base_keywords
        else:
            self.keywords = base_keywords
            
        if self.keywords:
            self.main_keyword = self.keywords[0]
        else:
            self.main_keyword = "Ekonomi" # Fallback terburuk

        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def _scrape_google_rss(self, site_query, source_label, lang='id', needs_translation=False):
        """
        Fungsi Generik untuk mengambil berita via Google News RSS.
        Metode ini jauh lebih stabil & cepat daripada scraping HTML website langsung.
        """
        results = []
        try:
            # Query format: "site:namamedia.com keyword"
            query = f"{site_query} {self.main_keyword}"
            encoded_query = urllib.parse.quote(query)
            
            # URL Google News RSS
            if lang == 'id':
                rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=id-ID&gl=ID&ceid=ID:id"
            else:
                rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"

            response = requests.get(rss_url, headers=self.headers, timeout=8)
            
            try:
                soup = BeautifulSoup(response.content, features='xml')
            except Exception:
                soup = BeautifulSoup(response.content, features='html.parser') # Fallback

            items = soup.findAll('item')[:5] # Ambil 5 berita terbaru per sumber

            for item in items:
                title = item.title.text if item.title else "No Title"
                link = item.link.text if item.link else "#"
                pub_date = item.pubDate.text if item.pubDate else str(datetime.now())
                
                # Bersihkan judul dari nama media (biasanya Google nambahin " - Detikcom")
                if " - " in title:
                    title = title.rsplit(" - ", 1)[0]

                # Terjemahkan jika sumber asing (seperti Reuters)
                if needs_translation:
                    original_title = title
                    title = translate_text(title, 'id')
                else:
                    original_title = None

                results.append({
                    "source": source_label,
                    "title": title,
                    "original_title": original_title,
                    "url": link,
                    "image": None, # RSS tidak menyediakan gambar, biarkan null (frontend handle placeholder)
                    "summary": f"Berita terkini dari {source_label} mengenai {self.main_keyword}.",
                    "published_at": pub_date,
                    "language": "en-translated" if needs_translation else "id"
                })
                
        except Exception as e:
            print(f"Error scraping {source_label}: {e}")
        
        return results

    def scrape_cnbc_indonesia(self):
        return self._scrape_google_rss("site:cnbcindonesia.com", "CNBC Indonesia", 'id')

    def scrape_cnn_indonesia(self):
        return self._scrape_google_rss("site:cnnindonesia.com", "CNN Indonesia", 'id')

    def scrape_detik_finance(self):
        return self._scrape_google_rss("site:finance.detik.com", "Detik Finance", 'id')

    def scrape_reuters_global(self):
        return self._scrape_google_rss("site:reuters.com", "Reuters (Global)", 'en', needs_translation=True)
    
    def scrape_kompas(self):
        # Bonus: Tambahan sumber Kompas
        return self._scrape_google_rss("site:kompas.com", "Kompas Ekonomi", 'id')

def run_horizon_scan(sector="General", specific_topics=None):
    """
    Menjalankan scraper dengan input topik spesifik.
    """
    scraper = NewsScraper(sector, specific_topics)
    all_news = []
    
    # Daftar fungsi scraper yang akan dijalankan
    tasks = [
        scraper.scrape_cnbc_indonesia,
        scraper.scrape_cnn_indonesia,
        scraper.scrape_detik_finance,
        scraper.scrape_reuters_global,
        scraper.scrape_kompas
    ]

    # Eksekusi Paralel
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_url = {executor.submit(task): task for task in tasks}
        for future in as_completed(future_to_url):
            try:
                data = future.result()
                all_news.extend(data)
            except Exception as exc:
                print(f'Scraper generated an exception: {exc}')

    return all_news