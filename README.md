# Sudoku Solver

Dieses Projekt habe ich während eines zweiwöchigen Praktikums bei i2solutions im April 2025 erstellt.

Es besteht aus einem jQuery-Frontend (`Sudoku/`) und einer ASP.NET Core API (`Sudoku Api/`).
Die gesamte Logik in Frontend und Backend stammt von mir. Nur die HTML-Oberfläche ist mit Unterstützung von Ai erstellt wurden.

## Funktionen

- **Eingabe mit Prüfung:** Nach jeder Eingabe wird geprüft, ob die Zahl in Zeile, Spalte und 3×3-Block nur einmal vorkommt. Konflikte werden rot markiert.
- **Lösen per Backtracking:** Der Solver geht die leeren Felder der Reihe nach durch, probiert die Zahlen 1–9 und geht bei einem Widerspruch zurück. Optional kann man dabei zusehen (visuelles Backtracking).
- **Sudoku generieren:** Ein zufällig gelöstes Sudoku wird erzeugt (Backtracking mit gemischten Zahlen), danach werden 40–70 Felder geleert.
- **Speichern und Laden:** Spielstand, Fehlerfelder und Lösungszeit werden unter einem Namen in einer SQLite-Datenbank gespeichert und können wieder geladen werden.

## API

| Methode | Route | Beschreibung |
|---|---|---|
| `GET` | `/Sudoku?name=xyz` | Lädt den Spielstand zu einem Namen (404, wenn er nicht existiert) |
| `POST` | `/Sudoku` | Speichert einen Spielstand. Gibt es den Namen schon, wird er überschrieben |

Spielfeld und Fehlerfelder werden jeweils als String mit 81 Zeichen übertragen (`0` = leeres bzw. fehlerfreies Feld).

## Starten

1. API starten: `dotnet run --project "Sudoku Api"` (läuft auf `http://localhost:5049`)
2. `Sudoku/home.html` im Browser öffnen
