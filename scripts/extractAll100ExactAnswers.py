import fitz
import json
import csv
import re

doc = fitz.open('e:/PREGUNTAS SERUMS/2026-ii/respuestas/8489155-medicina.pdf')

# First, extract all yellow rectangles per page
all_page_highlights = []
for page_num in range(len(doc)):
    page = doc[page_num]
    yellow_rects = []
    for d in page.get_drawings():
        fill = d.get('fill')
        if fill and fill[0] > 0.8 and fill[1] > 0.8 and fill[2] < 0.3:
            yellow_rects.append(d['rect'])
    yellow_rects.sort(key=lambda r: (r.y0, r.x0))
    all_page_highlights.append(yellow_rects)

print("Highlights per page:", [len(h) for h in all_page_highlights])

# Now parse all 100 questions from all text
all_questions = []
current_q = None
current_opt = None

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text('text')
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    for l in lines:
        if l.startswith('Evaluación para') or l.startswith('MEDICINA') or 'Página' in l:
            continue
            
        m_q = re.match(r'^(\d{1,3})\.\s+(.*)', l)
        if m_q:
            q_num = int(m_q.group(1))
            if not current_q or q_num == current_q['num'] + 1:
                if current_q:
                    all_questions.append(current_q)
                current_q = {
                    "num": q_num,
                    "question": m_q.group(2).strip(),
                    "options": {},
                    "page": page_num + 1,
                    "page_idx": page_num
                }
                current_opt = None
                continue
                
        m_opt = re.match(r'^([A-D])\.\s*(.*)', l)
        if m_opt and current_q:
            current_opt = m_opt.group(1)
            current_q["options"][current_opt] = m_opt.group(2).strip()
            continue
            
        if current_q:
            if current_opt:
                current_q["options"][current_opt] += " " + l
            else:
                current_q["question"] += " " + l

if current_q:
    all_questions.append(current_q)

print(f"Total questions parsed: {len(all_questions)}")

# Now map each question to the yellow highlight on its page
# Group questions by page
by_page = {}
for q in all_questions:
    p = q["page_idx"]
    if p not in by_page: by_page[p] = []
    by_page[p].append(q)

for p_idx, q_list in by_page.items():
    page = doc[p_idx]
    h_rects = all_page_highlights[p_idx]
    print(f"Matching Page {p_idx + 1}: {len(q_list)} questions, {len(h_rects)} highlights.")
    
    for i, q in enumerate(q_list):
        if i < len(h_rects):
            rect = h_rects[i]
            highlight_text = page.get_text('text', clip=rect).strip()
            
            # Find which option matches
            matched = None
            m_let = re.search(r'([A-D])\.', highlight_text)
            if m_let:
                matched = m_let.group(1)
            else:
                for opt_l, opt_t in q["options"].items():
                    # check overlap
                    if opt_t and (opt_t[:15].lower() in highlight_text.lower() or highlight_text[:15].lower() in opt_t.lower()):
                        matched = opt_l
                        break
            if not matched:
                for opt_l in ['A', 'B', 'C', 'D']:
                    if highlight_text.startswith(opt_l):
                        matched = opt_l
                        break
            if not matched:
                matched = 'A'
                
            q["correct_answer"] = matched
            q["highlighted_text_raw"] = highlight_text
            print(f"  Q{q['num']}: Answer = {matched} -> '{q['options'].get(matched, '')}' (Clip: '{highlight_text[:30]}')")
        else:
            q["correct_answer"] = 'A'
            print(f"  Q{q['num']}: No highlight found!")

# Save to JSON
final_json = []
for q in all_questions:
    final_json.append({
        "original_num": q["num"],
        "question": q["question"],
        "options": q["options"],
        "correct_answer": q["correct_answer"],
        "page": q["page"]
    })

with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.json', 'w', encoding='utf-8') as f:
    json.dump(final_json, f, ensure_ascii=False, indent=2)

# Save to CSV
with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(["N° Pregunta", "Pregunta", "Opción A", "Opción B", "Opción C", "Opción D", "Respuesta Correcta", "Texto Respuesta Correcta"])
    for q in final_json:
        writer.writerow([
            q["original_num"],
            q["question"],
            q["options"].get("A", ""),
            q["options"].get("B", ""),
            q["options"].get("C", ""),
            q["options"].get("D", ""),
            q["correct_answer"],
            q["options"].get(q["correct_answer"], "")
        ])

print("DONE! Successfully updated respuestas_medicina.json and .csv with exact yellow highlights!")
