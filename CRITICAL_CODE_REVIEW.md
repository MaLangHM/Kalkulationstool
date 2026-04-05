# Kritische Code Review – Kalkulationstool

Datum: 2026-04-03

## Gesamtfazit
Der aktuelle Stand liefert viel Funktionalität, hat aber mehrere strukturelle Risiken in Bezug auf Robustheit, Datenintegrität und Wartbarkeit. Besonders kritisch sind fehlende Absicherung bei dynamischen Objekt-Keys sowie das großflächige Verschlucken von Laufzeitfehlern.

## Findings

### 1) **High** – Prototype-Pollution-Risiko über frei benennbare ISO-Gruppen
**Befund:** Benutzereingaben werden als dynamische Keys auf einem normalen Objekt (`ISO_OPTIONS`) verwendet, inklusive Umbenennen/Mergen von Gruppen.

**Warum kritisch:** Werden Schlüssel wie `__proto__`, `constructor` oder `prototype` akzeptiert, kann das Objektverhalten unerwartet manipuliert werden (klassisches Prototype-Pollution-Muster). Auch in einem lokalen Tool führt das zu schwer nachvollziehbaren Fehlern und potenziell inkonsistenten Datenstrukturen.

**Code-Hinweise:**
- Schreiben mit Benutzerwert als Key: `ISO_OPTIONS[gNew] = ...`.
- Lookup per `in` auf Plain Object.

**Empfehlung:**
- `ISO_OPTIONS` auf `Object.create(null)` umstellen **oder** `Map` verwenden.
- Schlüssel strikt validieren (Blacklist `__proto__`, `prototype`, `constructor`; idealerweise Whitelist-Pattern).

### 2) **High** – Breites, stilles Fehler-Verschlucken (`catch(_){}`)
**Befund:** Im Code gibt es sehr viele leere `catch`-Blöcke bzw. Catches ohne Logging/Fehlerkanal.

**Warum kritisch:** Fehler (z. B. bei Persistenz, Rendering, Event-Bindings) bleiben unsichtbar. Das erschwert Debugging massiv und kann zu „scheinbar funktionierender“ UI mit intern kaputtem Zustand führen.

**Empfehlung:**
- Einheitliche Error-Policy einführen:
  - Für erwartete Fehler: dedizierte Behandlung + Nutzerhinweis.
  - Für unerwartete Fehler: mindestens `console.error` mit Kontext.
- Leere Catches nur mit begründeter Ausnahme und Kommentar zulassen.

### 3) **Medium** – Inkonsistente/duplizierte Formatierungs-Helper im FF-Modul
**Befund:** Im FF-Modul sind zentrale Formatter (`fmt2`, `eur`) mehrfach definiert.

**Warum kritisch:** Mehrfachdefinitionen im selben Modul führen zu Shadowing/Überschreiben und erzeugen inkonsistentes Verhalten (z. B. unterschiedliche Null-/Leerwertdarstellung) je nach Aufrufpfad. Das erhöht Fehlerrisiko bei Änderungen.

**Empfehlung:**
- Pro Semantik genau eine Implementierung (`fmt2`, `eur`) im Modul.
- Konsistenzregeln dokumentieren (z. B. „kein Wert“ → `—` oder `""`, aber nicht beides).

### 4) **Medium** – Persistenzfehler werden zwar erkannt, aber häufig nicht korrekt weiterverarbeitet
**Befund:** `Storage.save()` gibt bei Fehlern `false` zurück, aber viele Call-Sites ignorieren den Rückgabewert.

**Warum kritisch:** Bei Quota-/Speicherfehlern läuft die UI weiter, obwohl Daten u. U. nicht gespeichert wurden. Ergebnis: stiller Datenverlust trotz „normaler“ Interaktion.

**Empfehlung:**
- Kritische Schreibpfade müssen `save(...)`-Resultat prüfen.
- Bei Fehlschlag: visuelle Blocker-Warnung + Export-Flow anbieten + Retry/Backoff.

### 5) **Medium** – Sehr hohe Komplexität durch monolithische Datei
**Befund:** Wesentliche Logik liegt in einer einzigen sehr großen HTML-Datei mit mehreren Script-Blöcken.

**Warum kritisch:** Hohe kognitive Last, schwierige Testbarkeit, höhere Regression-Wahrscheinlichkeit bei Änderungen.

**Empfehlung:**
- Schrittweise Modularisierung (z. B. `storage.js`, `masterdata.js`, `ff-module.js`, `ui/*.js`).
- Minimale automatisierte Smoke-Tests für kritische Flows (Laden/Speichern, Rechnen, Import/Export).

## Priorisierte Maßnahmen (Kurzplan)
1. **Sofort:** Prototype-Pollution-Schutz für dynamische Keys.
2. **Sofort:** Leere Catches reduzieren + zentrales Error-Logging.
3. **Kurzfristig:** `Storage.save()`-Ergebnis in kritischen Pfaden verbindlich prüfen.
4. **Kurzfristig:** Doppelte Formatter im FF-Modul konsolidieren.
5. **Mittelfristig:** Datei in Module aufteilen und Smoke-Tests ergänzen.
