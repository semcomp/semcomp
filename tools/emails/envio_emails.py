#!/usr/bin/env python3
"""
Dispara o e-mail de agradecimento + formulário para uma lista de e-mails (.txt).

Cada destinatário recebe uma mensagem individual (ninguém vê o e-mail dos outros).

Uso:
    python envio_emails.py limpos.txt --teste            # só mostra o que seria enviado
    python envio_emails.py limpos.txt --enviar-para-mim voce@gmail.com   # manda 1 de teste
    python envio_emails.py limpos.txt                    # envia de verdade

Credenciais SMTP lidas de new-site/packages/backend/.env:
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

Envios já feitos ficam registrados em enviados.log; se o script parar no meio,
basta rodar de novo que ele pula quem já recebeu.
"""
import argparse
import getpass
import json
import os
import re
import smtplib
import ssl
import sys
import time
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from pathlib import Path

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).parent.parent.parent / "new-site" / "packages" / "backend" / ".env"
load_dotenv(_ENV_PATH)

# ===================== EDITE AQUI =====================
NOME_REMETENTE = "Equipe SEMCOMP"

ASSUNTO = "Justificativa de ausências — prazo até domingo, dia 15"

CORPO_TEXTO = f"""Prezado(a) participante,

Informamos que o prazo para envio de justificativas de ausências durante a SEMCOMP encerra-se no próximo domingo, dia 15.

Relembramos que o certificado de participação será emitido exclusivamente para os participantes que atingirem 70% ou mais de presença nos eventos. Caso tenha faltado a algum evento por motivo justificável, solicitamos que envie a sua justificativa acompanhada de documento comprobatório válido (atestado médico, declaração, entre outros) dentro do prazo estabelecido.

Para ausências que abrangem a semana toda, o envio deve ser realizado pelo site da SEMCOMP (https://semcomp.icmc.usp.br): acesse sua conta, vá até a página de Perfil e utilize o botão disponível na seção "Minha Conta" para submeter a justificativa.

Para ausências em um evento específico, o envio deve ser feito diretamente para o endereço semcomp@icmc.usp.br, com a justificativa e o documento em anexo.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
{NOME_REMETENTE}
"""

CORPO_HTML = f"""<html><body style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:600px">
<p>Prezado(a) participante,</p>
<p>Informamos que o prazo para envio de justificativas de ausências durante a SEMCOMP encerra-se no próximo <strong>domingo, dia 15</strong>.</p>
<p>Relembramos que o <strong>certificado de participação</strong> será emitido exclusivamente para os participantes que atingirem <strong>70% ou mais de presença</strong> nos eventos. Caso tenha faltado a algum evento por motivo justificável, solicitamos que envie a sua justificativa acompanhada de <strong>documento comprobatório válido</strong> (atestado médico, declaração, entre outros) dentro do prazo estabelecido.</p>
<p>Para ausências que abrangem a <strong>semana toda</strong>, o envio deve ser realizado pelo <a href="https://semcomp.icmc.usp.br">site da SEMCOMP</a>: acesse sua conta, vá até a página de <strong>Perfil</strong> e utilize o botão disponível na seção <strong>"Minha Conta"</strong> para submeter a justificativa.</p>
<p>Para ausências em um <strong>evento específico</strong>, o envio deve ser feito diretamente para <a href="mailto:semcomp@icmc.usp.br">semcomp@icmc.usp.br</a>, com a justificativa e o documento em anexo.</p>
<p>Em caso de dúvidas, entre em contato conosco.</p>
<p>Atenciosamente,<br>{NOME_REMETENTE}</p>
</body></html>
"""
# ======================================================

EMAIL_OK = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")
ARQ_LOG = Path(__file__).parent / "enviados.log"


def ler_lista(caminho: Path) -> list[str]:
    vistos, lista = set(), []
    if caminho.suffix == ".json":
        raw = json.loads(caminho.read_text(encoding="utf-8"))
        if isinstance(raw, dict) and "users" in raw:
            linhas = [u["email"] for u in raw["users"] if u.get("email")]
        elif isinstance(raw, list):
            linhas = raw
        else:
            sys.exit("Formato JSON não reconhecido. Esperado array de strings ou {\"users\": [...]}")
    else:
        linhas = caminho.read_text(encoding="utf-8-sig").splitlines()
    for item in linhas:
        for parte in re.split(r"[;,]", str(item)):
            e = parte.strip().lower()
            if not e:
                continue
            if not EMAIL_OK.match(e):
                print(f"  ignorado (formato inválido): {e}")
                continue
            if e not in vistos:
                vistos.add(e)
                lista.append(e)
    return lista


def ja_enviados() -> set[str]:
    if not ARQ_LOG.exists():
        return set()
    return {l.split("\t")[1] for l in ARQ_LOG.read_text(encoding="utf-8").splitlines()
            if "\tOK" in l}


def montar(remetente: str, destino: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = formataddr((NOME_REMETENTE, remetente))
    msg["To"] = destino
    msg["Subject"] = ASSUNTO
    msg["Message-ID"] = make_msgid(domain=remetente.split("@")[1])
    msg.set_content(CORPO_TEXTO)
    msg.add_alternative(CORPO_HTML, subtype="html")
    return msg


def conectar(host, porta, usuario, senha):
    ctx = ssl.create_default_context()
    if porta == 465:
        s = smtplib.SMTP_SSL(host, porta, context=ctx, timeout=30)
    else:
        s = smtplib.SMTP(host, porta, timeout=30)
        s.starttls(context=ctx)
    s.login(usuario, senha)
    return s


def main():
    ap = argparse.ArgumentParser(description="Envia o e-mail do formulário para uma lista .txt")
    ap.add_argument("lista", type=Path, help="arquivo .txt com os e-mails")
    ap.add_argument("--host", default=os.getenv("SMTP_HOST", "smtp.gmail.com"))
    ap.add_argument("--porta", type=int, default=int(os.getenv("SMTP_PORT", "587")))
    ap.add_argument("--usuario", default=os.getenv("SMTP_USER"))
    ap.add_argument("--senha", default=os.getenv("SMTP_PASSWORD"))
    ap.add_argument("--intervalo", type=float, default=2.0, help="segundos entre envios (padrão 2)")
    ap.add_argument("--limite", type=int, default=0, help="máximo de envios nesta execução (0 = sem limite)")
    ap.add_argument("--teste", action="store_true", help="não envia nada, só mostra")
    ap.add_argument("--enviar-para-mim", metavar="EMAIL", help="envia uma única cópia de teste para este e-mail")
    args = ap.parse_args()


    if args.enviar_para_mim:
        destinos = [args.enviar_para_mim.strip().lower()]
    else:
        if not args.lista.exists():
            sys.exit(f"Arquivo não encontrado: {args.lista}")
        destinos = ler_lista(args.lista)
        feitos = ja_enviados()
        pulados = [d for d in destinos if d in feitos]
        destinos = [d for d in destinos if d not in feitos]
        if pulados:
            print(f"{len(pulados)} já receberam antes (registrados em {ARQ_LOG}) e serão pulados.")
    if args.limite:
        destinos = destinos[:args.limite]

    print(f"{len(destinos)} e-mail(s) para enviar.")
    if not destinos:
        return

    if args.teste:
        print(f"\nAssunto: {ASSUNTO}\n{'-'*60}\n{CORPO_TEXTO}{'-'*60}")
        for d in destinos:
            print(f"  [teste] enviaria para {d}")
        return

    if not args.usuario:
        args.usuario = input("Usuário SMTP (e-mail): ").strip()
    senha = args.senha or getpass.getpass(f"Senha de {args.usuario}: ")

    if not args.enviar_para_mim:
        r = input(f"Confirmar envio para {len(destinos)} destinatários? [s/N] ").strip().lower()
        if r != "s":
            sys.exit("Cancelado.")

    try:
        smtp = conectar(args.host, args.porta, args.usuario, senha)
    except smtplib.SMTPAuthenticationError:
        sys.exit("Falha no login. No Gmail, use uma senha de app (myaccount.google.com/apppasswords).")

    ok = falhas = 0
    with ARQ_LOG.open("a", encoding="utf-8") as log:
        for i, destino in enumerate(destinos, 1):
            for tentativa in range(3):
                try:
                    smtp.send_message(montar(args.usuario, destino))
                    status = "OK"
                    break
                except smtplib.SMTPRecipientsRefused:
                    status = "RECUSADO"
                    break
                except (smtplib.SMTPServerDisconnected, smtplib.SMTPSenderRefused,
                        smtplib.SMTPDataError, OSError) as e:
                    status = f"ERRO: {e}"
                    time.sleep(10 * (tentativa + 1))
                    try:
                        smtp = conectar(args.host, args.porta, args.usuario, senha)
                    except Exception:
                        pass
            if not args.enviar_para_mim:
                log.write(f"{datetime.now():%Y-%m-%d %H:%M:%S}\t{destino}\t{status}\n")
                log.flush()
            ok += status == "OK"
            falhas += status != "OK"
            print(f"[{i}/{len(destinos)}] {destino}: {status}")
            if i < len(destinos):
                time.sleep(args.intervalo)

    try:
        smtp.quit()
    except Exception:
        pass
    print(f"\nConcluído: {ok} enviados, {falhas} com falha.")
    if falhas:
        print(f"Veja os detalhes em {ARQ_LOG}. Rodar de novo tenta só os que faltaram.")


if __name__ == "__main__":
    main()
