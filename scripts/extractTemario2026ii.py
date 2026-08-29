import fitz

doc = fitz.open('e:/PREGUNTAS SERUMS/TEMARIO/8412657-1-medicina-temario-evaluacion-serums-2026-ii.pdf')
print("Total pages in Temario 2026-II:", len(doc))

full_text = ""
for i, page in enumerate(doc):
    txt = page.get_text()
    full_text += f"\n=== PAGE {i+1} ===\n" + txt

with open('e:/PREGUNTAS SERUMS/TEMARIO/temario_2026_ii_texto_completo.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print("Saved full text. Total length:", len(full_text))
