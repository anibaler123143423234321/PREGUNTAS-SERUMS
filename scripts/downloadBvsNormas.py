import urllib.request
import re
import os
import fitz

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://www.gob.pe/'
}

# Try multiple mirror links for the full NTS 196 Vacunacion PDF
urls = [
    ("NTS_196_MINSA_Esquema_Vacunacion_Completo.pdf", "https://cdn.www.gob.pe/uploads/document/file/3790130/RM%20884-2022-MINSA.pdf"),
    ("NTS_196_MINSA_Esquema_Vacunacion_Completo.pdf", "https://bvs.minsa.gob.pe/local/MINSA/5888.pdf"),
    ("NTS_105_MINSA_Salud_Materna_Emergencias.pdf", "https://bvs.minsa.gob.pe/local/MINSA/3282.pdf"),
    ("NTS_021_MINSA_Categorizacion_Establecimientos.pdf", "https://bvs.minsa.gob.pe/local/MINSA/1782.pdf")
]

for fname, url in urls:
    dest = os.path.join('e:/PREGUNTAS SERUMS/normas_tecnicas', fname)
    if os.path.exists(dest) and os.path.getsize(dest) > 50000:
        print(f"File already verified: {fname} ({os.path.getsize(dest)} bytes)")
        continue
    try:
        print(f"Trying to download {fname} from {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) > 20000:
                with open(dest, 'wb') as f:
                    f.write(data)
                doc = fitz.open(dest)
                print(f"SUCCESS: {fname} downloaded! Pages: {len(doc)}, Size: {len(data)} bytes")
            else:
                print(f"File too small ({len(data)} bytes), skipping")
    except Exception as e:
        print(f"Failed {url}: {e}")
