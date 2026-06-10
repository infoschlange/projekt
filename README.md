# Meine Aufgaben

## Kurzbeschreibung

Eine persönliche Aufgabenverwaltungs-App als Single-Page-Webanwendung.

## Zweck

Das Projekt ermöglicht das Erstellen, Verwalten und Organisieren von Aufgaben mit Deadlines, Gruppen und Farbkodierung. Aufgaben werden geräteübergreifend in der Cloud gespeichert. Bei nahenden Fristen werden automatische E-Mail-Erinnerungen verschickt.

## Inhalt des Repositories

| Datei | Beschreibung |
|---|---|
| `index.html` | Vollständige Webanwendung (HTML + JavaScript) |
| `styles.css` | Alle CSS-Stile der Anwendung (ausgelagert aus `index.html`) |
| `README.md` | Projektdokumentation |

## Verwendete Technologien

- **Firebase Authentication** – Anmeldung und Registrierung mit E-Mail-Verifizierung
- **Firestore** – Cloud-Datenbank für geräteübergreifende Datenspeicherung
- **EmailJS** – Automatische E-Mail-Benachrichtigungen 12 Stunden vor Deadline
- **Netlify** – Hosting und Bereitstellung

## Merkmale

- Aufgaben erstellen mit Deadline (Datum + Uhrzeit)
- Gruppen/Kategorien mit individueller Farbkodierung
- Deadline-Statusanzeigen und Statistiken
- Kalenderansicht (Monat, Woche, Tag)
- E-Mail-Benachrichtigungen bei nahenden Fristen

## Voraussetzungen

- Ein moderner Webbrowser (Chrome, Firefox, Edge)

## Nutzung

1. Öffne [https://spiffy-gaufre-d6e231.netlify.app/](https://spiffy-gaufre-d6e231.netlify.app/) direkt im Browser.
2. Registriere dich mit einer E-Mail-Adresse und bestätige dein Konto.
3. Erstelle Aufgaben, weise ihnen Gruppen und Fristen zu.

## Lokale Entwicklung

Da es sich um eine reine HTML/CSS/JS-Anwendung handelt, ist kein Build-Schritt notwendig. Einfach `index.html` im Browser öffnen oder einen lokalen Entwicklungsserver verwenden (z. B. VS Code Live Server).

> **Hinweis:** `index.html` und `styles.css` müssen sich im selben Verzeichnis befinden, damit die Styles korrekt geladen werden.

## Autor

Hüseyin Güdücü