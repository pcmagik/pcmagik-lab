# PILNE — przywrócić zaakceptowany wygląd

Operator odrzucił obecny wygląd strony: „zmienił wersję z dobrej na ubogą, wszystko jest inne".
Ma rację i **wina jest po stronie polecenia, nie wykonania.**

Plik `POPRAWKI-STRONA-GLOWNA-2026-09-20.md` mówił „kierunek jest dobry i nie zmieniamy go",
a zaraz pod spodem dawał osiem punktów, które zmieniały typografię, kroje, rozmiary, odstępy
i kolory. To było sprzeczne polecenie. **Wygląd był zaakceptowany i nie wolno go było ruszać.**

## Punkt odniesienia

Commit **`a3f1687`** — „feat: build interactive neon benchmark lab with GSAP and Three.js".
To jest wygląd zaakceptowany przez operatora: hero, krój i skala typografii, kolory, odstępy,
sekcja porównania z przełącznikami i dwiema kartami reprezentantów z miniaturami stron.

## Co zrobić

1. **Przywróć warstwę wizualną dokładnie z `a3f1687`**: `assets/lab.css`, `assets/lab.js`,
   `assets/neural-scene.js`, strukturę i klasy `index.html`, sekcję porównania z jej układem
   (przełączniki w rogu, paski, dwie karty z miniaturami i rzędem liczb, podpisy).
2. **Zachowaj wyłącznie zmiany w treści i liczbach**, które powstały po tamtym commicie:
   - brak zdań typu „Karpathy took 26.2% less time in this run" — zamiast nich zakresy z pięciu
     biegów i zdanie, że zakresy się nakładają,
   - nazwy metryk: `output tokens`, `tok/s`, `lines of code`, `thinking` z podpisem
     `output = thinking + final code`,
   - zastrzeżenie przy `lines of code` i przy liczniku efektów,
   - n=5 i n=3, rozrzut 93 %,
   - widoczny `lab.pcmagik.pl`, sekcja o autorze, przeładowanie modelu w metodzie, meta społecznościowe,
   - główna bez tabeli jedenastu modeli, `/series/` nie istnieje.
3. **Czego NIE zmieniać, nawet jeśli poprzedni plik poprawek tak kazał:** krojów pisma,
   rozmiarów czcionek, skali typograficznej, odstępów, rozmiarów przycisków, kolorów tła
   i akcentów, układu hero, animacji. Punkty 1–6 z sekcji „Design — co poprawić" w tamtym pliku
   są **anulowane**.
4. Kolory wariantów (`BARE` `#ff9f45`, `KARPATHY` `#5ec8ff`) zostają jako jedyny wyjątek —
   wynikają ze spójności z filmem i zostały zaakceptowane osobno. Jeśli kolidują z paletą hero,
   zgłoś to operatorowi zamiast zmieniać cokolwiek innego.
5. Przywróć miniatury reprezentantów w sekcji porównania (`film01-*-preview.png` albo ich
   odpowiedniki z feedu) — ich usunięcie było skutkiem polecenia „buduj wyłącznie z feedu",
   które nie uwzględniało, że feed nie zawierał podglądów.

## Jak sprawdzić, że jest dobrze

Zrzut pełnostronicowy 1920 px obok `.screenshots/interactive-neon-desktop.png` z `a3f1687`:
układ, krój, skala i kolory mają się zgadzać. Różnić się mają **tylko teksty i liczby**.
