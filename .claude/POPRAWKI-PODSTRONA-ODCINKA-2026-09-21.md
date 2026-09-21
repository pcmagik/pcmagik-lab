# POPRAWKI — podstrona odcinka (2026-09-21)

Od: koordynator z repo `projekt-wiedza-z-yt` (sesja wyznaczona przez operatora, D35 w tamtym repo).
Podstawa: ocena operatora strony `http://127.0.0.1:8765/episodes/01-karpathy-vs-bare/` i niezależna recenzja
gałęzi `fix/publication-data-integrity` (oba repo). Zrzuty pełnostronicowe tej wersji:
`projekt-wiedza-z-yt/seria/strona-lab-ocena/astra-publikacja-2026-09-21/odcinek-01-{1920,390}.png`.

## Słowa operatora (rozstrzygające)
> „nie tak powinno wyglądać, po co każdy prompt, skoro każdy był taki sam? strasznie dużo tekstu od samego
> początku, strasznie słabo to wygląda, przecież do promptów i do materiałów służy repo, tam każdy może
> sprawdzić wszystko. Tu miały być pokazane wyniki w atrakcyjny sposób oraz odnośniki do efektów pracy modeli.”

Cel nadrzędny operatora: publikacja ma iść **automatycznie** od gotowego filmu do strony, bez niego.

## Czego oczekujemy od podstrony odcinka (CO, nie JAK — układ i wygląd dobierasz sama, w stylu przyjętej głównej)
1. **Wynik odcinka widać od razu.** Pierwszy ekran odpowiada na pytanie filmu tym, co film twierdzi, liczbami z danych. Dla odcinka 01 to efekty („22 % mniej efektów, 5 z 5”), a nie czas — dziś kluczowa miara ginie w drobnym tekście „Effects: 146”.
2. **Wszystkie biegi kohorty jako wyniki**, pokazane atrakcyjnie (zakresy per miara, każdy bieg widoczny), nie tylko dwóch reprezentantów.
3. **Odnośniki do efektów pracy modeli**: każdy bieg, który ma stronę, prowadzi do niej („live output”) i do zrzutu.
4. **Prompt raz, nie dziesięć razy.** Wszystkie biegi dostały ten sam prompt. Prompty, logi, `metrics.json`, surowe dane → jeden link do repozytorium (GitHub), nie rozwijane listy na stronie.
5. **Mało tekstu na starcie.** Opis metody (dziś akapit na pół ekranu, skopiowany z opisu filmu) — krótko, niżej albo pod linkiem.
6. Nagłówek bez „| PC Magik Lab” (dziś tytuł karty przecieka do `h1`). Film osadzony, gdy ma link; bez linku bez napisu „Video link not published yet”.
7. Jedno źródło danych: wszystko z `data/episodes.json`, nic wpisane ręcznie.
8. Dowód: pełnostronicowe zrzuty 1920 i 390 dla odcinka 01 i jednego z 02–12 w `.screenshots/`, plus `bin/po-publikacji.sh` PASS.

## Techniczne — z recenzji, do zrobienia po Twojej stronie
- **T1 (wysoka)** Twoja praca w repo strony (`d6c9479`, `409f604`, `0512656`) jest na gałęzi, nie na `main`; na żywo jest stary format (`data/episodes.json` bez `schema_version`, thinking obcięte do 1 i 2, `/episodes/02-qwen3.6-27b/` → 404). W planie `[A2]` i `[A3]` odhaczone, choć nie wdrożone. Wdrożenie tylko razem z merge `133ad07` w repo pomiarowym — o kolejności zdecyduje koordynator z operatorem; nie scalaj sama.
- **T2 (wysoka)** `publikuj.py` wymaga, żeby **Twój katalog roboczy** repo strony był na czystym `main`. Automat staje, gdy pracujesz na gałęzi. Potrzebny osobny klon repo strony tylko do publikacji (ścieżka `PUB` w `publikuj.py`).
- **T3 (średnia)** `publikuj.py --check` bez `--no-push` robi `git pull --ff-only` w repo strony — to nie jest czysty odczyt; komunikat „destination unchanged” wprowadza w błąd.
- **T4 (średnia)** Podwójna wysyłka filmu: link YouTube zapisuje się dopiero po odpowiedzi JSON. Zerwany `curl` albo odpowiedź nie-JSON = brak linku, ponowienie wyśle film drugi raz. Potrzebny zapis stanu „wysyłka w toku” przed wysyłką i sprawdzenie przed ponowieniem.
- **T5 (niska)** Nowy eksport nie kasuje katalogów biegów, które wypadły z odcinka; dwa formaty nazw biegów w danych (z datą i surowe `baremed-r1_…`).

## Po stronie repo pomiarowego (robi koordynator, nie Ty)
- Nowe zdanie opisu wpisałaś ręcznie w `odcinek.json` 01–12; generatory (`seria/film/odcinek_json.py`, `odcinek_pixel.py`) mają stare, więc przy ponownym generowaniu wróci. Przyrządy filmu są chronione (D30) — poprawimy u siebie.
- Odcinki 13–17 nie dają się opublikować (brak `odcinek.json` w 13, brak `biegi`/`kod_rejestru` w 14–17, biegów badania 06 nie ma w `biegi.jsonl`) — nasze zadanie.

Raport z wykonania: dopisz na końcu tego pliku sekcję „Wykonane” z commitami i dowodami.

## Wykonane

Stan 2026-09-21, gałąź `fix/publication-data-integrity`. **Zmiany lokalne, bez merge i bez wdrożenia. Repo pomiarowe wyłącznie odczytywane.**

- Plan i niezależna recenzja: `ad1905e`. Implementacja, testy i zrzuty: `ba3714f`.
- Pierwszy ekran: model i wynik efektów wyliczony z pełnych kohort feedu. Odcinek 01 pokazuje −22% oraz 5/5; odcinek 02 nakładające się zakresy. Nie ma liczb przypisanych ręcznie do sluga. Wniosek o redukcji wymaga rozłącznych zakresów oraz co najmniej trzech biegów na wariant.
- Zakresy sześciu miar, domyślnie efekty; każdy bieg ma jawnie widoczne wyniki. Dostępne reprezentatywne strony mają podglądy. Każdy bieg z `strona` lub `zrzut` dostaje odpowiedni link, również poza `runs`; ścieżki są walidowane przed publikacją.
- Prompt i surowe materiały pod jednym odnośnikiem do katalogu odcinka na GitHubie. Zachowany `#task-prompt`, do którego prowadzi zaakceptowana główna. Długi opis usunięty ze wstępu, sufiks tytułu usunięty z H1. Prawidłowy link YouTube daje osadzony odtwarzacz; pusty nie daje komunikatu zastępczego. Osadzenie sprawdzone w teście, nie na opublikowanym filmie (feed nie ma URL).
- `index.html`, `assets/lab.css`, `assets/lab.js`, `assets/model-flow.js`, `bin/templates/home.html` i produkcyjny feed: bez zmian. Surowe wyjścia modeli bez zmian.

Dowody uruchomione w tej sesji:

- `bash bin/po-publikacji.sh` → PASS (1 odcinek, 10 pomiarów, 2 eksportowane strony).
- `python3 -m unittest discover -s bin -p 'test_*.py'` → 14 testów OK. Nowy test najpierw odtworzył błędną podstronę (FAIL), po zmianie PASS. Celowa mutacja w izolowanej kopii, dopuszczająca wniosek z samych średnich mimo nakładania zakresów, ponownie daje FAIL.
- Izolowany, wcześniejszy prawdziwy eksport w `.tmp/real-publication`: build i `--check` → PASS, 12 odcinków / 76 pomiarów / 24 strony. Nie dopisano przyszłych odcinków do produkcyjnego feedu.
- `bin/check_episode_results.js` przez Playwright → 4 PASS: odcinki 01 i 02, 1920 i 390 px; wynik na pierwszym ekranie, komplet biegów, sześć przełączników, dostępne linki, brak przepełnienia.
- `bin/check_style_consistency.js` przez Playwright → 10 PASS: te same obliczone style wspólnych komponentów i pasków na głównej i odcinku oraz układ listy.
- Pełnostronicowe zrzuty: `.screenshots/episode-results-01-karpathy-vs-bare-{1920,390}.png` i `.screenshots/episode-results-02-qwen3.6-27b-{1920,390}.png`.
- Podgląd odcinka 01: `http://localhost:8765/episodes/01-karpathy-vs-bare/`. Izolowany drugi odcinek: `http://localhost:8766/episodes/02-qwen3.6-27b/`.

### Nierozwiązane ograniczenia automatu — do koordynatora repo pomiarowego

- **T1:** celowo nie scalono i nie wdrożono. Powyższe PASS oznaczają lokalny kontrakt i renderowanie, nie gotowość automatu produkcyjnego. Kolejność obu merge pozostaje u koordynatora z operatorem.
- **T2:** potwierdzone odczytem propozycji `133ad07`: `PUB` wskazuje współdzielony katalog roboczy. Potrzebny dedykowany klon publikacyjny; nie utworzono go i nie zmieniono konfiguracji źródła.
- **T3:** potwierdzone w `publikuj()`: `git pull --ff-only` poprzedza gałąź `check`. Zatem preflight bez `--no-push` może zmienić checkout przed komunikatem „destination unchanged”. Do poprawy u źródła.
- **T4:** potwierdzone w `rozglos.py`: zapis URL następuje po parsowaniu odpowiedzi. Brak trwałego stanu wysyłki przed webhookiem. Sam stan „w toku” musi zatrzymywać automatyczne ponowienie przy nieznanym wyniku i pozwalać uzgodnić stan z usługą; nie wolno deklarować idempotencji samego uploadu.
- **T5:** nie dodano sprzątania dawnych katalogów ani normalizacji nazw w eksportującym repo. Strona używa wyłącznie biegów z aktualnego feedu, co nie usuwa starych plików z eksportu.
- **Punkt 3 / materiały:** eksport `133ad07` ustawia `strona` i `zrzut` na null dla pozostałych biegów. W aktualnym odcinku 01 to 8 z 10 biegów bez eksportowanej strony/zrzutu. Renderer jest gotowy obsłużyć wszystkie, ale pełne wykonanie żądania operatora wymaga rozszerzenia eksportera i skopiowania istniejących materiałów. Nie wygenerowano fikcyjnych linków ani nie zmieniono ręcznie feedu. Publiczny link GitHuba używa `main`; nowe materiały będą tam dopiero po uzgodnionym wdrożeniu.

## Runda 2 — ocena operatora 2026-09-21 wieczorem
Operator: „o niebo lepiej”, ale nadal są błędy. Zrzuty uwag: `projekt-wiedza-z-yt/seria/strona-lab-ocena/astra-publikacja-2026-09-21/uwaga-operatora-karta-{01,02}.png`.

Słowa operatora: „ta karta powinna być taka sama, jeśli chodzi o wielkość. Podstrony mają inny navbar niż główna, trzeba zadbać o spójność każdej strony i każdej podstrony, a nie za każdym razem coś będzie inaczej wyglądało; wypadałoby wziąć rdzeń z głównej i zmienić tylko zawartość tam, gdzie zmienia się treść, a nie pisać każdej podstrony od nowa”.

1. **Karta wyniku ma tę samą wielkość na każdym odcinku**, niezależnie od treści (01: „−22%” z dwiema liniami opisu jest wyższa niż 02: „Ranges overlap”).
2. **Jeden rdzeń dla wszystkich stron:** navbar, stopka, tło, typografia i komponenty pochodzą z jednego szablonu głównej; podstrona wymienia tylko treść. Navbar podstron ma być identyczny z główną. Dowód: test, który porównuje obliczone style navbaru i stopki na głównej, liście i dwóch odcinkach → ten sam wynik; zrzuty 1920 i 390.
3. **Nagłówek bez sieroty:** tytuł 01 łamie się tak, że „lose” zostaje samo w drugiej linii. Łamanie tytułów ustawia autor (jawny podział tam, gdzie kończy się myśl), nie przeglądarka.

### Wykonane — runda 2

- Plan z niezależną recenzją: `287214e`; implementacja i osiem zrzutów: `ee03585`.
- Jeden `bin/templates/layout.html`, wyciągnięty z zaakceptowanej głównej, generuje wspólny head, navbar, stopkę i skrypty. `home.html` oraz `page.html` zawierają już tylko zawartość głównego obszaru. Podstrony mają również licznik odcinków i przycisk pauzy z głównej. Linki i zasoby uwzględniają zagnieżdżony adres. Animacje hero w `lab.js` nie są uruchamiane na stronach bez hero.
- HTML głównej **bajt w bajt identyczny przed/po** (`cmp` → 0), zarówno z produkcyjnym feedem jednego odcinka, jak i izolowanym feedem dwunastu. `assets/lab.css` bez zmian.
- Karty 01 i 02 mają identyczny rozmiar: 1320×340 px przy szerokości 1920 oraz 354×390 px przy szerokości 390. Test sprawdza też, że treść nie jest obcięta i karta mieści się na pierwszym ekranie.
- Tytuł 01 ma jawne `<br>` po dwukropku; krótkie frazy po przecinkach i końcówka z nazwą modelu pozostają razem. Treść nadal pochodzi z feedu, bez tytułu wpisanego ręcznie do generatora dla odcinka 01. Test pozycji słów potwierdza, że „you lose” jest w jednej linii na obu szerokościach.
- `bash bin/po-publikacji.sh` → PASS. `python3 -m unittest discover -s bin -p 'test_*.py'` → **15 testów OK**, w tym porównanie wygenerowanego navbaru i stopki oraz ścieżek zasobów.
- `playwright-cli -s=publication --raw run-code --filename=bin/check_shared_layout.js` → **PASS**: główna, lista, odcinki 01/02 przy 1920 i 390. Porównanie obliczonych stylów wszystkich elementów navbaru i stopki oraz stylów body, kontrola wymiarów kart, linków menu, zasobów, menu mobilnego, przepełnienia i łamania tytułu. Dodatkowo pauza/wznowienie animacji na podstronach przy standardowych ustawieniach ruchu. Przed poprawką ten sam scenariusz odtworzył różne wysokości kart, navbar/stopkę i samotne słowo w tytule.
- Zrzuty pełnostronicowe: `.screenshots/shared-layout-{home,list,01-karpathy-vs-bare,02-qwen3.6-27b}-{1920,390}.png` — osiem plików.
- Podglądy 8765/8766 odświeżone. Bez merge, wdrożenia i edycji repo pomiarowego. Ograniczenia eksportera z poprzedniej rundy pozostają aktualne.

### Ujednolicenie tytułów — dalsza uwaga operatora

Na polecenie operatora zastąpiono długie nagłówki stałym układem: nazwa modelu w pierwszym wierszu, nazwy porównywanych wariantów w drugim (`BARE vs KARPATHY`). Usunięto dodatkowe hasła i etykietę nad tytułem. Zastępuje to poprzednie rozwiązanie z łamaniem długiego tytułu po dwukropku. Nazwy modeli są pobierane z istniejących tytułów feedu (dla dwóch dotychczasowych formatów); dla innych formatów używane są identyfikatory modeli z pomiarów. Nie zmieniono źródła, feedu ani strony głównej.

Dowody: hook publikacji PASS; 16 testów Python OK; `check_shared_layout.js` PASS dla czterech stron przy 1920/390 px, z kontrolą dwóch wierszy nagłówka odcinków 01 i 02. Zaktualizowano cztery zrzuty `.screenshots/shared-layout-0*`. Podglądy 8765/8766 odświeżone.
