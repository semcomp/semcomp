import csv
import io
import os
import re
import time
import urllib.error
import urllib.request
from PIL import Image  # Requer: pip install Pillow

csv_filename = "Semcompers - Membros-3.csv"
output_folder = "photos"
DELAY_ENTRE_DOWNLOADS = 1.5


def sanitize_filename(filename):
    """Remove caracteres inválidos do nome da pessoa para não dar erro ao salvar o arquivo."""
    return re.sub(r'[\\/*?:"<>|]', "", filename).strip()


def extract_drive_id(url):
    """Extrai o ID de um arquivo a partir de qualquer formato de link do Google Drive."""
    match = re.search(r"(?:/d/|id=)([a-zA-Z0-9_-]{25,})", url)
    if match:
        return match.group(1)
    return None


def format_download_url(url):
    """Se for link do Google Drive, converte para URL de download direto de imagem."""
    if "drive.google.com" in url or "googleusercontent.com" in url:
        drive_id = extract_drive_id(url)
        if drive_id:
            return f"https://lh3.googleusercontent.com/d/{drive_id}"
    return url


def download_and_convert_to_webp(url, filepath, max_retries=3):
    """Faz o download da imagem e a converte garantidamente para o formato WebP."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    }

    download_url = format_download_url(url)

    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(download_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                content_type = response.headers.get("Content-Type", "")

                if "text/html" in content_type and "drive.google.com" in url:
                    raise Exception(
                        "O arquivo do Drive requer permissão de acesso público ou login."
                    )

                data = response.read()
                if len(data) < 500:
                    raise Exception("Arquivo corrompido ou muito pequeno.")

                # --- CONVERSÃO PARA WEBP ---
                image_bytes = io.BytesIO(data)
                with Image.open(image_bytes) as img:
                    # Converte cores RGBA/P para RGB se necessário para evitar erros ao salvar WebP
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGBA")
                    else:
                        img = img.convert("RGB")

                    # Salva como .webp com qualidade 90 (otimizado)
                    img.save(filepath, "WEBP", quality=90)

                return True  # Sucesso!

        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_time = attempt * 5
                print(
                    f"   [!] Erro 429 (Muitas requisições). Aguardando {wait_time}s..."
                )
                time.sleep(wait_time)
            elif e.code in (999, 403):
                print(
                    f"   [!] Erro HTTP {e.code}: Acesso bloqueado pelo servidor."
                )
                break
            elif e.code == 404:
                print(f"   [!] Erro HTTP 404: Foto não encontrada no link.")
                break
            else:
                print(f"   [!] Erro HTTP {e.code}: {e.reason}")
                break

        except Exception as e:
            print(f"   [!] Erro na tentativa {attempt}: {e}")
            if attempt < max_retries:
                time.sleep(2)

    return False


def process_csv():
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    if not os.path.exists(csv_filename):
        print(f"Erro: O arquivo '{csv_filename}' não foi encontrado.")
        return

    with open(csv_filename, mode="r", encoding="utf-8") as file:
        reader = csv.reader(file)

        # Descomente caso seu CSV tenha cabeçalho na primeira linha:
        # next(reader)

        total, baixados, falhas = 0, 0, 0

        for row in reader:
            if len(row) < 4:
                continue

            nome = row[0].strip()
            link_foto = row[3].strip()

            if not link_foto:
                print(f"[-] Sem link de foto para: {nome}")
                falhas += 1
                continue

            total += 1
            nome_limpo = sanitize_filename(nome)

            # Força a extensão sempre como .webp
            filepath = os.path.join(output_folder, f"{nome_limpo}.webp")

            print(f"[{total}] Baixando e convertendo foto de: {nome_limpo}...")
            sucesso = download_and_convert_to_webp(link_foto, filepath)

            if sucesso:
                print(f"   [✓] Salvo como .webp com sucesso.")
                baixados += 1
            else:
                falhas += 1

            time.sleep(DELAY_ENTRE_DOWNLOADS)

        print("\n" + "=" * 40)
        print(
            f"Resumo: {baixados} baixados com sucesso | {falhas} falhas | Total: {total}"
        )
        print("=" * 40)


if __name__ == "__main__":
    process_csv()