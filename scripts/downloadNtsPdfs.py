import urllib.request
import os

os.makedirs('e:/PREGUNTAS SERUMS/normas_tecnicas', exist_ok=True)

urls = {
    'RM_251_2024_MINSA_NTS_213_Anemia.pdf': 'https://cdn.www.gob.pe/uploads/document/file/6166763/5440166-resolucion-ministerial-n-251-2024-minsa.pdf',
    'SERUMS_2026_II_Medicina_Oficial.pdf': 'https://cdn.www.gob.pe/uploads/document/file/10466647/8489155-medicina.pdf?v=1787003101'
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for fname, url in urls.items():
    dest = os.path.join('e:/PREGUNTAS SERUMS/normas_tecnicas', fname)
    print(f"Downloading {fname} from {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp, open(dest, 'wb') as out_file:
            out_file.write(resp.read())
        print(f"  -> SUCCESS: Saved {dest} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"  -> ERROR downloading {fname}: {e}")

print("Done downloading official NTS files!")
