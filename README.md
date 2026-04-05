# Kalkulationstool
Ich entwickele mein eigenes Kalkulationstool für einen Werkzeugbau.

## Qualitätssicherung (neu)
Es wurde eine erste modulare Test-/Qualitätsbasis ergänzt, damit Refactoring schrittweise und valide erfolgen kann.

### Lokale Commands
- `npm install`
- `npm run lint`
- `npm run test`
- `npm run check`

### Struktur
- `src/domain/number.js` – zentrale Parser-/Formatierungslogik + Key-Sicherheitscheck
- `test/domain/number.test.js` – Unit-Tests für Parser/Formatter/Key-Safety
- `.github/workflows/quality.yml` – CI-Checks (Lint + Test)
- `.vscode/*` – VS-Code Tasks/Settings/Extensions
