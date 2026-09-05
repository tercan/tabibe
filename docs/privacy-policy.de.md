# Datenschutzerklärung von Tabibe

[English](privacy-policy.md) | [Türkçe](privacy-policy.tr.md) | [Français](privacy-policy.fr.md) | Deutsch | [Italiano](privacy-policy.it.md)

**Gültig ab:** 5. September 2026

Tabibe ist eine Neuer-Tab-Erweiterung für Chromium, die lokal in deinem Browser arbeitet. Sie enthält weder Analysen, Werbung, Telemetrie, Benutzerkonten noch ein entferntes Anwendungs-Backend.

## Auf deinem Gerät gespeicherte Daten

Tabibe speichert Schnellzugriffs-Websites und -Ordner, Notizen und Notizbücher, Darstellungseinstellungen, hochgeladene Hintergrundbilder und Funktionspräferenzen in chrome.storage.local. Diese Informationen verbleiben im lokalen Browserprofil und werden nicht an den Entwickler übertragen.

Beim Export einer Sicherung wird eine JSON-Datei auf deinem Gerät erstellt. Beim Import wird nur die von dir ausgewählte Datei gelesen, lokal validiert und mit den akzeptierten Daten in den lokalen Erweiterungsspeicher geschrieben.

Gespeicherte Adressen und Namen, Notiztexte, Tags, Zeitstempel, lokale Datensatz-IDs und Wiederherstellungsentwürfe dienen nur deinem Neuer-Tab-Arbeitsbereich. Tabibe bietet keine Cloud-Synchronisierung. Die Browserdemo verwendet localStorage statt Erweiterungsspeicher.

## Browserberechtigungen

Tabibe folgt dem Prinzip der geringsten Berechtigung:

- storage ist erforderlich, um Erweiterungsdaten in deinem lokalen Browserprofil zu speichern.
- search ist erforderlich, um deine Suche über die Chrome Search API an die Standardsuchmaschine von Chrome zu senden. Die Sucheinstellungen des Browsers werden nicht geändert.
- favicon ist optional. Wenn du Website-Icons aktivierst, kann Tabibe den integrierten Favicon-Anbieter von Chrome für Adressen verwenden, die dem Browser bereits bekannt sind. Du kannst diese Berechtigung in den Einstellungen widerrufen.
- system.memory ist optional. Die Berechtigung wird nur beim Aktivieren der Speicheranzeige angefordert und kann durch Deaktivieren dieser Anzeige widerrufen werden.

Tabibe liest die Anzahl der Tabs und Fenster für die lokale Anzeige ohne tabs-Berechtigung oder Zugriff auf Tab-Adressen, Titel und Browserverlauf. Optionale Speicherwerte werden nur vorübergehend angezeigt, nicht gespeichert oder an den Entwickler gesendet. Andere Seiten, Cookies, Passwörter und Gerätesensoren werden nicht gelesen.

## Netzwerkaktivität

Marken-Icons von Simple Icons sind lokal gebündelt. Gespeicherte Website-Adressen werden nicht an einen externen Icon-Dienst gesendet und Tabibe stellt keine Analyse- oder Telemetrieanfragen.

Nur abgesendete Suchen und geöffnete Links, auch in Notizen, führen aus Tabibe heraus. Es wird die Standardsuchmaschine des Browsers verwendet, sofern du nicht ausdrücklich einen anderen Anbieter in Tabibe wählst. Tabibe speichert keine Suchanfragen. Zielseiten erhalten übliche Verbindungsdaten wie deine IP-Adresse nach ihren eigenen Richtlinien. Für Browserdienste gelten die Richtlinien des Browseranbieters.

## Deine Kontrollmöglichkeiten

Du kannst Websites, Ordner, Notizen und Notizbücher bearbeiten oder löschen, Darstellungseinstellungen ändern oder zurücksetzen, optionale Berechtigungen erteilen oder widerrufen sowie in den Einstellungen eine validierte Sicherung exportieren oder wiederherstellen.

## Aufbewahrung und Löschung

Das Löschen eines Eintrags entfernt ihn aus dem aktiven Arbeitsbereich. Rückgängig-Kopien, Wiederherstellungsentwürfe und Sicherungen vor einem Import oder Zurücksetzen können frühere Inhalte lokal behalten. Das Leeren des gesamten Tabibe-Erweiterungsspeichers oder die Deinstallation entfernt diese lokalen Daten. Exportierte JSON-Dateien sowie Geräte- und Browsersicherungen bleiben bis zur separaten Löschung erhalten.

## Grenzen von Speicherung und Dienst

Tabibe verschlüsselt weder lokalen Speicher noch exportierte JSON-Dateien. Es ist kein Passworttresor; speichere keine Passwörter, Zahlungsdaten oder anderen sensiblen Informationen. Schütze dein Browserprofil, Gerät und deine Sicherungen. Der Entwickler besitzt keine Kopie deines lokalen Arbeitsbereichs und kann ihn nicht aus der Ferne abrufen, löschen oder wiederherstellen.

Ununterbrochener Betrieb, verlustfreie Speicherung, Wiederherstellung und dauerhafter Support werden nicht garantiert. Soweit gesetzlich zulässig, wird die Software wie besehen ohne zusätzliche Garantien bereitgestellt. Zwingende Verbraucherrechte und gesetzlich nicht ausschließbare Haftung bleiben unberührt. Diese Grenzen schränken die Zusagen zur Datennutzung nicht ein.

## Eingeschränkte Nutzung (Limited Use)

Tabibes Nutzung von Benutzerdaten einschließlich Informationen aus Chrome-APIs entspricht der Chrome Web Store User Data Policy und deren Limited-Use-Anforderungen. Daten dienen nur den beschriebenen Neuer-Tab-Funktionen. Sie werden nicht verkauft oder für Werbung, Profilbildung, Kreditentscheidungen oder fremde Zwecke verwendet. Der Entwickler erhält lokale Inhalte nur, wenn du sie freiwillig für Support teilst.

## Änderungen dieser Erklärung

Wesentliche Änderungen an dieser Erklärung werden zusammen mit der zugehörigen Tabibe-Version dokumentiert. Das Gültigkeitsdatum wird aktualisiert, wenn sich die Erklärung ändert.

## Kontakt

Entwickler: Tercan Keskin. Datenschutzfragen können im Issue-Tracker gestellt werden. GitHub-Issues sind öffentlich: Füge keine privaten Notizen, Sicherungen oder Zugangsdaten bei. Freiwillig übermittelte Informationen werden von GitHub nach dessen Richtlinien verarbeitet und können vom Entwickler zur Beantwortung gelesen werden. Die öffentliche Website wird von GitHub Pages gehostet; dessen Richtlinien gelten ebenfalls.

[Tabibe-Issue-Tracker öffnen](https://github.com/tercan/tabibe/issues)

[Deutsch](https://tercan.github.io/tabibe/privacy/?lang=de)
