# BlazePL007 CS2 — GitHub only

Strona statyczna hostowana na GitHub Pages. Dane turnieju są plikami JSON w tym samym repozytorium. Bez Supabase, Firebase i zewnętrznej bazy.

## WAŻNE: jednorazowa konfiguracja

1. Utwórz publiczne repozytorium GitHub, np. `blazepl007-cs2`.
2. Wgraj całą zawartość paczki do głównego katalogu repozytorium (razem z ukrytym katalogiem `.github`).
3. Otwórz `index.html` i zmień dwie wartości na początku skryptu:
   - `OWNER` = Twój login GitHub
   - `REPO` = nazwa repozytorium
4. W `Settings → Actions → General → Workflow permissions` ustaw **Read and write permissions**.
5. W `Settings → Pages` wybierz **Deploy from a branch**, branch `main`, folder `/ (root)`.
6. W zakładce Issues utwórz etykiety `team-submission` i `approved`. Nazwy muszą być dokładne.

## Jak działają zapisy

Formularz przygotowuje nowe zgłoszenie GitHub Issue. Osoba zgłaszająca musi mieć konto GitHub, zalogować się i kliknąć Submit new issue. Issue dostaje etykietę `team-submission`. Organizator weryfikuje dane i dodaje etykietę `approved`. GitHub Actions automatycznie dopisze drużynę do `data/teams.json` i zamknie zgłoszenie. Publiczna strona pokaże zatwierdzoną drużynę.

Workflow działa wyłącznie po ręcznym dodaniu etykiety `approved`. Nigdy nie wkładaj tokena GitHub do `index.html`.

## Edycja wyników i drabinki

Na razie edytuj pliki JSON bezpośrednio przez GitHub (kliknij plik → ołówek → Commit changes). Zmiany pojawią się na stronie po publikacji Pages.

### `data/teams.json`
```json
[
  {"name":"Blaze Warriors","captain":"NickKapitan","players":["Gracz1","Gracz2","Gracz3","Gracz4","Gracz5"],"reserve":"Rezerwowy"}
]
```

### `data/bracket.json`
```json
[
  {"round":1,"number":1,"team1":"Blaze Warriors","team2":"Team Alpha","score1":13,"score2":8,"winner":1},
  {"round":2,"number":1,"team1":"Blaze Warriors","team2":"Do ustalenia","score1":null,"score2":null,"winner":null}
]
```
`winner`: `1` gdy wygrała pierwsza drużyna, `2` gdy druga, `null` gdy mecz nie został rozegrany.

### `data/results.json`
```json
[
  {"round":"Ćwierćfinał","date":"2026-12-01 18:00","team1":"Blaze Warriors","team2":"Team Alpha","score1":13,"score2":8}
]
```

## Istotne ograniczenia GitHub-only

- GitHub Pages nie jest backendem ani bazą danych z możliwością zapisu z poziomu przeglądarki.
- Zgłoszenia przez formularz wymagają konta GitHub zgłaszającego. Jeśli repozytorium jest publiczne, issue i zawarte w nim dane kontaktowe będą publicznie widoczne. Nie zbieraj prywatnych danych.
- Publiczne repozytorium oznacza, że pliki JSON są publiczne.
- Edycja drabinki i wyników odbywa się przez edycję JSON w GitHub. W tej wersji nie ma panelu administratora z edycją na stronie — bez backendu i bez ujawniania sekretu GitHub nie można bezpiecznie zapisywać zmian bezpośrednio z publicznej strony.
- Dla prywatnych zgłoszeń i wygodnego panelu z zapisem potrzebny byłby backend (np. GitHub App lub zewnętrzna usługa), czego ta wersja celowo nie używa.

Twitch: https://www.twitch.tv/blazepl007
