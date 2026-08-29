import json

with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.json', 'r', encoding='utf-8') as f:
    questions_2026_ii = json.load(f)

print(f"Total questions in 2026-II: {len(questions_2026_ii)}")

summary = []
for q in questions_2026_ii:
    q_num = q['number']
    text = q['question'][:120]
    ans = q['correctAnswer']
    ans_text = q['options'].get(ans, '')
    summary.append(f"Q{q_num}: {text} -> [{ans}] {ans_text}")

with open('e:/PREGUNTAS SERUMS/2026-ii/temas_reales_2026_ii.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(summary))

print("Saved temas_reales_2026_ii.txt. Sample first 15 questions:")
for s in summary[:15]:
    print(s)
