import json,re
segs=[("Tem empresa com pelo menos três pessoas?",0.35,2.16),("Olha o que a SulAmérica entrega.",2.65,3.92),
("Um:",4.28,4.44),("plano a partir de três vidas,",4.89,6.22),("pra proteger a sua família,",6.52,7.75),("os seus funcionários,",8.04,8.94),("ou os dois.",9.17,9.67),
("Dois:",10.14,10.47),("a qualidade da Rede D'Or.",10.68,11.80),("Rios D'Or,",12.19,12.70),("Barra D'Or,",12.96,13.45),("Quinta D'Or, Glória D'Or,",13.64,14.92),("Copa D'Or,",15.16,15.63),("entre outros.",15.87,16.43),
("Três:",17.06,17.38),("plano odontológico e seguro de vida, sem custo a mais.",17.79,20.34),
("Quatro:",20.79,21.10),("o grande diferencial.",21.28,22.62),("Quem é SulAmérica pode aderir ao Wellhub,",22.83,24.85),("o antigo Gympass.",25.25,26.06),
("Academias,",26.81,27.59),("yoga, pilates, terapia online e meditação.",27.80,30.68),("Tudo conforme o produto.",31.14,32.15),
("Comenta SULAMÉRICA,",32.69,34.24),("que eu te mostro o plano certo pra sua empresa.",34.63,36.55)]
ALT={}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words18.json","w"),ensure_ascii=False)
