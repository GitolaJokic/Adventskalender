# Dezemberpost – ein Adventskalender für dich

Eine fertige statische Website mit 24 Türchen, Teddy, Kuh und Schneeflocke, Vorschau, Inhaltseditor und PWA. Ohne Installation von Paketen, ohne Backend, ohne Build-Schritt. Alle Schriften und Grafiken sind lokal, keine externen Dienste oder Tracker.

## Lokal ansehen

Auf dem Mac kannst du `Vorschau-starten.command` doppelklicken und den dort angezeigten Link öffnen. Alternativ im Terminal im Projektordner starten:

```sh
python3 -m http.server 8080
```

- Kalender: http://localhost:8080/
- **Vorschau mit allen offenen Türchen:** http://localhost:8080/?vorschau=1
- **Inhaltseditor:** http://localhost:8080/editor.html

Bitte über einen Webserver öffnen; ein Doppelklick auf index.html genügt wegen des Ladens der Inhaltsdatei nicht. Die Testvorschau speichert keine geöffneten Türchen oder eingelösten Gutscheine dauerhaft. Beim Neuladen sind alle Türchen wieder geschlossen und alle Öffnungsanimationen erneut testbar. Der normale Kalender merkt sich seinen Fortschritt weiterhin. Für einen bestimmten Tag, etwa den 12. Dezember: http://localhost:8080/?vorschau=1&datum=2026-12-12 . Der Parameter `datum` wirkt ausschließlich zusammen mit `vorschau=1`. In dieser Datumsvorschau bleiben vergangene Tage absichtlich als geöffnet sichtbar. Zum Testen aller Öffnungsanimationen die Vorschau ohne `datum` verwenden. Der Editor ist ein Werkzeug für dich und erscheint nicht im Menü deiner Freundin.

## Kostenlos auf GitHub Pages hosten

1. Auf https://github.com/new ein Repository erstellen, z. B. `adventskalender`. Für GitHub Free muss es **Public** sein. README nicht automatisch anlegen lassen, da hier schon eine enthalten ist.
2. Auf der Repository-Seite **uploading an existing file** oder **Add file → Upload files** wählen. Die Dateien und die Ordner `assets` und `media` aus diesem Projekt hineinziehen, dann **Commit changes**. `index.html` muss direkt auf der obersten Ebene liegen, nicht in einem zusätzlichen Adventskalender-Ordner. Der Ordner `tests` muss nicht hochgeladen werden. `.nojekyll` ist für Git-Nutzung enthalten, für diese einfachen Dateinamen beim Browser-Upload nicht zwingend nötig.
3. **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4. **Branch: main**, **Folder: /(root)** auswählen und **Save** drücken.
5. Nach dem Deployment steht der Link unter Settings → Pages, typischerweise `https://DEIN-NAME.github.io/adventskalender/`. Das kann einige Minuten dauern. Bei Problemen unter **Actions** nachsehen.
6. Zuerst `https://DEIN-NAME.github.io/adventskalender/?vorschau=1` ansehen. Den Link ohne `?vorschau=1` später an deine Freundin geben.

Offizielle Anleitung: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Inhalte hinzufügen – ohne Code zu schreiben

1. `editor.html` auf deiner gehosteten Website öffnen, z. B. `https://DEIN-NAME.github.io/adventskalender/editor.html`.
2. Kalenderjahr (voreingestellt: **2026**) und optional den Namen für die Überschrift einstellen.
3. Ein Türchen wählen und die gewünschten Felder füllen. Du kannst Text, ein Foto, ein Video und einen Gutschein pro Türchen kombinieren. Leere Felder werden nicht angezeigt.
4. Fotodateien und Videos auf GitHub in den Ordner `media` laden: **Add file → Upload files**, z. B. `foto-01.jpg`. Den Ordner ggf. zuerst durch eine Datei `media/README.txt` anlegen. Im Editor steht dann als Bildpfad `media/foto-01.jpg`. Dateinamen am besten klein, ohne Leerzeichen oder Umlaute, und Groß-/Kleinschreibung genau beachten. Für Videos browserfähiges MP4 (H.264/AAC) verwenden; MOV/HEVC funktioniert je nach Handy nicht. Kleine Dateien sind angenehmer unterwegs.
5. **content.json herunterladen** klicken. Der Editor speichert nur einen lokalen Entwurf; der Download ist deine Sicherung.
6. Auf GitHub die bestehende `content.json` durch die heruntergeladene Datei **mit exakt diesem Namen** ersetzen, dann committen. Falls dein Browser `content (1).json` nennt, vorher in `content.json` umbenennen. Alternativ die Datei auf GitHub öffnen → Stiftsymbol und den kompletten JSON-Inhalt ersetzen.
7. Deployment abwarten und die Vorschau neu laden. Ein bereits offener Inhaltseditor bevorzugt seinen gespeicherten Entwurf; importiere die aktuelle `content.json`, wenn du ihn ersetzen möchtest.

Du kannst `content.json` auch direkt bearbeiten:

```json
{
  "year": 2026,
  "name": "",
  "greeting": "Schön, dass du da bist.",
  "days": [
    {
      "day": 1,
      "title": "",
      "text": "",
      "image": "",
      "imageAlt": "",
      "video": "",
      "voucher": { "title": "", "description": "" }
    }
  ]
}
```

Tage ohne Eintrag bleiben als neutrale Platzhalter sichtbar. Es sind keine persönlichen Türcheninhalte vorbereitet.

## Android: auf den Startbildschirm

Den normalen HTTPS-Link in Chrome öffnen → Menü ⋮ → **Zum Startbildschirm hinzufügen** / **App installieren**. Die Bezeichnung hängt von Android und Chrome ab. Das Kuh-Icon und der Name kommen aus `manifest.webmanifest`. Eine Installation unter einem anderen Pfad oder auf einer anderen Domain hat einen separaten Speicherstand.

## Verhalten und Grenzen

- Freigabe ab dem jeweiligen Dezembertag um 00:00 Uhr nach **lokaler Gerätezeit**. Jahr in `content.json`. Ab dem 24. Dezember bleiben alle Türchen auch nach Weihnachten offen. Nach Datumswechsel oder Rückkehr zur App wird die Ansicht aktualisiert (spätestens nach 30 Sekunden).
- Vergangene Tage erscheinen automatisch mit umgedrehter Tür, Herz und Tageszahl. Das gilt auch ohne früheren Besuch. Bereits angeklickte heutige Türchen bekommen ebenfalls diese Optik. Diese Türchen zeigen ihren Inhalt beim Anklicken direkt, ohne erneute Öffnungsanimation. Künftige Tage bleiben im normalen Kalender geschlossen.
- Geöffnete Türchen und eingelöste Gutscheine werden nur auf dem jeweiligen Gerät/Browser gespeichert. Kein Kontosystem, keine Synchronisation. Das Markieren eines Gutscheins verschickt keine Nachricht. Löschen der Website-Daten setzt diese Markierungen zurück.
- Nach dem ersten erfolgreichen Online-Aufruf wird die App-Hülle offline gespeichert. Online wird zuerst die aktuelle Version geladen. Bereits angesehene Fotos können offline verfügbar sein; Videos und noch nicht angesehene Medien benötigen Internet. Nach Inhaltsänderungen die App mit Internet neu öffnen oder neu laden.
- **GitHub Pages ist öffentlich.** Fotos, Videos und alle künftigen Türcheninhalte lassen sich technisch abrufen. Datumsfreigabe und Vorschau sind kein Zugriffsschutz. Für vertrauliche Inhalte wäre später echtes geschütztes Hosting nötig. Keine Zugangsdaten oder andere Geheimnisse hochladen.
- Die Startansicht besteht nur aus Überschrift und 24 Türchen. Teddy, Kuh und Schneeflocke helfen abwechselnd beim Öffnen: Links stehende Tiere hoppeln zuerst zum rechten Griff. Das Tier dreht sich dann zum Griff, greift mit beiden Pfoten/Hufen zu, zieht das Türchen auf seine Rückseite und hüpft anschließend vor Freude. Danach erscheint der Inhalt. Bei gesperrten Türchen schaut es streng, schüttelt sich und erinnert an das Freigabedatum. Systemeinstellungen für reduzierte Bewegung werden berücksichtigt; dann erscheint der Dialog direkt.
- Keine automatischen Push-Nachrichten.
- Vor dem Verschenken einmal auf einem echten Android-Handy Installation, Foto und Video testen. Die Desktop-Vorschau ersetzt diesen Gerätetest nicht.

## Dateien

- `index.html`, `style.css`, `app.js`: Kalender und Darstellung
- `content.json`: alle persönlichen Inhalte und Kalenderjahr
- `editor.html`, `editor.js`: Inhaltseditor mit Import/Export
- `media/`: deine Fotos und Videos
- `assets/`: Teddy, Kuh, Schneeflocke (freundlich und streng) und App-Icons
- `manifest.webmanifest`, `sw.js`: Installation und Offline-Hülle

Bei Änderungen der Offline-Strategie/Shell `CACHE` in `sw.js` hochzählen. Bei normalen Inhaltsänderungen genügt der Austausch von `content.json`. Server beenden: im Terminal Strg+C.

## Erste Nachrichten

Die Texte für Tag 1 bis 4 wurden aus `Texte.docx` übernommen: Teddy, Mlieko, Schneeflocke, Teddy. Sie stehen in `content.json` und können weiter im Inhaltseditor geändert werden. Falls dein Editor einen älteren Browserentwurf lädt, importiere dort einmal die aktuelle `content.json`, damit du mit den neuen Texten arbeitest. Im geöffneten Nachrichtenfenster haben die Figuren eigene SVG-Animationen (Blinzeln, Winken, Wiegen), die bei reduzierter Bewegung stillstehen.
