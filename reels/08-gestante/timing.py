import json, os
_h = os.path.dirname(os.path.abspath(__file__))
WORDS = json.load(open(f'{_h}/words.json'))
BOUNDS = [0.0] + [3.88, 8.21, 10.57, 13.73, 16.36]
END_START = 20.0
DUR = round(WORDS[-1]['e'] + 1.7, 2)
KINETIC = [('300 DIAS', 130, 560, 2.96, 3.75), ('CARÊNCIA', 110, 560, 4.38, 4.909999999999999), ('ANTES', 130, 560, 14.91, 16.130000000000003)]
END_TAG = 'PLANO ANTES DA GRAVIDEZ'
KEYWORD = 'GESTANTE'
FOOT1 = 'Conteúdo informativo.'
