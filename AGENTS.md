# Reguły projektu — pcmagik-lab (strona lab.pcmagik.pl)

Ta strona publikuje wyniki pomiarów modeli AI. **Każda liczba i każda teza na tej stronie musi
pochodzić z repozytorium pomiarowego.** Nic nie wolno wymyślić, uzupełnić z pamięci ani
uogólnić poza to, co zmierzono.

## Źródło prawdy — czytaj stamtąd przed każdą zmianą treści

`/home/pcmagik/GitHubWSL/projects/projekt-wiedza-z-yt/` (repo pomiarowe, lokalne, nie publiczne)

| Co | Gdzie |
|---|---|
| Reguły pomiaru, co wolno mierzyć czym | `.claude/CLAUDE.md` — **czytaj pierwszy** |
| Seria 11 modeli, n=3, bare kontra karpathy | `seria/badania/04-seria-modeli-n3/OCENA.md` |
| Rozrzut między biegami i wpływ effortu | `seria/badania/03-rozrzut-i-effort/` |
| Rejestr wszystkich biegów | `seria/pomiary/biegi.jsonl` |
| Teksty, liczby i kolory filmu | `seria/film/build.py` |
| Opis kanału i dane riga | `seria/marka/profil-kanalu.md` |
| Prompty zadań | `seria/zadania/` |

Jeśli czegoś nie ma w tych plikach — **nie ma tego na stronie**. Brak danych opisuje się
słowem „not measured yet", nigdy liczbą z oszacowania.

## Aktualne polecenia do wykonania

Bieżąca lista poprawek: **`.claude/POPRAWKI-STRONA-GLOWNA-2026-09-20.md`** — czytaj cały plik,
razem z **aneksem na końcu** („Architektura informacji"). Aneks jest ważniejszy niż pierwsza
część tam, gdzie się rozchodzą: powstał po pierwszej rundzie poprawek i prostuje polecenie,
które kazało wrzucić wszystkie wyniki na stronę główną.

Skrót zasady, żeby nie było wątpliwości: **strona główna jest witryną, nie archiwum.**
Odpowiada na cztery pytania — czym to jest, jak mierzymy, co wyszło ostatnio, gdzie jest reszta.
Trzy ostatnie wyniki na głównej, komplet na podstronach (`/episodes/`, `/episodes/<slug>/`). Badania bez filmu czekają w repo pomiarowym.

## Fakty, które wolno podawać

- Autor: Mateusz Piekut (PC Magik), serwis komputerowy i homelab z Polski.
- Rig: **Ryzen 5 PRO 3600 · 32 GB DDR4 ECC · RTX 3090 24 GB · LM Studio**. Jeden rig, wszystkie biegi.
- Metoda: ten sam prompt, ten sam rig, jedna zmienna na test, **model przeładowany przed każdym
  biegiem**, wszystkie prompty i pliki wynikowe publikowane.
- Adresy: `lab.pcmagik.pl`, `github.com/pcmagik/pcmagik-lab`.

## Reguły, których strona nie może złamać

1. **Teza jest przypięta do modelu, na którym ją zmierzono.** „On Qwen3.8 27B…", nigdy „reguły
   robią X" bez nazwy modelu.
2. **Zero wymyślonych liczb, odcinków, wyników i specyfikacji.**
3. **Pojedynczy bieg nie jest wynikiem.** Rozrzut między biegami tego samego wariantu sięga
   **93 % czasu i 113 % myślenia**. Różnica mniejsza niż rozrzut wewnątrz wariantu nie jest
   wynikiem, choćby brzmiała efektownie. Dopisek „in this run" tego nie naprawia.
4. **Liczba biegów:** standard serii to **n=3** na wariant, film 01 stoi na **n=5**. n=1 został
   odrzucony przez operatora i nie wolno go podawać jako parametru metody.
5. **Liczba linii kodu nie mierzy kosztu** przy zadaniu otwartym (`easy.txt` nie mówi, kiedy
   strona jest skończona). Mówi tylko, jak dużą stronę model postanowił zrobić. Jeśli pokazujesz
   tę liczbę, napisz to obok.
6. **Effort nie jest porównywalny między modelami** — LM Studio cicho podmienia nieobsługiwany
   poziom myślenia, a API tego nie zwraca.
7. **Licznik efektów CSS to liczba, nie ocena wyglądu.** Zawsze z zastrzeżeniem.
8. **Estetykę ocenia operator, nie strona i nie agent.** Widz ocenia sam na opublikowanych stronach.

## Dane publikacji

- `data/episodes.json` (schema_version 2) to jeden eksport z repo pomiarowego: `measurements`
  zawiera pełne kohorty, `runs` wskazuje reprezentantów. Liczb nie przepisujemy do reguł.
- `bin/build_site.py` weryfikuje każdą metrykę z publicznym `metrics.json` i `efekty.json`;
  błędny procent myślenia lub brak części zadeklarowanej kohorty przerywa budowanie.
- Procent thinking to `100 × reasoning_tokens / completion_tokens`, zaokrąglony do dwóch
  miejsc. Brak licznika oznacza „not measured yet”, nigdy zero. To udział tokenów, nie czasu.
- Zakresy nakładające się nie wykazują różnicy; nie są dowodem równoważności modeli.
- Pełny stan wszystkich badań: generowany `seria/pomiary/LICZBY.md` w repo pomiarowym.
  Historyczne liczby w starszych poleceniach mogą być nieaktualne.

## Spójność z filmami — obowiązuje na stronie tak samo

**Kolory wariantów (decyzja D18, te same w filmie i w miniaturkach):**

- `BARE` = `#ff9f45` (ciepły pomarańcz) — wyłącznie ten wariant
- `KARPATHY` = `#5ec8ff` (zimny błękit) — wyłącznie ten wariant
- `#a78bfa` (fiolet) — **tylko** dane, które nie są wariantem modelu

**Nazewnictwo z filmu:** `output tokens` (nie samo „tokens"), `tok/s` (nie „throughput"),
`lines of code` (nie „code lines"), `thinking` zawsze z podpisem `output = thinking + final code`.
Opisy wariantów: `NO RULES, NO EXTRAS` i `ONE RULES FILE`.

## Wygląd

Aktualna decyzja operatora: `.claude/DECISIONS.md`, **D1**.

- **Ciemny motyw jest domyślny.** Beż, krem, écru i ciepłe palety papierowe są zakazane wprost.
  Jasny wariant, jeśli powstanie, buduj na chłodnej bieli z niebieskim podkładem.
- Kierunek: Awwwards, szkło, neon. Wzorzec: `tokenchaser.net`, własny kierunek w repo pomiarowym
  (`seria/marka/wzorce/strona-b2-neon-glass.html`).
- **Minimalny rozmiar tekstu: 11 px.** Nie ma na tej stronie miejsca na 6, 7, 8 czy 9 px —
  to utrata informacji, nie stylizacja.
- **Wartości pomiarowe są najważniejsze na stronie i mają być największe**, nie mniejsze od
  opisów obok.
- **Cele dotykowe minimum 44×44 px** na szerokości telefonu.
- Adres `lab.pcmagik.pl` musi być widoczny w treści, nie tylko w meta — to jedyny adres, który
  widz usłyszy w filmie.

## Czego nie robić

- Nie kopiować niczego poza repozytorium (żadnego `/mnt/c/`, żadnych katalogów roboczych).
- Nie zmieniać plików w `episodes/*/` będących surowym wyjściem modelu — to dowody, mają zostać
  bajt w bajt takie, jakie wyszły z biegu.
- Nie dodawać metryki ani wykresu, pod który nie ma danych w repo pomiarowym.
