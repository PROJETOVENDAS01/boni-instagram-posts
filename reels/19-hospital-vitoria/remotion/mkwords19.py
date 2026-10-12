import json,re
segs=[("Quanto custa ficar internado no Hospital Vitória sem plano?",0.37,2.94),("Na média,",3.67,4.13),("uma diária de internação pode passar de dez mil reais.",4.44,7.29),
("E uma cirurgia,",7.83,8.54),("de cem mil.",8.81,9.30),("É um dos hospitais mais completos da Barra da Tijuca:",9.78,12.15),("emergência,",12.56,13.31),("UTI moderna,",13.51,14.36),
("centro cirúrgico",14.74,15.57),("e quarto que parece hotel.",15.78,16.98),("Mas quem se trata aqui nem sempre paga tudo do bolso.",17.42,19.95),
("Com o plano de saúde certo,",20.51,21.64),("você tem acesso a hospitais como esse,",21.87,23.50),("pagando uma mensalidade que cabe no seu perfil.",23.87,25.97),
("Uma conta enorme vira uma parcela que você planeja.",26.48,28.92),("E eu te ajudo a encontrar o plano ideal pra você, sua família ou sua empresa.",29.41,33.43),
("Comenta VITÓRIA,",33.86,34.61),("que eu te mostro quais planos atendem esse hospital.",34.91,37.25)]
ALT={}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words19.json","w"),ensure_ascii=False)
