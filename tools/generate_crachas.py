#!/usr/bin/env python3
"""
Gerador de crachás em massa — Semcomp
Uso:
  python generate_crachas.py usuarios.json template.png
  python generate_crachas.py usuarios.json template.png --preview
"""

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import qrcode
import qrcode.constants

# ─── CONFIGURE AQUI ───────────────────────────────────────────────────────────

QR_CENTER_Y = 1047
QR_SIZE = 420
NAME_CENTER_Y = 1620

FONT_PATH = Path(__file__).parent.parent / "new-site/packages/front-backoffice/src/assets/fonts/Poppins/Poppins-Regular.ttf"
FONT_SIZE = 52
NAME_COLOR = (0, 0, 0)

QR_FG = (0, 0, 0)
QR_BG = (255, 255, 255)

FILTER_QUER_CRACHA = True
OUTPUT_DIR = "crachas_gerados"

# ──────────────────────────────────────────────────────────────────────────────


def format_name(full_name: str) -> str:
    full_name = full_name.strip().title()
    parts = full_name.split()

    if len(parts) <= 2:
        return full_name

    if len(parts[0]) + len(parts[1]) + len(parts[-1]) >= 23:
        return f"{parts[0]} {parts[-1]}"

    return f"{parts[0]} {parts[1]} {parts[-1]}"


def load_users(json_path: Path) -> list[dict]:
    with open(json_path, encoding="utf-8") as f:
        payload = json.load(f)
    users: list[dict] = payload if isinstance(payload, list) else payload.get("users", payload)
    if FILTER_QUER_CRACHA:
        before = len(users)
        users = [u for u in users if u.get("quer_cracha")]
        print(f"Filtro quer_cracha=true: {before} total → {len(users)} com crachá")
    else:
        print(f"Total de participantes: {len(users)}")
    return users


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if Path(FONT_PATH).exists():
        return ImageFont.truetype(str(FONT_PATH), size)
    print(f"[AVISO] Fonte não encontrada em {FONT_PATH}, usando DejaVu.")
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except OSError:
        return ImageFont.load_default()


def make_qr(value: str) -> Image.Image:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(value)
    qr.make(fit=True)
    img = qr.make_image(fill_color=QR_FG, back_color=QR_BG).convert("RGBA")
    return img.resize((QR_SIZE, QR_SIZE), Image.LANCZOS)


def qr_value_for(user: dict) -> str:
    raw = str(user.get("user_number") or "")
    try:
        return str(int(raw))
    except ValueError:
        return raw


def generate_badge(
    template: Image.Image,
    user_number: str,
    name: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> Image.Image:
    badge = template.copy().convert("RGBA")
    draw = ImageDraw.Draw(badge)
    badge_w = badge.width

    qr_img = make_qr(user_number)
    qr_x = (badge_w - QR_SIZE) // 2
    qr_y = QR_CENTER_Y - QR_SIZE // 2
    badge.paste(qr_img, (qr_x, qr_y), qr_img)

    bbox = draw.textbbox((0, 0), name, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (badge_w - text_w) // 2
    text_y = NAME_CENTER_Y - text_h // 2
    draw.text((text_x, text_y), name, font=font, fill=NAME_COLOR)

    return badge.convert("RGB")


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera crachás em massa para a Semcomp")
    parser.add_argument("users_json", help="JSON com lista de usuários exportada do backoffice")
    parser.add_argument("template_png", help="PNG do crachá em branco")
    parser.add_argument("--preview", action="store_true", help="Gera apenas 1 crachá (PREVIEW.png)")
    args = parser.parse_args()

    json_path = Path(args.users_json)
    if not json_path.exists():
        print(f"[ERRO] Arquivo não encontrado: {json_path}")
        sys.exit(1)

    template_path = Path(args.template_png)
    if not template_path.exists():
        print(f"[ERRO] Template não encontrado: {template_path}")
        sys.exit(1)

    template = Image.open(template_path)
    print(f"Template: {template.width}×{template.height} px")

    users = load_users(json_path)

    if not users:
        print("[AVISO] Nenhum participante encontrado.")
        sys.exit(0)

    font = load_font(FONT_SIZE)
    out_dir = Path(OUTPUT_DIR)
    out_dir.mkdir(exist_ok=True)

    if args.preview:
        users = users[:1]
        print("Modo --preview: gerando apenas 1 crachá...")

    for i, user in enumerate(users, 1):
        number = qr_value_for(user)
        name = format_name(user.get("name", "Sem Nome"))

        if args.preview:
            out_path = out_dir / "PREVIEW.png"
        else:
            safe_name = name.replace(" ", "_").replace("/", "-")
            out_path = out_dir / f"{number}_{safe_name}.png"

        badge = generate_badge(template, number, name, font)
        badge.save(out_path, "PNG")
        print(f"  [{i:>4}/{len(users)}] {out_path.name}")

    print(f"\n✓ {len(users)} crachá(s) gerado(s) em '{out_dir}/'")


if __name__ == "__main__":
    main()
