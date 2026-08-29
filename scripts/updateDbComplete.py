import json

# Load base_datos_completa.json
with open('e:/PREGUNTAS SERUMS/base_datos_completa.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

# Load 2026-II verified json
with open('e:/PREGUNTAS SERUMS/2026-ii/respuestas_medicina.json', 'r', encoding='utf-8') as f:
    q2026ii = json.load(f)

# Add to db
db['2026-II'] = {
    "Medicina": q2026ii
}

with open('e:/PREGUNTAS SERUMS/base_datos_completa.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Successfully updated base_datos_completa.json with 2026-II!")
    