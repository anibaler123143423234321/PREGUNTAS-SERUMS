import urllib.request
import re
import os
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Referer': 'https://www.gob.pe/'
}

normas = [
    ("RM_175_2024_MINSA_NTS_211_Dengue.pdf", "https://www.gob.pe/institucion/minsa/normas-legales/5323985-175-2024-minsa"),
    ("RM_884_2022_MINSA_NTS_196_Vacunacion.pdf", "https://www.gob.pe/institucion/minsa/normas-legales/3639806-884-2022-minsa"),
    ("RM_076_2026_MINSA_NTS_243_Vacuna_Dengue.pdf", "https://www.gob.pe/institucion/minsa/normas-legales/7702844-076-2026-minsa")
]

for fname, page_url in normas:
    try:
        print(f"Fetching page: {page_url}")
        req = urllib.request.Request(page_url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        
        # Find PDF links in the page
        pdf_urls = re.findall(r'href="([^"]+\.pdf[^"]*)"', html)
        if not pdf_urls:
            # Try finding cdn uploads
            pdf_urls = re.findall(r'href="(https://cdn\.www\.gob\.pe/uploads/[^"]+)"', html)
        
        print(f"Found {len(pdf_urls)} PDF links on page")
        if pdf_urls:
            target_url = pdf_urls[0]
            print(f"Target PDF URL: {target_url}")
            
            # Download target PDF
            dest = os.path.join('e:/PREGUNTAS SERUMS/normas_tecnicas', fname)
            pdf_req = urllib.request.Request(target_url, headers=headers)
            with urllib.request.urlopen(pdf_req, timeout=30) as pdf_resp, open(dest, 'wb') as f:
                f.write(pdf_resp.read())
            print(f"Successfully saved {fname} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"Error on {fname}: {e}")
