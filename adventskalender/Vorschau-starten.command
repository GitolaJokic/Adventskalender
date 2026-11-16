#!/bin/zsh
cd -- "${0:A:h}"
print 'Kalendervorschau: http://localhost:8080/?vorschau=1'
print 'Inhaltseditor:    http://localhost:8080/editor.html'
print 'Beenden mit Strg+C. Dieses Terminal während der Vorschau offen lassen.'
/usr/bin/python3 -m http.server 8080 --bind 127.0.0.1
