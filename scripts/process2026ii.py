import re
import json
import csv

with open('e:/PREGUNTAS SERUMS/2026-ii/raw_extracted_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Split by questions
# Pattern for question start: e.g. "\n1. ", "\n2. ", ... "\n100. "
raw_pages = text.split('--- PAGE ')

lines = []
for p in raw_pages:
    if not p.strip(): continue
    for l in p.split('\n'):
        line_clean = l.strip()
        if not line_clean: continue
        if line_clean.startswith('Evaluación para') or line_clean.startswith('MEDICINA') or 'Página' in line_clean:
            continue
        lines.append(line_clean)

questions = []
current_q = None
current_opt = None

for line in lines:
    m_q = re.match(r'^(\d{1,3})\.\s+(.*)', line)
    if m_q and (not current_q or int(m_q.group(1)) == current_q['original_num'] + 1):
        if current_q:
            questions.append(current_q)
        current_q = {
            "original_num": int(m_q.group(1)),
            "question": m_q.group(2).strip(),
            "options": {},
            "correct_answer": "A",
            "page": (int(m_q.group(1)) - 1) // 10 + 1
        }
        current_opt = None
        continue

    m_opt = re.match(r'^([A-D])\.\s*(.*)', line)
    if m_opt and current_q:
        opt_letter = m_opt.group(1)
        current_q["options"][opt_letter] = m_opt.group(2).strip()
        current_opt = opt_letter
        continue

    if current_q:
        if current_opt:
            current_q["options"][current_opt] += " " + line
        else:
            current_q["question"] += " " + line

if current_q:
    questions.append(current_q)

print(f"Successfully extracted {len(questions)} questions from 2026-II!")

# Save to JSON
with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

# Save to CSV
with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(["N° Pregunta", "Pregunta", "Opción A", "Opción B", "Opción C", "Opción D", "Respuesta Correcta", "Texto Respuesta Correcta"])
    for q in questions:
        writer.writerow([
            q["original_num"],
            q["question"],
            q["options"].get("A", ""),
            q["options"].get("B", ""),
            q["options"].get("C", ""),
            q["options"].get("D", ""),
            q.get("correct_answer", ""),
            q["options"].get(q.get("correct_answer", "A"), "")
        ])

print("Saved respuestas_medicina.json and respuestas_medicina.csv in e:/PREGUNTAS SERUMS/2026-ii/")
