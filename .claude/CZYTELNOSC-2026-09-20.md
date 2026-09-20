# Czytelność — podnieść wszystkie napisy poniżej 11 px

Polecenie operatora, jego własna obserwacja po obejrzeniu przywróconej strony:
„czcionki te mniejsze są za małe, nie widać co jest napisane" → **wszystkie, aby było czytelniej**.

## Stan zmierzony w przeglądarce (nie z CSS)

| Szerokość | Napisów poniżej 11 px |
|---|---|
| 1920 px | 51 |
| 390 px | 54 |

Najmniejsze: `LOCAL INFERENCE / REAL SILICON` 7 px / 6 px, `OPEN-ENDED TASK / NOT EQUIVALENT-WORK
COST` 7 px / 6 px, strzałki `↗` 6 px, a na telefonie `BARE` i `KARPATHY` mają 7 px — etykiety
wariantów, czyli najważniejsze słowa w całej sekcji.

## Co zrobić

**Podnieść wszystkie napisy poniżej progu, bez wyjątków:**

- minimum **11 px** na desktopie,
- minimum **12 px** na szerokości telefonu (≤ 480 px),
- dotyczy też pseudoelementów (`::before`, `::after`) i znaków `↗`.

## Czego przy tym nie zmieniać

To jedyna dozwolona zmiana wizualna. **Nie ruszaj** krojów pisma, kolorów, odstępów między
sekcjami, układu, animacji, rozmiarów nagłówków ani wielkości liczb pomiarowych. Skalę
podnosisz wyłącznie od dołu — to, co już ma 11 px i więcej, zostaje takie, jakie jest.

Jeśli podniesienie rozmiaru psuje układ (napis się łamie, wychodzi z kontenera, nachodzi na
sąsiada), popraw sam ten element — nie przebudowuj sekcji. Gdyby wymagało to zmiany układu
na większą skalę, zgłoś to operatorowi zamiast decydować samodzielnie.

## Jak sprawdzić

Skrypt mierzący realny `computed style` w przeglądarce, na obu szerokościach, ma zwrócić
**zero** napisów poniżej progu. Sam `grep` po CSS nie wystarczy — część rozmiarów wynika
z dziedziczenia i z reguł `@media`.

Do tego zrzut pełnostronicowy 1920 i 390 px obok poprzedniego: różnić się mają wyłącznie
rozmiary najmniejszych napisów.
