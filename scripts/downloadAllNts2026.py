import urllib.request
import os

os.makedirs('e:/PREGUNTAS SERUMS/normas_tecnicas', exist_ok=True)

urls = [
    # NTS Dengue 2024 (RM 175-2024-MINSA / RM 071-2023)
    ("RM_175_2024_MINSA_NTS_211_Dengue.pdf", "https://cdn.www.gob.pe/uploads/document/file/6064210/5323985-resolucion-ministerial-n-175-2024-minsa.pdf"),
    # Esquema Nacional de Vacunacion (RM 884-2022-MINSA NTS 196)
    ("RM_884_2022_MINSA_NTS_196_Vacunacion.pdf", "https://cdn.www.gob.pe/uploads/document/file/3790130/RM%20884-2022-MINSA.pdf"),
    # Emergencias Obstetricas MINSA
    ("RM_695_2006_MINSA_Emergencias_Obstetricas.pdf", "https://cdn.www.gob.pe/uploads/document/file/418386/Gu%C3%ADa_T%C3%A9cnica_Gu%C3%ADas_de_Pr%C3%A1ctica_Cl%C3%ADnica_para_la_Atenci%C3%B3n_de_las_Emergencias_Obst%C3%A9tricas_seg%C3%BAn_Nivel_de_Capacidad_Resolutiva.pdf"),
    # Categorizacion de Establecimientos NTS 021-MINSA
    ("RM_546_2011_MINSA_NTS_021_Categorizacion_EESS.pdf", "https://cdn.www.gob.pe/uploads/document/file/418392/NTS_N%C2%B0_021-MINSA_DGSP-V.03_Norma_T%C3%A9cnica_de_Salud_Categor%C3%ADas_de_Establecimientos_del_Sector_Salud.pdf"),
    # NTS Parto Vertical con Enfoque Intercultural NTS 030
    ("NTS_030_MINSA_Parto_Vertical_Intercultural.pdf", "https://cdn.www.gob.pe/uploads/document/file/338276/d244973_opt.pdf")
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for fname, url in urls:
    dest = os.path.join('e:/PREGUNTAS SERUMS/normas_tecnicas', fname)
    if os.path.exists(dest) and os.path.getsize(dest) > 10000:
        print(f"Already exists: {fname} ({os.path.getsize(dest)} bytes)")
        continue
    try:
        print(f"Downloading {fname}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded successfully: {fname} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"Failed to download {fname}: {e}")
