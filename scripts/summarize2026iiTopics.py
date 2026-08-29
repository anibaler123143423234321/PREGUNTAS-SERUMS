import json

with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.json', 'r', encoding='utf-8') as f:
    questions_2026_ii = json.load(f)

summary = []
for q in questions_2026_ii:
    q_num = q.get('original_num') or q.get('number')
    text = q['question'][:140]
    ans = q.get('correct_answer') or q.get('correctAnswer')
    ans_text = q['options'].get(ans, '')
    summary.append(f"Q{q_num}: {text}... -> [{ans}] {ans_text}")

with open('e:/PREGUNTAS SERUMS/2026-ii/temas_reales_2026_ii.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(summary))

print(f"Total: {len(summary)} questions extracted.\n")
print("=== MUESTRA DE TEMAS EXACTOS SERUMS 2026-II ===")
for s in summary[:25]:
    print(s)
