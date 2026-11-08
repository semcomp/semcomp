#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

is_sourced() {
    [[ "${BASH_SOURCE[0]}" != "$0" ]]
}

echo
echo "========================================"
echo "Verificando Python 3"
echo "========================================"
if ! command -v python3 >/dev/null 2>&1; then
    echo "Python3 nao encontrado. Instale manualmente e execute o script novamente."
    echo "Ubuntu/Debian: sudo apt install python3 python3-venv"
    echo "Fedora: sudo dnf install python3"
    echo "Arch: sudo pacman -S python"
    echo "macOS: brew install python"
    exit 1
fi

echo
echo "========================================"
echo "Configurando o ambiente virtual"
echo "========================================"
if [[ ! -d .venv ]]; then
    echo "Criando .venv..."
    python3 -m venv .venv
else
    echo ".venv ja existe, reaproveitando o ambiente"
fi

source .venv/bin/activate
python -m pip install --upgrade pip

if [[ -f requirements.txt && -s requirements.txt ]]; then
    echo "Instalando dependencias..."
    python -m pip install -q -r requirements.txt
else
    echo "requirements.txt vazio ou ausente; pulando instalacao de dependencias"
fi

if is_sourced; then
    echo
    echo "Setup concluido. O ambiente ficou ativo neste terminal."
    echo "Use: cd emails/  ou  cd crachas/  para ir ao diretorio dos scripts."
    echo "Use: python nome_do_script.py, para executar um script python."
    echo "Para sair do ambiente virtual, use: deactivate"
else
    echo
    echo "Setup concluido. Para usar python3 no venv neste terminal, execute:"
    echo "source ./setup.sh"
fi
