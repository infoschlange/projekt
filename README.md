# Aufgaben-Manager mit E-Mail-Bestätigung

Dieses Projekt ist ein persönlicher Aufgaben-Manager mit Registrierung und E-Mail-Bestätigung.

## Installation

1. Stelle sicher, dass Node.js installiert ist (https://nodejs.org).

2. Installiere die Abhängigkeiten:
   ```
   npm install
   ```

3. Konfiguriere die E-Mail-Einstellungen in `.env`:
   - `EMAIL_USER`: Deine E-Mail-Adresse (z.B. deine_email@gmail.com)
   - `EMAIL_PASS`: Dein App-Passwort (für Gmail: https://support.google.com/accounts/answer/185833)

4. Starte den Server:
   ```
   npm start
   ```

5. Öffne `index.html` im Browser (der Server läuft auf http://localhost:3000).

## Funktionen

- Registrierung mit E-Mail-Bestätigung
- Anmeldung
- Aufgaben verwalten
- Gruppen für Aufgaben

## Sicherheit

- Passwörter werden gehasht gespeichert.
- E-Mail-Bestätigung ist erforderlich, um sich anzumelden.
- JWT-Tokens für Authentifizierung.