# Modularisierung & Granularisierung zur Skalierung

Datum: 2026-04-03

## Kurzantwort
**Ja, ein Refactoring zur Modularisierung/Granularisierung ist ratsam** – insbesondere bei der aktuellen Größe und Dichte der Logik in einer einzigen HTML-Datei. Ziel ist: bessere Wartbarkeit, geringeres Regressionsrisiko, schnellere Fehlersuche und reproduzierbare Qualitätsprüfungen lokal (VS Code) und in Git.

---

## Zielbild (6–10 Wochen, inkrementell)

### Architektur-Ziele
1. **Trennung von Verantwortlichkeiten**
   - `domain/` (Rechenlogik, Parser, Formatter)
   - `state/` (Stores, Persistenz, Migrationen)
   - `ui/` (Render-Funktionen, Event-Binding)
   - `features/` (Material, PP, Fremdfertigung, Dashboard)
2. **Side-Effects kapseln**
   - `localStorage`, DOM-Zugriff, `window`-Events über Adapter/Ports.
3. **Testbarkeit**
   - Pure Functions in `domain/` zuerst extrahieren.
   - Integrations-/E2E-Tests auf kritische Benutzerflüsse.
4. **Qualitäts-Gates in Git + VS Code**
   - Lint, Typecheck (optional JS-check/TS), Unit, E2E-Smoke.

---

## Empfohlene Roadmap

## Phase 0 – Baseline & Sicherheitsnetz (Woche 1)
**Ziel:** Aktuelles Verhalten einfrieren, damit Refactoring sicher wird.

### Tasks
- [ ] Kritische Flows definieren (Smoke-Checkliste):
  - Materialzeile anlegen/bearbeiten/löschen
  - PP-Rechnung inkl. Summen
  - Fremdfertigung (mind. 1 kompletter Durchlauf)
  - Persistenz (Reload)
  - Export/Import falls vorhanden
- [ ] „Golden Master“-Snapshots (DOM/Key-KPIs) für Kernansichten erstellen.
- [ ] Fehlertelemetrie lokal verbessern (`console.error` statt stille Catches).

### Deliverables
- `docs/SMOKE_CHECKLIST.md`
- `docs/BASELINE_EXPECTATIONS.md`

---

## Phase 1 – Build-/Projektstruktur einführen (Woche 1–2)
**Ziel:** Modulstruktur schaffen, ohne Verhalten zu ändern.

### Tasks
- [ ] `src/`-Struktur anlegen:
  ```
  src/
    app/
    domain/
    state/
    ui/
    features/
    adapters/
  ```
- [ ] Bestehende Inline-Skripte in externe ES-Module migrieren (schrittweise).
- [ ] Einstiegspunkt `src/main.js` (oder `main.ts`) erstellen.
- [ ] Entwicklungsserver/Bundler (z. B. Vite) einführen.

### Validierung
- [ ] App startet lokal unverändert.
- [ ] Smoke-Checkliste Phase 0 vollständig grün.

---

## Phase 2 – Pure Logic zuerst extrahieren (Woche 2–4)
**Ziel:** Hoher Testhebel durch isolierte Logik.

### Kandidaten für `domain/`
- Parser/Formatter (`pn`, `fmt2`, Währungs-/Zahlenparser)
- Berechnungen Material/PP/Fremdfertigung
- Validierungsregeln für Eingaben
- Normalisierung/Migration von Persistenzobjekten

### Tasks
- [ ] Jede extrahierte Funktion bekommt Unit-Tests.
- [ ] Dubletten (`fmt2`, `eur` etc.) konsolidieren.
- [ ] Explizite Contracts (Input/Output) dokumentieren.

### Validierung
- [ ] Unit-Tests für Kernlogik mit sinnvollen Randfällen (Locale, Nullwerte, Rundung).
- [ ] Keine Regression in Smoke-Checklist.

---

## Phase 3 – State & Persistenz härten (Woche 3–5)
**Ziel:** Datenintegrität und Recoverability.

### Tasks
- [ ] `StorageService` mit klaren Result-Typen (`ok`, `error`, `quota`).
- [ ] Aufrufer müssen Fehlerzustände behandeln (kein stilles Ignorieren).
- [ ] Migrationspfad versionierter Daten (`v1 -> v2 ...`).
- [ ] Schutz gegen gefährliche Objekt-Keys (`__proto__`, `constructor`, `prototype`).

### Validierung
- [ ] Tests für Quota-/Parse-/Migrationsfehler.
- [ ] Negative Tests (defekte localStorage-Werte) führen zu kontrolliertem Verhalten.

---

## Phase 4 – UI modularisieren (Woche 4–7)
**Ziel:** Granulare Komponenten statt monolithischer Render-Pfade.

### Tasks
- [ ] Feature-spezifische Renderer (`features/material/ui/*`, etc.).
- [ ] Event-Binding pro Feature kapseln.
- [ ] Shared-UI-Helfer zentralisieren (`dom`, `toast`, `modal`).

### Validierung
- [ ] Integrations-Tests für Kerninteraktionen.
- [ ] Accessibility-Smoke (Fokus, Tastatur, Labels) für kritische Dialoge.

---

## Phase 5 – CI/CD + DevEx in Git & VS Code (Woche 2–8, parallel)

## Git-Integration (empfohlen)
- **Branch-Schutz:** PR erforderlich, keine direkten Pushes auf `main`.
- **Required Checks:**
  1. `lint`
  2. `unit`
  3. `e2e-smoke`
  4. optional `build`
- **Conventional Commits** + PR-Template (Risiko, Testnachweis, Rollback-Hinweis).

## VS Code-Integration (empfohlen)
- `.vscode/extensions.json`
  - ESLint, Prettier, EditorConfig, GitLens, Playwright
- `.vscode/settings.json`
  - Format on Save, ESLint Fix on Save, Test Explorer Konfiguration
- `.vscode/tasks.json`
  - Aufgaben für `lint`, `test`, `test:e2e`, `build`
- `.vscode/launch.json`
  - Debug-Profile für App + Playwright

## Beispielhafte Skripte (NPM)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "npm run lint && npm run test"
  }
}
```

---

## Teststrategie (konkret)

### 1) Unit-Tests (Vitest/Jest)
- Parser/Formatter (Locale, Tausender-/Dezimaltrennzeichen, Null/NaN)
- Rundungslogik und Summenbildung
- Datenmigrationen
- Key-Sanitizing

### 2) Integrations-Tests
- State + DOM für Material/PP/FF je Kernworkflow
- Persistenz-Lebenszyklus: Eingabe -> Speichern -> Reload -> Wiederherstellung

### 3) E2E-Smoke (Playwright)
- „Happy Path“ je Haupttab
- Reload-Persistenz
- Export/Import (falls Feature aktiv)

### 4) Validitätsprüfungen (Domain-Regeln)
- Feldgrenzen (z. B. Mengen > 0)
- Pflichtfelder
- Rechenkonsistenz (Gesamt = Summe Teilwerte innerhalb Toleranz)

---

## Migrationsprinzipien (wichtig)
1. **Strangler Pattern**: Altcode neben Neucode, schrittweise umhängen.
2. **Feature Flags**: Neue Module pro Bereich aktivierbar/deaktivierbar.
3. **Kein Big-Bang-Rewrite**.
4. **Jede PR verhaltensklein** (1 Risiko, 1 Featurebereich, klare Tests).

---

## Definition of Done (pro Refactoring-PR)
- [ ] Verhalten gegenüber Baseline unverändert oder bewusst dokumentiert.
- [ ] Unit-/Integrations-Tests ergänzt.
- [ ] Keine stillen `catch` ohne Begründung.
- [ ] Lint + Tests lokal grün.
- [ ] PR enthält Rollback-Notiz.

---

## Sofort umsetzbarer Start (nächste 5 Arbeitstage)
1. Tag 1: Baseline-Smoke dokumentieren + 3 Playwright-Smokes anlegen.
2. Tag 2: Build-Struktur (`src/`, `main.js`) aufsetzen, ohne Logikänderung.
3. Tag 3: Parser/Formatter in `domain/number.ts|js` extrahieren + Unit-Tests.
4. Tag 4: `StorageService` einführen + Fehlerpfade testbar machen.
5. Tag 5: CI-Workflow mit `lint + test + e2e-smoke` als Required Checks.

Damit habt ihr in einer Woche ein belastbares Fundament für sichere, skalierbare Weiterentwicklung.
