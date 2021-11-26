import json

base = '/images/skills/'

with open('./skills.json', 'r') as f:
    js = json.loads(f.read())
    for idx, cat in enumerate(js):
        for jdx, skill in enumerate(cat['skills']):
            js[idx]['skills'][jdx]['icon'] = base + skill['name'].replace(' ', '').lower() + '.webp'

    print(js)
