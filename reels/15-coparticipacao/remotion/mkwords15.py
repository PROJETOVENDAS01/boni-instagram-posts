import json,re
segs=[("Plano com coparticipação é caro?",0.34,2.21),("Depende.",2.92,3.34),("E pode ser uma ótima escolha.",3.66,4.98),
("A mensalidade costuma ser bem menor.",5.49,7.18),("E você só paga uma parte quando usa:",7.51,9.32),("consulta, exame.",9.76,11.24),
("Quem usa pouco economiza o ano inteiro.",11.78,13.78),("E não fica sem plano por causa do preço.",14.33,16.28),
("Cada operadora tem as suas regras.",16.80,18.46),("Eu te mostro a que faz sentido pro seu perfil.",18.74,20.77),
("Comenta CONTA,",21.55,22.41),("que eu faço essa conta com você.",23.0,24.2)]
w=lambda t:len(re.sub(r'\W','',t))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words15.json","w"),ensure_ascii=False)
for o in out: print(o["seg"],o["t"],o["s"])
