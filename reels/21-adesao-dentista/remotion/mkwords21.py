import json,re
segs=[("Dentista,",0.32,0.86),("hoje o paciente é você.",1.15,2.48),("Vamos começar a anamnese.",2.90,4.12),
("Tem plano de saúde com condições especiais pra sua classe.",4.50,7.44),("É o plano por adesão,",7.92,8.97),
("feito pro profissional formado em Odontologia.",9.35,11.46),("No exame,",11.98,12.47),("só coisa boa.",12.71,13.37),
("Condições pensadas pra sua categoria.",13.86,15.74),("Dá pra incluir a família, conforme o produto.",16.22,18.29),
("E tem do plano simples ao alto padrão.",18.70,20.70),("Eu comparo as opções com você, pro seu perfil.",21.22,23.45),
("O que precisa?",23.96,24.56),("A carteira do CRO,",25.22,26.28),("ou o diploma.",26.72,27.30),("Só isso.",27.51,27.92),
("Tratamento concluído.",28.33,29.26),("Comenta dentista,",29.55,30.42),("que eu te mostro as opções.",30.42,31.53)]
ALT={'CRO,':'cêérreó'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("/tmp/claude-0/rm/public/words21.json","w"),ensure_ascii=False)
