import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
BOUNDS = [0.0] + [2.93, 6.25, 9.42, 12.08, 14.4]
END_START = 17.26
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('PLANO EMPRESARIAL', 90, 560, 0.83, 2.05), ('180 DIAS', 120, 560, 13.819999999999999, 14.43)]
END_TAG = 'MEI TAMBÉM TEM PLANO'
KEYWORD = 'MEI'
FOOT1 = 'Conteúdo informativo.'
