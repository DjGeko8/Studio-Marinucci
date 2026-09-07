#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Prepara una fotografia per uno degli spazi del sito: ritaglia al rapporto giusto,
ridimensiona e genera le due densità (@1x e @2x).

    python scripts/prepara-immagine.py <sorgente> <slot> [--fuoco alto|centro|basso]
                                       [--definitiva]

Gli slot sono quelli di content/media-manifest.json.

--------------------------------------------------------------------------------
IMMAGINI PROVVISORIE
--------------------------------------------------------------------------------
Se non si passa --definitiva, l'immagine viene marchiata con una fascia
«PROVVISORIA — NON PUBBLICABILE» impressa sopra, e salvata con il suffisso
`-PROVVISORIA`.

Non è un vezzo. Serve a due cose:

1. Le immagini di prova hanno l'abitudine di sopravvivere fino alla pubblicazione.
   Un avviso impresso nei pixel non si dimentica come si dimentica una riga in un
   file di configurazione.

2. Alcune provengono da anteprime di banche immagini con il loro watermark. Un
   ritaglio che facesse sparire quel watermark produrrebbe una copia pulita di
   materiale non licenziato: questo strumento non lo fa mai, e anzi ne aggiunge
   uno più visibile.

`npm run verifica-immagini` blocca la pubblicazione finché ne resta anche una sola.
Per l'immagine vera, licenziata o scattata su commissione, si usa --definitiva.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Serve Pillow:  python -m pip install Pillow")

# La console di Windows usa cp1252 e non digerisce i simboli di questo file.
for flusso in (sys.stdout, sys.stderr):
    try:
        flusso.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

RADICE = Path(__file__).resolve().parent.parent
MANIFESTO = RADICE / "content" / "media-manifest.json"
DESTINAZIONE = RADICE / "public" / "immagini"

# Rapporti dei riquadri del sito, come da media-manifest.json.
RAPPORTI = {
    "16:9": 16 / 9,
    "4:3": 4 / 3,
    "3:4": 3 / 4,
    "1:1": 1.0,
}

# Larghezza @1x per ogni slot. Il @2x è il doppio.
LARGHEZZE = {
    "hero-termoli": 1600,
    "ritratto-verticale": 640,
    "ritratto-orizzontale": 900,
    "studio-ingresso": 900,
    "studio-sala-attesa": 900,
    "studio-tavolo-riunioni": 900,
}

RAPPORTO_SLOT = {
    "hero-termoli": "16:9",
    "ritratto-verticale": "3:4",
    "ritratto-orizzontale": "4:3",
    "studio-ingresso": "4:3",
    "studio-sala-attesa": "4:3",
    "studio-tavolo-riunioni": "4:3",
}


def ritaglia(img: Image.Image, rapporto: float, fuoco: str) -> Image.Image:
    """Ritaglia al rapporto richiesto, prendendo il massimo dall'originale."""
    larghezza, altezza = img.size
    attuale = larghezza / altezza

    if abs(attuale - rapporto) < 0.002:
        return img

    if attuale > rapporto:
        # Troppo larga: si taglia ai lati, sempre centrando.
        nuova_larghezza = round(altezza * rapporto)
        sinistra = (larghezza - nuova_larghezza) // 2
        return img.crop((sinistra, 0, sinistra + nuova_larghezza, altezza))

    # Troppo alta: si taglia sopra o sotto, secondo il punto di interesse.
    nuova_altezza = round(larghezza / rapporto)
    avanzo = altezza - nuova_altezza
    alto = {"alto": 0, "centro": avanzo // 2, "basso": avanzo}[fuoco]
    return img.crop((0, alto, larghezza, alto + nuova_altezza))


def carattere(dimensione: int) -> ImageFont.ImageFont:
    for nome in ("arialbd.ttf", "seguisb.ttf", "arial.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(nome, dimensione)
        except OSError:
            continue
    return ImageFont.load_default()


def marchia_provvisoria(img: Image.Image) -> Image.Image:
    """Imprime la fascia di avviso. Volutamente impossibile da non notare."""
    img = img.convert("RGB")
    larghezza, altezza = img.size
    disegno = ImageDraw.Draw(img, "RGBA")

    altezza_fascia = max(34, round(altezza * 0.085))
    cima = altezza - altezza_fascia
    disegno.rectangle([0, cima, larghezza, altezza], fill=(12, 42, 43, 232))

    testo = "PROVVISORIA — NON PUBBLICABILE"
    font = carattere(max(13, round(altezza_fascia * 0.42)))
    riquadro = disegno.textbbox((0, 0), testo, font=font)
    disegno.text(
        ((larghezza - (riquadro[2] - riquadro[0])) / 2,
         cima + (altezza_fascia - (riquadro[3] - riquadro[1])) / 2 - riquadro[1]),
        testo,
        font=font,
        fill=(255, 255, 255, 255),
    )

    # Banda diagonale tenue: visibile anche se la fascia venisse tagliata.
    disegno.line([(0, altezza), (larghezza, 0)], fill=(200, 60, 60, 60),
                 width=max(3, round(altezza * 0.012)))
    return img


def main() -> int:
    analizzatore = argparse.ArgumentParser(description=__doc__)
    analizzatore.add_argument("sorgente", type=Path)
    analizzatore.add_argument("slot", choices=sorted(RAPPORTO_SLOT))
    analizzatore.add_argument("--fuoco", choices=("alto", "centro", "basso"),
                              default="centro",
                              help="Quale parte tenere quando si taglia in altezza")
    analizzatore.add_argument("--definitiva", action="store_true",
                              help="Immagine reale e licenziata: nessun marchio")
    argomenti = analizzatore.parse_args()

    if not argomenti.sorgente.exists():
        return f"Sorgente non trovata: {argomenti.sorgente}"

    slot = argomenti.slot
    rapporto = RAPPORTI[RAPPORTO_SLOT[slot]]
    larghezza_1x = LARGHEZZE[slot]

    originale = Image.open(argomenti.sorgente)
    ritagliata = ritaglia(originale, rapporto, argomenti.fuoco)

    if ritagliata.width < larghezza_1x:
        print(f"  ⚠ sorgente piccola: {ritagliata.width}px < {larghezza_1x}px richiesti."
              f" Accettabile per una provvisoria, non per la definitiva.")

    DESTINAZIONE.mkdir(parents=True, exist_ok=True)
    suffisso = "" if argomenti.definitiva else "-PROVVISORIA"
    prodotti = []

    for densita, moltiplicatore in (("", 1), ("@2x", 2)):
        larghezza = larghezza_1x * moltiplicatore
        altezza = round(larghezza / rapporto)
        copia = ritagliata.resize((larghezza, altezza), Image.LANCZOS)
        if not argomenti.definitiva:
            copia = marchia_provvisoria(copia)
        uscita = DESTINAZIONE / f"{slot}{suffisso}{densita}.jpg"
        copia.convert("RGB").save(uscita, "JPEG", quality=82, optimize=True,
                                  progressive=True)
        prodotti.append((uscita, larghezza, altezza))

    for percorso, larghezza, altezza in prodotti:
        peso = percorso.stat().st_size / 1024
        print(f"  ✓ {percorso.relative_to(RADICE).as_posix()}"
              f"  {larghezza}×{altezza}  {peso:.0f} kB")

    if not argomenti.definitiva:
        print("\n  Marchiata come PROVVISORIA: `npm run verifica-immagini` "
              "bloccherà la pubblicazione finché resta in uso.")

    if MANIFESTO.exists():
        try:
            dati = json.loads(MANIFESTO.read_text(encoding="utf-8"))
            for voce in dati.get("slot", []):
                if voce.get("id") == slot:
                    voce["stato"] = "definitiva" if argomenti.definitiva else "provvisoria"
            MANIFESTO.write_text(json.dumps(dati, ensure_ascii=False, indent=2) + "\n",
                                 encoding="utf-8")
            print(f"  ✓ stato aggiornato in content/media-manifest.json")
        except (json.JSONDecodeError, OSError) as errore:
            print(f"  ⚠ manifesto non aggiornato: {errore}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
