import urllib.request
import re
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://www.gob.pe/'
}

def inspect_and_download_attachments(url, prefix):
    print(f"\n--- Checking {url} ---")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    # Extract all document links with their titles/anchors
    matches = re.findall(r'<a[^>]+href="([^"]+uploads/document/file/[^"]+)"[^>]*>(.*?)</a>', html, re.DOTALL)
    print(f"Found {len(matches)} upload document links:")
    for idx, (link, title) in enumerate(matches):
        clean_title = re.sub(r'<[^>]+>', '', title).strip()
        print(f" [{idx+1}] {clean_title} -> {link}")
        
        # Download each file to check size and content
        out_name = f"e:/PREGUNTAS SERUMS/normas_tecnicas/{prefix}_att_{idx+1}.pdf"
        try:
            p_req = urllib.request.Request(link, headers=headers)
            with urllib.request.urlopen(p_req, timeout=30) as p_resp, open(out_name, 'wb') as f:
                f.write(p_resp.read())
            print(f"     Downloaded {out_name} ({os.path.getsize(out_name)} bytes)")
        except Exception as e:
            print(f"     Download error: {e}")

# Inspect RM 884-2022 (Vacunacion) and RM 175-2024 (Dengue)
inspect_and_download_attachments("https://www.gob.pe/institucion/minsa/normas-legales/3639806-884-2022-minsa", "vacunacion_884")
inspect_and_download_attachments("https://www.gob.pe/institucion/minsa/normas-legales/5323985-175-2024-minsa", "dengue_175")
