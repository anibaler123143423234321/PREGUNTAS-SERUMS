import urllib.request
import os
import fitz

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Referer': 'https://www.gob.pe/'
}

dengue_url = "https://cdn.www.gob.pe/uploads/document/file/289206/071-2017-MINSA.PDF"
dest_dengue = "e:/PREGUNTAS SERUMS/normas_tecnicas/GPC_MINSA_Dengue_Atencion_Clinica.pdf"

try:
    print("Downloading GPC Dengue...")
    req = urllib.request.Request(dengue_url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp, open(dest_dengue, 'wb') as f:
        f.write(resp.read())
    
    doc = fitz.open(dest_dengue)
    print(f"Downloaded GPC Dengue successfully! Total pages: {len(doc)}, Size: {os.path.getsize(dest_dengue)} bytes")
    print(f"Page 1 Text:\n{doc[0].get_text()[:300]}")
except Exception as e:
    print(f"Error downloading dengue: {e}")
