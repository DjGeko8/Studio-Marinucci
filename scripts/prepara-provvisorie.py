#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Prepara in blocco tutte le fotografie provvisorie trovate in una cartella.

    python scripts/prepara-provvisorie.py [cartella]

La cartella predefinita è `immagini-provvisorie/` nella radice del progetto.

CONVENZIONE: il nome del file è lo slot.
Salvando `ritratto-verticale.png`, lo strumento capisce da solo dove va, con che
rapporto ritagliarlo e quale parte tenere. Estensione libera (.png, .jpg, .webp).

Nomi riconosciuti:
    hero-termoli            apertura della home, 16:9
    ritratto-verticale      home, 3:4
    ritratto-orizzontale    pagina Lo studio, 4:3
    studio-ingresso         pagina Dove siamo, 4:3
    studio-sala-attesa      pagina Lo studio, 4:3
    studio-tavolo-riunioni  pagina Lo studio, 4:3

Ogni immagine esce marchiata «PROVVISORIA — NON PUBBLICABILE»: sono prove di
impaginazione, non materiale pubblicabile. Per l'immagine definitiva si usa
`prepara-immagine.py <file> <slot> --definitiva`, una alla volta e con cognizione.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
PREDEFINITA = RADICE.parent / "immagini-provvisorie"
ESTENSIONI = {".png", ".jpg", ".jpeg", ".jfif", ".webp", ".bmp", ".tif", ".tiff"}

# Quale parte tenere quando l'immagine va tagliata in altezza.
# Sui ritratti si tiene l'alto: tagliare dal basso è sempre meglio che decapitare.
FUOCO = {
    "hero-termoli": "centro",
    "ritratto-verticale": "alto",
    "ritratto-orizzontale": "alto",
    "studio-ingresso": "centro",
    "studio-sala-attesa": "centro",
    "studio-tavolo-riunioni": "centro",
}

for flusso in (sys.stdout, sys.stderr):
    try:
        flusso.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass


def main() -> int:
    cartella = Path(sys.argv[1]) if len(sys.argv) > 1 else PREDEFINITA

    if not cartella.exists():
        cartella.mkdir(parents=True, exist_ok=True)
        print(f"Creata la cartella: {cartella}")
        print("\nSalva qui le immagini, chiamandole come lo spazio che devono occupare:\n")
        for slot in FUOCO:
            print(f"    {slot}.png")
        print("\nPoi rilancia questo comando.")
        return 0

    trovate = sorted(
        percorso
        for percorso in cartella.iterdir()
        if percorso.is_file() and percorso.suffix.lower() in ESTENSIONI
    )

    if not trovate:
        print(f"Nessuna immagine in {cartella}.")
        print("I nomi attesi sono: " + ", ".join(f"{s}.png" for s in FUOCO))
        return 0

    fatte, ignorate = 0, []

    for percorso in trovate:
        slot = percorso.stem
        if slot not in FUOCO:
            ignorate.append(percorso.name)
            continue

        print(f"\n{percorso.name}  →  {slot}")
        esito = subprocess.run(
            [sys.executable, str(RADICE / "scripts" / "prepara-immagine.py"),
             str(percorso), slot, "--fuoco", FUOCO[slot]],
            cwd=RADICE,
        )
        if esito.returncode == 0:
            fatte += 1
        else:
            print(f"  ✗ non riuscita")

    print(f"\n{fatte} immagin{'e preparata' if fatte == 1 else 'i preparate'}.")

    if ignorate:
        print(f"\nIgnorate perché il nome non corrisponde a nessuno spazio:")
        for nome in ignorate:
            print(f"    {nome}")
        print("  I nomi validi sono: " + ", ".join(FUOCO))

    if fatte:
        print("\nResta da fare un passaggio a mano: registrare le nuove voci in")
        print("content/immagini.ts, copiando la struttura di quelle già presenti.")
        print("Il testo alternativo va scritto lì, e descrive l'immagine a chi non la vede.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
