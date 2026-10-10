import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
BOUNDS = [0.0] + [2.91, 6.32, 10.72, 13.15, 16.84]
END_START = 20.43
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('CARÊNCIA', 120, 560, 2.1, 2.69), ('ANTES DE ASSINAR', 90, 560, 13.27, 14.32)]
END_TAG = 'CARÊNCIA SEM MISTÉRIO'
KEYWORD = 'CARÊNCIA'
FOOT1 = 'Conteúdo informativo.'
