import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
BOUNDS = [0.0] + [2.41, 5.31, 8.92, 10.75, 13.31]
END_START = 15.37
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('SOME COM O EMPREGO', 84, 560, 1.03, 2.21), ('EMERGÊNCIA', 120, 560, 9.2, 9.959999999999999), ('PLANO SÓ SEU', 110, 560, 11.059999999999999, 11.92)]
END_TAG = 'UM PLANO SÓ SEU'
KEYWORD = 'PLANO'
FOOT1 = 'Conteúdo informativo.'
