#!/usr/bin/env python3
"""
Exporta qualquer tabela do banco PostgreSQL (via docker exec) para JSON.

Uso:
    python exportar_tabela.py users --container postgres_db
    python exportar_tabela.py users --container postgres_db --saida emails/lista.json
    python exportar_tabela.py users --container postgres_db --where "email_verified = true"
    python exportar_tabela.py events --container postgres_db --colunas "id,name,date"
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).parent.parent / "new-site" / "packages" / "backend" / ".env"
load_dotenv(_ENV_PATH)


_BLOCKED_PATTERNS = ("password", "verification")


def colunas_seguras(container, db_user, db_name, db_password, tabela):
    sql = f"""
SELECT column_name
FROM information_schema.columns
WHERE table_name = '{tabela}'
ORDER BY ordinal_position;
"""
    result = subprocess.run(
        ["docker", "exec", "-e", f"PGPASSWORD={db_password}",
         container, "psql", "-U", db_user, "-d", db_name,
         "--no-align", "--tuples-only", "-c", sql],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        sys.exit(f"Erro ao listar colunas:\n{result.stderr.strip()}")

    todas = [l.strip() for l in result.stdout.splitlines() if l.strip()]
    bloqueadas = [c for c in todas if any(p in c.lower() for p in _BLOCKED_PATTERNS)]
    seguras = [c for c in todas if c not in bloqueadas]

    if bloqueadas:
        print(f"Colunas ignoradas (senha/verificação): {', '.join(bloqueadas)}")

    return seguras


def main():
    ap = argparse.ArgumentParser(description="Exporta uma tabela do banco para JSON")
    ap.add_argument("tabela", help="nome da tabela a exportar")
    ap.add_argument("--container", required=True, help="nome do container PostgreSQL")
    ap.add_argument("--saida", type=Path, help="arquivo de saída (padrão: <tabela>.json)")
    ap.add_argument("--where", default="", help="cláusula WHERE sem a palavra WHERE, ex: \"email_verified = true\"")
    ap.add_argument("--colunas", default="", help="colunas específicas separadas por vírgula (padrão: todas as seguras)")
    ap.add_argument("--ordem", default="", help="ORDER BY, ex: \"user_number ASC\"")
    args = ap.parse_args()

    db_user = os.getenv("DB_USER")
    db_name = os.getenv("DB_NAME")
    db_password = os.getenv("DB_PASSWORD", "")

    if not db_user or not db_name:
        sys.exit("Erro: DB_USER e DB_NAME não encontrados. Verifique o .env.")

    saida = args.saida or Path(__file__).parent / f"{args.tabela}.json"

    if args.colunas:
        colunas = args.colunas
    else:
        seguras = colunas_seguras(args.container, db_user, db_name, db_password, args.tabela)
        if not seguras:
            sys.exit("Nenhuma coluna disponível para exportar.")
        colunas = ", ".join(seguras)

    where = f"WHERE {args.where}" if args.where else ""
    order = f"ORDER BY {args.ordem}" if args.ordem else ""

    sql = f"""
SELECT json_agg(row_to_json(t))
FROM (
    SELECT {colunas}
    FROM {args.tabela}
    {where}
    {order}
) t;
"""

    result = subprocess.run(
        ["docker", "exec", "-e", f"PGPASSWORD={db_password}",
         args.container, "psql", "-U", db_user, "-d", db_name,
         "--no-align", "--tuples-only", "-c", sql],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        sys.exit(f"Erro ao consultar o banco:\n{result.stderr.strip()}")

    raw = result.stdout.strip()
    if not raw or raw == "\\N":
        print("Nenhum registro encontrado.")
        return

    try:
        rows = json.loads(raw)
    except json.JSONDecodeError as e:
        sys.exit(f"Erro ao interpretar resposta do banco: {e}\nSaída bruta:\n{raw[:300]}")

    output = {args.tabela: rows}
    saida.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(rows)} registro(s) exportado(s) → {saida}")


if __name__ == "__main__":
    main()
