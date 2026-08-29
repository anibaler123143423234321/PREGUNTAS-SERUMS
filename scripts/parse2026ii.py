import fitz
import re
import json
import csv

doc = fitz.open('e:/PREGUNTAS SERUMS/2026-ii/respuestas/8489155-medicina.pdf')
full_text = ""
for page_num, page in enumerate(doc):
    txt = page.get_text()
    full_text += f"\n--- PAGE {page_num + 1} ---\n" + txt

with open('e:/PREGUNTAS SERUMS/2026-ii/raw_extracted_text.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print("Saved raw text. Total length:", len(full_text))
