import json,re
segs=[("Plano de saúde não é só pra doença.",0.34,1.97),("É pra você nem chegar lá.",2.35,3.44),
("Consulta de rotina,",4.11,5.11),("check-up,",5.28,5.85),("exames.",6.0,6.52),
("Pressão,",6.91,7.40),("glicose,",7.53,8.18),("colesterol:",8.31,8.89),("dá pra descobrir no começo.",9.28,10.35),
("E o médico acompanha você,",10.90,12.09),("ano a ano.",12.33,12.86),
("Cuidar antes pesa menos que correr atrás depois.",13.34,15.78),
("Comenta PREVENIR,",16.37,17.22),("ou chama no link da bio.",17.51,18.56),("Eu acho o plano certo pro seu perfil.",19.02,20.59)]
ALT={'check-up,':'xequiape','PREVENIR,':'prevenir'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words13.json","w"),ensure_ascii=False)
print(len(out))
