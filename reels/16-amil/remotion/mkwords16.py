import json,re
segs=[("Por que eu indico tanto a Amil aqui no Rio?",0.35,2.08),("Um:",2.63,2.80),("plano pelo CNPJ, a partir de duas vidas,",3.54,6.22),("inclusive pra MEI.",6.43,7.30),
("Dois:",7.84,8.21),("tem plano pra todo perfil,",8.55,9.83),("do mais simples ao alto padrão.",10.02,11.54),
("Três:",12.09,12.43),("além de filhos e cônjuge, entram pai, mãe, irmãos, sobrinhos e netos,",12.78,16.77),("até sessenta e nove anos.",17.00,18.22),
("Quatro:",18.71,19.02),("hospitais de referência aqui no Rio.",19.29,20.68),("Vitória e Samaritano,",21.24,22.20),("na Barra.",22.38,22.78),("Pró-Cardíaco.",23.17,23.78),
("E o Hospital de Clínicas de Jacarepaguá.",24.14,26.24),("A rede muda conforme o produto.",27.03,28.66),("Comenta AMIL,",29.07,29.66),("que eu te mostro o plano certo pra você.",29.98,31.72)]
ALT={'CNPJ,':'ceenepejota','MEI.':'meii'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words16.json","w"),ensure_ascii=False)
