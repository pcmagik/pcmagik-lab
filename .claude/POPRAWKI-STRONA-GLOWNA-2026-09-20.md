# Poprawki strony głównej — 2026-09-20

Zakres: **tylko strona główna** (`index.html` + `assets/`). Podstronami zajmiemy się później,
porządkami w opublikowanym repo (stare wyniki) jeszcze później. Nie rozszerzaj zakresu.

Przed pracą przeczytaj `.claude/CLAUDE.md` w tym repo — opisuje, skąd biorą się liczby i czego
strona nie może twierdzić.

## Najpierw: koncepcja się zmieniła, a strona stoi na starych danych

Strona powstała, gdy mieliśmy **dwa biegi** jednego modelu. Od tego czasu doszło **70 biegów na
11 modelach** i wnioski się odwróciły. To nie jest kosmetyka — to główna teza strony.

**Co teraz wiemy:**

- **Qwen3.8 27B**, n=5 na wariant: z regułami Karpathy'ego **22 % mniej efektów wizualnych,
  w 5 biegach na 5** (bare 129–155, karpathy 101–121, zakresy rozłączne). **Czas i tokeny:
  zakresy się nakładają, czyli bez różnicy.**
- **11 innych modeli lokalnych, n=3**: **11 z 11 ma nakładające się zakresy.** Reguły nie tną
  efektów na modelach lokalnych w ogóle. Qwen3.8 27B jest jedynym wyjątkiem z dwunastu.
- **Rozrzut między biegami tego samego wariantu sięga 93 % czasu i 113 % myślenia.**

**Co z tego wynika dla strony:** obecne zdania „Karpathy took 26.2 % less time in this run"
i „Karpathy used 20.6 % fewer tokens in this run" trzeba usunąć. To jeden bieg kontra jeden bieg,
a 26 % mieści się w całości w szumie 93 %. Dopisek „in this run" tego nie ratuje, bo to jedyne
liczby na stronie i stoją jako nagłówkowy wynik z paskami. Strona, która obok tego pisze
„EXPERIMENTS / NOT ASSUMPTIONS" i „Nothing to hide", sama sobie przeczy.

## Treść — zmiany obowiązkowe

1. **Sekcja porównania przechodzi na zakresy z pięciu biegów, nie na jeden bieg.** Zamiast
   „26 min 34 s kontra 19 min 37 s" pokaż zakres bare i zakres karpathy, z liczbą biegów.
   Zdanie podsumowania ma mówić prawdę: czas i tokeny — **bez różnicy, zakresy się nakładają**.
2. **Dodaj przełącznik „Effects"** obok Time / Tokens / tok/s. To jedyna miara, na której stoi
   film 01, a dziś nie ma jej na stronie wcale. Przy niej zastrzeżenie: licznik konstrukcji CSS
   w kodzie, nie ocena wyglądu.
3. **Nazwy zgodne z filmem:** `Tokens` → `output tokens`, `Throughput` → `tok/s` (same wartości
   są już formatowane `tok/s`, więc rozjeżdża się tylko etykieta), `code lines` →
   `lines of code`, przy `thinking` podpis `output = thinking + final code`. Pod `BARE`
   i `KARPATHY` dopisz, co znaczą: `NO RULES, NO EXTRAS` i `ONE RULES FILE`.
4. **Kolory wariantów są dziś odwrotne niż w filmie.** Obowiązuje na sztywno:
   `BARE = #ff9f45` (ciepły pomarańcz), `KARPATHY = #5ec8ff` (zimny błękit). Fiolet `#a78bfa`
   jest zarezerwowany dla danych, które **nie są** wariantem — dziś strona maluje nim właśnie
   wariant (`.karpathy-bar`, `.v-karpathy`, `.violet-dot` przy „KARPATHY SKILLS VS BARE`).
   Widz wchodzący z filmu musi zobaczyć te same kolory dla tych samych dwóch rzeczy.
5. **Przy `lines of code` dopisz, czego ta liczba nie mierzy** — zadanie jest otwarte, więc mówi
   tylko, jak dużą stronę model postanowił zrobić, a nie ile kosztowała ta sama praca.
6. **Nagłówek „Do better rules make better code?" jest uogólnieniem.** Teza wolno mówić tylko
   o Qwen3.8 27B. Przeformułuj tak, żeby model był w zdaniu.
7. **Dopisz, ile biegów i dlaczego.** Dziś strona mówi „02 measured runs" — czyli komunikuje
   dokładnie to, co odrzuciliśmy. Ma być: n=5 na wariant w tym odcinku, n=3 jako standard serii,
   i jedno zdanie o rozrzucie 93 %, bo bez niego widz nie ma jak ocenić, czy różnica coś znaczy.
8. **Adres `lab.pcmagik.pl` musi być widoczny w treści.** Dziś nie ma go nigdzie — ani w tekście,
   ani w stopce, ani w meta. To jedyny adres, który widz usłyszy w filmie.
9. **Sekcja o autorze.** Dziś jest sama linijka w stopce. Ma być zdanie: Mateusz Piekut
   (PC Magik), serwis komputerowy i homelab z Polski.
10. **Dopisz do metody przeładowanie modelu przed każdym biegiem** — to jeden z filarów metody,
    a kafelek „One variable at a time" o tym milczy.
11. **Dodaj meta społecznościowe:** `og:title`, `og:description`, `og:image`, `canonical`. Dziś
    link wklejony pod filmem pokaże gołą kartę.

Specyfikacja riga jest **poprawna** i zostaje: Ryzen 5 PRO 3600, 32 GB DDR4 ECC, RTX 3090 24 GB.

## Design — co zostaje

Kierunek jest dobry i nie zmieniamy go: ciemny granat, szkło, neon, duża typografia hero, torus
na canvasie, układ sekcji porównania (przełączniki w rogu, dwa poziome paski z wartością na
końcu, zdanie podsumowania, karty biegów z miniaturą i rzędem wartości). Dostępność i fallbacki
też zostają — `skip to content`, `aria-live`, `aria-pressed`, `prefers-reduced-motion`,
„Pause motion", statyczne liczby gdy `index.json` się nie wczyta.

## Design — co poprawić

1. **Mikrotypografia.** W CSS są rozmiary 9, 8, 7 i **6 px** (na 390 px:
   `.telemetry-hardware .tiny-label`, `.telemetry-run .tiny-label`, `.strip-item`,
   `.compare-footer > span`). Napis „LOCAL INFERENCE / REAL SILICON" na telefonie jest
   nieczytelny. **Minimum na tej stronie to 11 px.**
2. **Odwrócona hierarchia w najważniejszym miejscu.** `.compare-value` ma 12 px na desktopie
   i **8–9 px na telefonie** — wartość pomiaru jest mniejsza od opisu obok. Liczby wyniku mają
   być największym elementem tej sekcji.
3. **Cele dotykowe:** 32 z 35 klikalnych elementów na 390 px jest poniżej 44 px. Najgorsze:
   stopka karty biegu („Open live demo" 73×14, „Screenshot" 46×14, „metrics.json" 48×14,
   „Prompt" 29×14), linki stopki (16×14), „Read the task" 80×12, „Pause motion" 28×30.
   Na 1920 px nawigacja ma 19 px wysokości.
4. **Font.** `"Segoe UI", Arial, sans-serif` wypada na Androidzie i Linuksie na Arial. Zakaz
   zewnętrznych fontów dotyczy **stron testowych generowanych przez modele**, nie tej strony —
   tu możesz użyć własnego kroju albo przynajmniej `system-ui`/`ui-sans-serif`.
5. **Dwa przyciski hero wyglądają na niedokończone:** „Rotate core" (106×34) stoi samotnie przy
   prawej krawędzi bez powiązania z resztą, „Pause motion" (28×30) tonie w tle.
6. **Pustka i rytm.** ~90 px pustki przed pierwszą sekcją, a cała strona to trzy bloki treści
   na 3490 px wysokości. Po dołożeniu serii 11 modeli będzie czym ją wypełnić.
7. **Menu mobilne (`<details>`) nie zamyka się po kliknięciu kotwicy** — zostaje otwarte nad
   treścią, do której skoczyło.
8. **Linki „Test materials" i `tasks/easy.txt`** otwierają surowy plik `.md` / `.txt`. To
   najważniejszy link dowodowy na stronie, a wypada z niej do gołego tekstu.

## Kolejność

Najpierw punkty 1–4 z treści (to nieprawdy, nie kosmetyka) i 1–3 z designu (to czytelność).
Reszta potem. Zakres: strona główna. Podstrony i porządki w opublikowanych wynikach — osobno.

---

# Aneks — architektura informacji (2026-09-20, po pierwszej rundzie poprawek)

Poprzednia wersja tego pliku mówiła „brakuje serii 11 modeli", ale nie mówiła, **gdzie** ma ona
mieszkać. W efekcie jedenaście kart modeli trafiło na stronę główną i zapchało ją. To błąd
w poleceniu, nie w wykonaniu — poniżej jest brakujące rozstrzygnięcie.

## Zasada

**Strona główna jest witryną, nie archiwum.** Pokazuje, czym jest kanał, jak mierzymy i co
wyszło **ostatnio**. Komplet wyników mieszka na podstronach.

## Podział

**`/` (główna)**
- hero z tym, czym jest PC Magik Lab, plus CTA do YouTube i do listy odcinków,
- **najwyżej trzy ostatnie wyniki** jako karty, każda linkuje do swojego odcinka,
- link „zobacz wszystkie odcinki" prowadzący do `/episodes/`,
- sekcja o metodzie (jedna zmienna, przeładowanie modelu przed każdym biegiem, n=3 i n=5, rozrzut 93 %),
- sprzęt,
- sekcja o autorze,
- stopka z widocznym `lab.pcmagik.pl`.

Nic więcej. Jeśli sekcja nie odpowiada na pytanie „czym to jest, jak mierzycie, co wyszło
ostatnio, gdzie jest reszta" — jej miejsce jest na podstronie.

**`/episodes/`** — lista wszystkich odcinków, od najnowszego. Krótka karta na odcinek: tytuł,
model, teza w jednym zdaniu, data, link.

**`/episodes/<slug>/`** — jeden odcinek. Film, teza, pełne liczby z biegów, porównanie wariantów
z przełącznikami, strony do obejrzenia, linki do `prompt.txt`, `metrics.json` i zrzutów.

**`/series/<slug>/`** (albo `/research/<slug>/`) — całe badanie, np. seria 11 modeli n=3. Tu
mieszka tabela wszystkich modeli, którą teraz widać na głównej: zakresy efektów per model,
klasa wyniku, kompletność stron. Na głównej co najwyżej jedno zdanie z wynikiem i link tutaj.

## Co zrobić teraz

1. **Zdjąć jedenaście kart modeli ze strony głównej.** Przenieść je na podstronę serii.
2. Na głównej zostawić z tego **jedno zdanie**: reguły Karpathy'ego nie tną efektów na modelach
   lokalnych — 11 z 11 modeli ma nakładające się zakresy — plus link do pełnego badania.
3. Sekcję odcinków na głównej ograniczyć do trzech ostatnich, z linkiem do `/episodes/`.

Kolejność pracy zostaje: najpierw główna (te trzy punkty), podstrony po niej.
