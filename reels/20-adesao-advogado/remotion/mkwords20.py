import json,re
segs=[("Atenção, advogado!",0.31,1.18),("Tem plano de saúde com condições especiais pra sua classe.",1.44,4.18),
("É o plano por adesão.",4.51,5.56),("Feito pra quem é da advocacia.",5.98,7.23),("Um:",7.93,8.08),
("condições pensadas pra sua categoria.",8.56,10.39),("Dois:",10.90,11.24),("dá pra incluir a família,",11.56,12.63),
("conforme o produto.",12.86,13.61),("Três:",14.12,14.49),("tem do plano simples ao alto padrão.",14.77,16.55),
("E eu comparo as opções com você,",17.09,18.63),("pra escolher o plano certo pro seu perfil.",18.86,20.54),
("O que precisa?",20.94,21.54),("A carteira da OAB,",22.04,22.92),("ou o diploma de conclusão.",23.28,24.35),("Só isso.",24.88,25.29),
("Comenta advogado,",25.71,26.62),("que eu te mostro as opções.",26.91,28.08)]
ALT={'OAB,':'oabê'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words20.json","w"),ensure_ascii=False)
print(len(out))
