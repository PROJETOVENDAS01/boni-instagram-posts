import json,re
segs=[("Não tem CNPJ?",0.32,1.34),("Também tem Amil pra uma pessoa só,",1.69,3.14),("na pessoa física.",3.35,4.12),("É o plano por adesão.",4.51,5.49),
("Um:",6.17,6.34),("dá pra entrar sozinho, sem precisar de empresa.",6.73,8.66),("Dois:",9.14,9.50),("tem plano pra todo perfil,",9.94,11.21),("do mais simples ao alto padrão.",11.54,13.11),
("Três:",14.03,14.36),("além de filhos e cônjuge,",14.68,16.02),("entram pai, mãe, irmãos, sobrinhos e netos,",16.31,19.30),("até sessenta e nove anos.",19.54,20.73),
("Quatro:",21.27,21.61),("os mesmos hospitais de referência.",21.91,23.59),("Vitória e Samaritano, na Barra.",24.27,25.91),("Pró-Cardíaco.",26.39,27.10),
("E o Hospital de Clínicas de Jacarepaguá.",27.57,29.44),("A rede muda conforme o produto.",29.89,31.40),("Comenta ADESÃO,",31.94,33.04),("que eu te mostro o plano certo pra você.",33.39,35.32)]
ALT={'CNPJ?':'ceenepejota'}
w=lambda t:len(re.sub(r'\W','',ALT.get(t,t)))+2
out=[]
for si,(txt,a,b) in enumerate(segs):
    ws=txt.split();ww=[w(x) for x in ws];T=sum(ww);t=a
    for x,k in zip(ws,ww):
        e=t+(b-a)*k/T; out.append({"t":x,"s":round(t,2),"e":round(e-0.03,2),"seg":si}); t=e
json.dump({"words":out,"segs":[{"t":s[0],"s":s[1],"e":s[2]} for s in segs]},open("public/words17.json","w"),ensure_ascii=False)
