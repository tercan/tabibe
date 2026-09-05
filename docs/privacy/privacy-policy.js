const SUPPORTED_LOCALES = [
  'en',
  'tr',
  'fr',
  'de',
  'it',
  'es',
  'pt',
  'ru',
  'ar',
  'hi',
  'bn',
  'zh',
  'ja',
];

const PRIVACY_TRANSLATIONS = {
  en: {
    languageLabel: 'Language',
    pageTitle: 'Tabibe Privacy Policy',
    metaDescription:
      'Learn how Tabibe stores extension data locally, uses optional browser permissions, and protects user privacy.',
    title: 'Privacy Policy',
    effectiveLabel: 'Effective date',
    effectiveDate: 'September 5, 2026',
    intro:
      'Tabibe is a Chromium new-tab extension designed to work locally in your browser. It does not include analytics, advertising, telemetry, user accounts, or a remote application backend.',
    dataTitle: 'Data stored on your device',
    dataParagraphs: [
      'Tabibe stores quick-access sites and folders, notes and notebooks, appearance settings, uploaded background images, and feature preferences in chrome.storage.local. This information remains in your local browser profile and is not transmitted to the developer.',
      'Backup export creates a JSON file on your device. Backup import reads only the file you select, validates it locally, and writes accepted data to local extension storage.',
      'Saved URLs and names, note text, tags, timestamps, local record IDs and recovery drafts are used only for your new-tab workspace. Tabibe does not provide cloud sync. In the browser demo, localStorage is used instead of extension storage.',
    ],
    permissionsTitle: 'Browser permissions',
    permissionsIntro: 'Tabibe follows the principle of least privilege:',
    permissionItems: [
      'storage is required to save extension data in your local browser profile.',
      'search is required to send a search you submit to Chrome’s default search provider through the Chrome Search API. It does not change your browser’s search settings.',
      'favicon is optional. When you enable site icons, Tabibe may use Chrome’s built-in favicon provider for addresses already known by the browser. You can revoke this permission from Settings.',
      'system.memory is optional. It is requested only when you enable the memory indicator and can be revoked by disabling that indicator.',
    ],
    permissionsClosing:
      'Tabibe reads tab/window counts for the local indicator, without the tabs permission or access to tab URLs, titles or browsing history. Optional memory values are displayed temporarily and are not stored or sent to the developer. It does not read other pages, cookies, passwords or device sensors.',
    networkTitle: 'Network activity',
    networkParagraphs: [
      'Brand icons are bundled locally from Simple Icons. Saved site addresses are not sent to an external icon service, and Tabibe does not make analytics or telemetry requests.',
      'Only searches you submit and links you open (including links in notes) navigate outside Tabibe. Search uses your browser’s default provider unless you explicitly choose another provider in Tabibe. Queries are not saved by Tabibe. Destination sites receive normal connection data, such as your IP address, under their own policies. Browser services operate under the browser provider’s policies.',
    ],
    controlTitle: 'Your controls',
    controlParagraphs: [
      'You can edit or delete sites, folders, notes, and notebooks; change or reset appearance preferences; grant or revoke optional permissions; and export or restore a validated backup from Settings.',
    ],
    retentionTitle: 'Retention and deletion',
    retentionParagraphs: [
      'Deleting an item removes it from the active workspace. Undo copies, recovery drafts and the snapshot created before a backup restore or data reset can retain earlier content locally. Clearing Tabibe’s entire extension storage or uninstalling it removes that local extension data. Exported JSON files and device/browser backups remain until you delete them separately.',
    ],
    changesTitle: 'Changes to this policy',
    changesParagraphs: [
      'Material changes to this policy will be documented with the related Tabibe release. The effective date will be updated when the policy changes.',
    ],
    contactTitle: 'Contact',
    contactText:
      'Developer: Tercan Keskin. Use the project issue tracker for privacy questions. GitHub issues are public: do not attach private notes, backup files or credentials. Information you voluntarily submit is processed by GitHub under its policies and may be read by the developer to answer your request. The public project website is hosted by GitHub Pages, whose hosting policies also apply.',
    contactLink: 'Open the Tabibe issue tracker',
    footer: 'Tabibe works locally and keeps your extension data under your control.',
    securityTitle: 'Storage and service limits',
    limitedTitle: 'Limited Use',
    securityParagraphs: [
      'Local storage and exported JSON files are not encrypted by Tabibe. This is not a password vault; avoid storing passwords, payment details or other sensitive information. Protect your browser profile, device and backups. The developer does not hold a copy of your local workspace and cannot retrieve, delete or restore it remotely.',
      'No guarantee of uninterrupted operation, loss-free storage, recovery or ongoing support is made. To the extent permitted by applicable law, the software is provided as is, without additional warranties. Mandatory consumer rights and liabilities that cannot legally be excluded remain unaffected. These limits do not reduce the data-use commitments in this policy.',
    ],
    limitedParagraphs: [
      'Tabibe’s use of user data, including information obtained through Chrome APIs, follows the Chrome Web Store User Data Policy and its Limited Use requirements. Data is used only for the disclosed new-tab features. It is not sold or used for advertising, profiling, credit decisions or unrelated purposes. The developer has no access to local workspace content unless you choose to share it for support.',
    ],
  },
  fr: {
    languageLabel: 'Langue',
    pageTitle: 'Politique de confidentialité de Tabibe',
    metaDescription:
      'Découvrez comment Tabibe stocke les données localement, utilise des autorisations facultatives et protège votre vie privée.',
    title: 'Politique de confidentialité',
    effectiveLabel: 'Date d’entrée en vigueur',
    effectiveDate: '5 septembre 2026',
    intro:
      'Tabibe est une extension de nouvel onglet pour Chromium conçue pour fonctionner localement dans votre navigateur. Elle n’intègre ni analyse, ni publicité, ni télémétrie, ni compte utilisateur, ni serveur d’application distant.',
    dataTitle: 'Données stockées sur votre appareil',
    dataParagraphs: [
      'Tabibe stocke les sites et dossiers d’accès rapide, les notes et carnets, les paramètres d’apparence, les images d’arrière-plan importées et les préférences de fonctionnalités dans chrome.storage.local. Ces informations restent dans le profil local de votre navigateur et ne sont pas transmises au développeur.',
      'L’exportation d’une sauvegarde crée un fichier JSON sur votre appareil. L’importation lit uniquement le fichier que vous sélectionnez, le valide localement et écrit les données acceptées dans le stockage local de l’extension.',
      'Les adresses et noms enregistrés, textes des notes, étiquettes, horodatages, identifiants locaux et brouillons de récupération servent uniquement à votre espace de nouvel onglet. Tabibe ne propose pas de synchronisation cloud. La démo utilise localStorage au lieu du stockage de l’extension.',
    ],
    permissionsTitle: 'Autorisations du navigateur',
    permissionsIntro: 'Tabibe applique le principe du moindre privilège :',
    permissionItems: [
      'storage est obligatoire pour enregistrer les données de l’extension dans le profil local de votre navigateur.',
      'search est nécessaire pour envoyer votre recherche au moteur par défaut de Chrome via Chrome Search API, sans modifier les paramètres de recherche du navigateur.',
      'favicon est facultatif. Lorsque vous activez les icônes de sites, Tabibe peut utiliser le fournisseur de favicons intégré de Chrome pour les adresses déjà connues du navigateur. Vous pouvez révoquer cette autorisation dans les Paramètres.',
      'system.memory est facultatif. Cette autorisation est demandée uniquement lorsque vous activez l’indicateur de mémoire et peut être révoquée en désactivant cet indicateur.',
    ],
    permissionsClosing:
      'Tabibe lit le nombre d’onglets et de fenêtres pour l’indicateur local, sans autorisation tabs ni accès à leurs adresses, titres ou à l’historique. Les valeurs de mémoire facultatives sont affichées temporairement, sans être stockées ni transmises au développeur. L’extension ne lit pas les autres pages, cookies, mots de passe ou capteurs.',
    networkTitle: 'Activité réseau',
    networkParagraphs: [
      'Les icônes de marque de Simple Icons sont intégrées localement. Les adresses des sites enregistrés ne sont pas envoyées à un service d’icônes externe et Tabibe n’effectue aucune requête d’analyse ou de télémétrie.',
      'Seules les recherches envoyées et les liens ouverts, y compris dans les notes, vous dirigent hors de Tabibe. La recherche utilise le moteur par défaut du navigateur, sauf si vous en choisissez explicitement un autre dans Tabibe. Tabibe ne conserve pas les requêtes. Les sites destinataires reçoivent les données de connexion habituelles, telles que votre adresse IP, selon leurs politiques. Les services du navigateur relèvent des politiques de son fournisseur.',
    ],
    controlTitle: 'Vos moyens de contrôle',
    controlParagraphs: [
      'Vous pouvez modifier ou supprimer des sites, dossiers, notes et carnets ; modifier ou réinitialiser les préférences d’apparence ; accorder ou révoquer les autorisations facultatives ; et exporter ou restaurer une sauvegarde validée depuis les Paramètres.',
    ],
    retentionTitle: 'Conservation et suppression',
    retentionParagraphs: [
      'Supprimer un élément le retire de l’espace actif. Les copies d’annulation, brouillons de récupération et instantanés précédant une restauration ou réinitialisation peuvent conserver l’ancien contenu localement. Effacer tout le stockage de Tabibe ou désinstaller l’extension supprime ces données locales. Les fichiers JSON exportés et sauvegardes du navigateur ou de l’appareil restent jusqu’à leur suppression séparée.',
    ],
    changesTitle: 'Modifications de cette politique',
    changesParagraphs: [
      'Toute modification importante de cette politique sera documentée avec la version correspondante de Tabibe. La date d’entrée en vigueur sera actualisée lorsque la politique changera.',
    ],
    contactTitle: 'Contact',
    contactText:
      'Développeur : Tercan Keskin. Utilisez le suivi des problèmes pour les questions de confidentialité. Les tickets GitHub sont publics : ne joignez pas de notes privées, sauvegardes ou identifiants. Les informations envoyées volontairement sont traitées par GitHub selon ses politiques et peuvent être lues par le développeur pour répondre. Le site public est hébergé par GitHub Pages, dont les politiques s’appliquent également.',
    contactLink: 'Ouvrir le gestionnaire de problèmes de Tabibe',
    footer: 'Tabibe fonctionne localement et vous laisse le contrôle de vos données d’extension.',
    securityTitle: 'Limites du stockage et du service',
    limitedTitle: 'Utilisation limitée (Limited Use)',
    securityParagraphs: [
      'Tabibe ne chiffre pas le stockage local ni les fichiers JSON exportés. Ce n’est pas un coffre-fort de mots de passe : évitez les mots de passe, données de paiement et autres informations sensibles. Protégez votre profil, appareil et sauvegardes. Le développeur n’a pas de copie de votre espace local et ne peut pas le récupérer, le supprimer ou le restaurer à distance.',
      'Aucune garantie de fonctionnement ininterrompu, de conservation sans perte, de récupération ou de support continu n’est donnée. Dans les limites permises par la loi, le logiciel est fourni en l’état, sans garantie supplémentaire. Les droits impératifs des consommateurs et responsabilités légalement non excluables restent applicables. Ces limites ne réduisent pas les engagements d’utilisation des données.',
    ],
    limitedParagraphs: [
      'L’utilisation des données par Tabibe, y compris celles provenant des API Chrome, respecte la politique de données utilisateur du Chrome Web Store et ses exigences Limited Use. Les données servent uniquement aux fonctions de nouvel onglet décrites. Elles ne sont ni vendues ni utilisées pour la publicité, le profilage, le crédit ou des finalités sans rapport. Le développeur n’accède au contenu local que si vous choisissez de le partager pour l’assistance.',
    ],
  },
  de: {
    languageLabel: 'Sprache',
    pageTitle: 'Datenschutzerklärung von Tabibe',
    metaDescription:
      'Erfahre, wie Tabibe Erweiterungsdaten lokal speichert, optionale Browserberechtigungen verwendet und deine Privatsphäre schützt.',
    title: 'Datenschutzerklärung',
    effectiveLabel: 'Gültig ab',
    effectiveDate: '5. September 2026',
    intro:
      'Tabibe ist eine Neuer-Tab-Erweiterung für Chromium, die lokal in deinem Browser arbeitet. Sie enthält weder Analysen, Werbung, Telemetrie, Benutzerkonten noch ein entferntes Anwendungs-Backend.',
    dataTitle: 'Auf deinem Gerät gespeicherte Daten',
    dataParagraphs: [
      'Tabibe speichert Schnellzugriffs-Websites und -Ordner, Notizen und Notizbücher, Darstellungseinstellungen, hochgeladene Hintergrundbilder und Funktionspräferenzen in chrome.storage.local. Diese Informationen verbleiben im lokalen Browserprofil und werden nicht an den Entwickler übertragen.',
      'Beim Export einer Sicherung wird eine JSON-Datei auf deinem Gerät erstellt. Beim Import wird nur die von dir ausgewählte Datei gelesen, lokal validiert und mit den akzeptierten Daten in den lokalen Erweiterungsspeicher geschrieben.',
      'Gespeicherte Adressen und Namen, Notiztexte, Tags, Zeitstempel, lokale Datensatz-IDs und Wiederherstellungsentwürfe dienen nur deinem Neuer-Tab-Arbeitsbereich. Tabibe bietet keine Cloud-Synchronisierung. Die Browserdemo verwendet localStorage statt Erweiterungsspeicher.',
    ],
    permissionsTitle: 'Browserberechtigungen',
    permissionsIntro: 'Tabibe folgt dem Prinzip der geringsten Berechtigung:',
    permissionItems: [
      'storage ist erforderlich, um Erweiterungsdaten in deinem lokalen Browserprofil zu speichern.',
      'search ist erforderlich, um deine Suche über die Chrome Search API an die Standardsuchmaschine von Chrome zu senden. Die Sucheinstellungen des Browsers werden nicht geändert.',
      'favicon ist optional. Wenn du Website-Icons aktivierst, kann Tabibe den integrierten Favicon-Anbieter von Chrome für Adressen verwenden, die dem Browser bereits bekannt sind. Du kannst diese Berechtigung in den Einstellungen widerrufen.',
      'system.memory ist optional. Die Berechtigung wird nur beim Aktivieren der Speicheranzeige angefordert und kann durch Deaktivieren dieser Anzeige widerrufen werden.',
    ],
    permissionsClosing:
      'Tabibe liest die Anzahl der Tabs und Fenster für die lokale Anzeige ohne tabs-Berechtigung oder Zugriff auf Tab-Adressen, Titel und Browserverlauf. Optionale Speicherwerte werden nur vorübergehend angezeigt, nicht gespeichert oder an den Entwickler gesendet. Andere Seiten, Cookies, Passwörter und Gerätesensoren werden nicht gelesen.',
    networkTitle: 'Netzwerkaktivität',
    networkParagraphs: [
      'Marken-Icons von Simple Icons sind lokal gebündelt. Gespeicherte Website-Adressen werden nicht an einen externen Icon-Dienst gesendet und Tabibe stellt keine Analyse- oder Telemetrieanfragen.',
      'Nur abgesendete Suchen und geöffnete Links, auch in Notizen, führen aus Tabibe heraus. Es wird die Standardsuchmaschine des Browsers verwendet, sofern du nicht ausdrücklich einen anderen Anbieter in Tabibe wählst. Tabibe speichert keine Suchanfragen. Zielseiten erhalten übliche Verbindungsdaten wie deine IP-Adresse nach ihren eigenen Richtlinien. Für Browserdienste gelten die Richtlinien des Browseranbieters.',
    ],
    controlTitle: 'Deine Kontrollmöglichkeiten',
    controlParagraphs: [
      'Du kannst Websites, Ordner, Notizen und Notizbücher bearbeiten oder löschen, Darstellungseinstellungen ändern oder zurücksetzen, optionale Berechtigungen erteilen oder widerrufen sowie in den Einstellungen eine validierte Sicherung exportieren oder wiederherstellen.',
    ],
    retentionTitle: 'Aufbewahrung und Löschung',
    retentionParagraphs: [
      'Das Löschen eines Eintrags entfernt ihn aus dem aktiven Arbeitsbereich. Rückgängig-Kopien, Wiederherstellungsentwürfe und Sicherungen vor einem Import oder Zurücksetzen können frühere Inhalte lokal behalten. Das Leeren des gesamten Tabibe-Erweiterungsspeichers oder die Deinstallation entfernt diese lokalen Daten. Exportierte JSON-Dateien sowie Geräte- und Browsersicherungen bleiben bis zur separaten Löschung erhalten.',
    ],
    changesTitle: 'Änderungen dieser Erklärung',
    changesParagraphs: [
      'Wesentliche Änderungen an dieser Erklärung werden zusammen mit der zugehörigen Tabibe-Version dokumentiert. Das Gültigkeitsdatum wird aktualisiert, wenn sich die Erklärung ändert.',
    ],
    contactTitle: 'Kontakt',
    contactText:
      'Entwickler: Tercan Keskin. Datenschutzfragen können im Issue-Tracker gestellt werden. GitHub-Issues sind öffentlich: Füge keine privaten Notizen, Sicherungen oder Zugangsdaten bei. Freiwillig übermittelte Informationen werden von GitHub nach dessen Richtlinien verarbeitet und können vom Entwickler zur Beantwortung gelesen werden. Die öffentliche Website wird von GitHub Pages gehostet; dessen Richtlinien gelten ebenfalls.',
    contactLink: 'Tabibe-Issue-Tracker öffnen',
    footer: 'Tabibe arbeitet lokal und lässt dir die Kontrolle über deine Erweiterungsdaten.',
    securityTitle: 'Grenzen von Speicherung und Dienst',
    limitedTitle: 'Eingeschränkte Nutzung (Limited Use)',
    securityParagraphs: [
      'Tabibe verschlüsselt weder lokalen Speicher noch exportierte JSON-Dateien. Es ist kein Passworttresor; speichere keine Passwörter, Zahlungsdaten oder anderen sensiblen Informationen. Schütze dein Browserprofil, Gerät und deine Sicherungen. Der Entwickler besitzt keine Kopie deines lokalen Arbeitsbereichs und kann ihn nicht aus der Ferne abrufen, löschen oder wiederherstellen.',
      'Ununterbrochener Betrieb, verlustfreie Speicherung, Wiederherstellung und dauerhafter Support werden nicht garantiert. Soweit gesetzlich zulässig, wird die Software wie besehen ohne zusätzliche Garantien bereitgestellt. Zwingende Verbraucherrechte und gesetzlich nicht ausschließbare Haftung bleiben unberührt. Diese Grenzen schränken die Zusagen zur Datennutzung nicht ein.',
    ],
    limitedParagraphs: [
      'Tabibes Nutzung von Benutzerdaten einschließlich Informationen aus Chrome-APIs entspricht der Chrome Web Store User Data Policy und deren Limited-Use-Anforderungen. Daten dienen nur den beschriebenen Neuer-Tab-Funktionen. Sie werden nicht verkauft oder für Werbung, Profilbildung, Kreditentscheidungen oder fremde Zwecke verwendet. Der Entwickler erhält lokale Inhalte nur, wenn du sie freiwillig für Support teilst.',
    ],
  },
  it: {
    languageLabel: 'Lingua',
    pageTitle: 'Informativa sulla privacy di Tabibe',
    metaDescription:
      'Scopri come Tabibe archivia localmente i dati dell’estensione, usa autorizzazioni facoltative e protegge la tua privacy.',
    title: 'Informativa sulla privacy',
    effectiveLabel: 'Data di entrata in vigore',
    effectiveDate: '5 settembre 2026',
    intro:
      'Tabibe è un’estensione per la nuova scheda di Chromium progettata per funzionare localmente nel browser. Non include analisi, pubblicità, telemetria, account utente o un backend remoto dell’applicazione.',
    dataTitle: 'Dati archiviati sul dispositivo',
    dataParagraphs: [
      'Tabibe archivia siti e cartelle di accesso rapido, note e taccuini, impostazioni dell’aspetto, immagini di sfondo caricate e preferenze delle funzionalità in chrome.storage.local. Queste informazioni restano nel profilo locale del browser e non vengono trasmesse allo sviluppatore.',
      'L’esportazione di un backup crea un file JSON sul dispositivo. L’importazione legge solo il file selezionato, lo convalida localmente e scrive i dati accettati nell’archivio locale dell’estensione.',
      'Indirizzi e nomi salvati, testi delle note, tag, date, identificatori locali e bozze di recupero servono solo allo spazio della nuova scheda. Tabibe non offre sincronizzazione cloud. La demo nel browser usa localStorage al posto dell’archiviazione dell’estensione.',
    ],
    permissionsTitle: 'Autorizzazioni del browser',
    permissionsIntro: 'Tabibe applica il principio del privilegio minimo:',
    permissionItems: [
      'storage è necessario per salvare i dati dell’estensione nel profilo locale del browser.',
      'search è necessario per inviare le ricerche al motore predefinito di Chrome tramite Chrome Search API, senza modificare le impostazioni di ricerca del browser.',
      'favicon è facoltativo. Quando attivi le icone dei siti, Tabibe può usare il provider di favicon integrato di Chrome per gli indirizzi già noti al browser. Puoi revocare questa autorizzazione dalle Impostazioni.',
      'system.memory è facoltativo. Viene richiesto solo quando attivi l’indicatore della memoria e può essere revocato disattivando l’indicatore.',
    ],
    permissionsClosing:
      'Tabibe legge il numero di schede e finestre per l’indicatore locale, senza autorizzazione tabs né accesso a indirizzi, titoli o cronologia. I valori facoltativi della memoria sono mostrati temporaneamente, senza essere salvati o inviati allo sviluppatore. Non legge altre pagine, cookie, password o sensori del dispositivo.',
    networkTitle: 'Attività di rete',
    networkParagraphs: [
      'Le icone dei marchi di Simple Icons sono incluse localmente. Gli indirizzi dei siti salvati non vengono inviati a un servizio di icone esterno e Tabibe non effettua richieste di analisi o telemetria.',
      'Solo le ricerche inviate e i link aperti, anche nelle note, portano fuori da Tabibe. Viene usato il motore predefinito del browser, salvo scelta esplicita di un altro in Tabibe. Tabibe non salva le ricerche. I siti di destinazione ricevono i normali dati di connessione, come l’indirizzo IP, secondo le proprie informative. Ai servizi del browser si applicano le politiche del relativo fornitore.',
    ],
    controlTitle: 'I tuoi controlli',
    controlParagraphs: [
      'Puoi modificare o eliminare siti, cartelle, note e taccuini; cambiare o reimpostare le preferenze dell’aspetto; concedere o revocare le autorizzazioni facoltative; ed esportare o ripristinare un backup convalidato dalle Impostazioni.',
    ],
    retentionTitle: 'Conservazione ed eliminazione',
    retentionParagraphs: [
      'Eliminare un elemento lo rimuove dallo spazio attivo. Copie di annullamento, bozze di recupero e istantanee precedenti a ripristini o reimpostazioni possono conservare vecchi contenuti localmente. Svuotare tutta l’archiviazione di Tabibe o disinstallarlo elimina questi dati locali. I file JSON esportati e i backup del dispositivo o browser restano fino all’eliminazione separata.',
    ],
    changesTitle: 'Modifiche a questa informativa',
    changesParagraphs: [
      'Le modifiche sostanziali a questa informativa saranno documentate con la relativa versione di Tabibe. La data di entrata in vigore verrà aggiornata quando l’informativa cambia.',
    ],
    contactTitle: 'Contatti',
    contactText:
      'Sviluppatore: Tercan Keskin. Per domande sulla privacy usa il tracker del progetto. Le segnalazioni GitHub sono pubbliche: non allegare note private, backup o credenziali. I dati inviati volontariamente sono trattati da GitHub secondo le sue politiche e possono essere letti dallo sviluppatore per rispondere. Il sito pubblico è ospitato da GitHub Pages, le cui politiche si applicano a sua volta.',
    contactLink: 'Apri il registro dei problemi di Tabibe',
    footer: 'Tabibe funziona localmente e mantiene i dati dell’estensione sotto il tuo controllo.',
    securityTitle: 'Limiti di archiviazione e servizio',
    limitedTitle: 'Uso limitato (Limited Use)',
    securityParagraphs: [
      'Tabibe non cifra l’archiviazione locale né i file JSON esportati. Non è un gestore di password: evita password, dati di pagamento e altre informazioni sensibili. Proteggi profilo, dispositivo e backup. Lo sviluppatore non possiede una copia dello spazio locale e non può recuperarlo, eliminarlo o ripristinarlo da remoto.',
      'Non si garantiscono funzionamento ininterrotto, archiviazione senza perdite, recupero o assistenza continuativa. Nei limiti consentiti dalla legge, il software è fornito così com’è, senza ulteriori garanzie. Restano salvi i diritti inderogabili dei consumatori e le responsabilità non escludibili per legge. Questi limiti non riducono gli impegni sull’uso dei dati.',
    ],
    limitedParagraphs: [
      'L’uso dei dati da parte di Tabibe, incluse le informazioni delle API Chrome, rispetta la Chrome Web Store User Data Policy e i requisiti Limited Use. I dati servono solo alle funzioni della nuova scheda descritte. Non sono venduti né usati per pubblicità, profilazione, valutazioni creditizie o scopi estranei. Lo sviluppatore accede ai contenuti locali solo se scegli di condividerli per assistenza.',
    ],
  },
  tr: {
    languageLabel: 'Dil',
    pageTitle: 'Tabibe Gizlilik Politikası',
    metaDescription:
      'Tabibe’nin eklenti verilerini yerel olarak nasıl sakladığını, isteğe bağlı izinleri nasıl kullandığını ve kullanıcı gizliliğini nasıl koruduğunu öğrenin.',
    title: 'Gizlilik Politikası',
    effectiveLabel: 'Yürürlük tarihi',
    effectiveDate: '5 Eylül 2026',
    intro:
      'Tabibe, tarayıcınızda yerel olarak çalışmak üzere tasarlanmış bir Chromium yeni sekme eklentisidir. Analiz, reklam, telemetri, kullanıcı hesabı veya uzak uygulama sunucusu içermez.',
    dataTitle: 'Cihazınızda saklanan veriler',
    dataParagraphs: [
      'Tabibe; hızlı erişim sitelerini ve klasörlerini, notları ve not defterlerini, görünüm ayarlarını, yüklenen arka plan görsellerini ve özellik tercihlerini chrome.storage.local içinde saklar. Bu bilgiler yerel tarayıcı profilinizde kalır ve geliştiriciye iletilmez.',
      'Yedek dışa aktarma işlemi cihazınızda bir JSON dosyası oluşturur. Yedek içe aktarma işlemi yalnızca seçtiğiniz dosyayı okur, yerel olarak doğrular ve kabul edilen verileri eklentinin yerel depolama alanına yazar.',
      'Kayıtlı adres ve adlar, not metinleri, etiketler, zaman damgaları, yerel kayıt kimlikleri ve kurtarma taslakları yalnızca yeni sekme çalışma alanınız için kullanılır. Tabibe bulut eşitlemesi sunmaz. Tarayıcı demosunda eklenti depolaması yerine localStorage kullanılır.',
    ],
    permissionsTitle: 'Tarayıcı izinleri',
    permissionsIntro: 'Tabibe en az yetki ilkesini uygular:',
    permissionItems: [
      'storage, eklenti verilerini yerel tarayıcı profilinizde saklamak için zorunludur.',
      'search, gönderdiğiniz aramayı Chrome Search API üzerinden Chrome’un varsayılan arama sağlayıcısına iletmek için gereklidir. Tarayıcınızın arama ayarlarını değiştirmez.',
      'favicon isteğe bağlıdır. Site simgelerini etkinleştirdiğinizde Tabibe, tarayıcının önceden bildiği adresler için Chrome’un yerleşik favicon sağlayıcısını kullanabilir. Bu izni Ayarlar bölümünden geri alabilirsiniz.',
      'system.memory isteğe bağlıdır. Yalnızca bellek göstergesini etkinleştirdiğinizde istenir ve gösterge kapatılarak geri alınabilir.',
    ],
    permissionsClosing:
      'Tabibe, yerel gösterge için sekme/pencere sayılarını tabs izni olmadan okur; sekme adreslerine, başlıklarına veya tarama geçmişine erişmez. İsteğe bağlı bellek değerleri geçici olarak gösterilir; saklanmaz ve geliştiriciye gönderilmez. Diğer sayfaları, çerezleri, parolaları veya cihaz sensörlerini okumaz.',
    networkTitle: 'Ağ etkinliği',
    networkParagraphs: [
      'Marka simgeleri Simple Icons kaynağından eklenti içinde yerel olarak paketlenir. Kayıtlı site adresleri harici bir simge servisine gönderilmez ve Tabibe analiz veya telemetri isteği yapmaz.',
      'Yalnızca gönderdiğiniz aramalar ve açtığınız bağlantılar (notlardaki bağlantılar dâhil) Tabibe dışına yönlendirilir. Tabibe içinde açıkça başka bir sağlayıcı seçmedikçe tarayıcınızın varsayılan arama sağlayıcısı kullanılır. Tabibe sorguları kaydetmez. Hedef siteler IP adresiniz gibi olağan bağlantı bilgilerini kendi politikalarına göre alır. Tarayıcı hizmetlerinde tarayıcı sağlayıcısının politikaları geçerlidir.',
    ],
    controlTitle: 'Denetim seçenekleriniz',
    controlParagraphs: [
      'Siteleri, klasörleri, notları ve not defterlerini düzenleyebilir veya silebilir; görünüm tercihlerini değiştirebilir ya da sıfırlayabilir; isteğe bağlı izinleri verebilir veya geri alabilir ve Ayarlar bölümünden doğrulanmış bir yedeği dışa aktarabilir ya da geri yükleyebilirsiniz.',
    ],
    retentionTitle: 'Saklama ve silme',
    retentionParagraphs: [
      'Bir öğeyi silmek onu etkin çalışma alanından kaldırır. Geri alma kopyaları, kurtarma taslakları ve yedek geri yükleme veya veri sıfırlama öncesi oluşturulan kopya, önceki içeriği yerel olarak tutabilir. Tabibe’nin tüm eklenti depolamasını temizlemek veya eklentiyi kaldırmak bu yerel eklenti verilerini kaldırır. Dışa aktarılan JSON dosyaları ve cihaz/tarayıcı yedekleri siz ayrıca silene kadar kalır.',
    ],
    changesTitle: 'Politika değişiklikleri',
    changesParagraphs: [
      'Bu politikadaki önemli değişiklikler ilgili Tabibe sürümüyle birlikte belgelenecektir. Politika değiştiğinde yürürlük tarihi güncellenecektir.',
    ],
    contactTitle: 'İletişim',
    contactText:
      'Geliştirici: Tercan Keskin. Gizlilik soruları için projenin hata takip sayfasını kullanabilirsiniz. GitHub bildirimleri herkese açıktır; özel not, yedek dosyası veya kimlik bilgisi eklemeyin. Gönüllü olarak gönderdiğiniz bilgiler GitHub’ın politikalarına göre işlenir ve talebinizi yanıtlamak için geliştirici tarafından okunabilir. Projenin herkese açık sitesi GitHub Pages üzerinde barındırılır; barındırma hizmetinin politikaları da geçerlidir.',
    contactLink: 'Tabibe sorun bildirimlerini aç',
    footer: 'Tabibe yerel olarak çalışır ve eklenti verilerinizin denetimini size bırakır.',
    securityTitle: 'Depolama ve hizmet sınırları',
    limitedTitle: 'Sınırlı Kullanım (Limited Use)',
    securityParagraphs: [
      'Yerel depolama ve dışa aktarılan JSON dosyaları Tabibe tarafından şifrelenmez. Tabibe bir parola kasası değildir; parola, ödeme bilgisi veya başka hassas bilgiler saklamaktan kaçının. Tarayıcı profilinizi, cihazınızı ve yedeklerinizi koruyun. Geliştirici yerel çalışma alanınızın bir kopyasını tutmaz; bu verileri uzaktan getiremez, silemez veya kurtaramaz.',
      'Kesintisiz çalışma, kayıpsız saklama, veri kurtarma veya sürekli destek garantisi verilmez. Yazılım, uygulanabilir hukukun izin verdiği ölçüde olduğu gibi, ek garanti olmadan sunulur. Emredici tüketici hakları ve hukuken sınırlandırılamayan sorumluluklar saklıdır. Bu sınırlar politikadaki veri kullanım taahhütlerini daraltmaz.',
    ],
    limitedParagraphs: [
      'Tabibe’nin Chrome API’lerinden alınan bilgiler dâhil kullanıcı verilerini kullanımı, Chrome Web Mağazası Kullanıcı Verisi Politikası ve Limited Use gereksinimlerine uyar. Veriler yalnızca açıklanan yeni sekme özellikleri için kullanılır; satılmaz, reklam, profilleme, kredi değerlendirmesi veya ilgisiz amaçlarla kullanılmaz. Destek için paylaşmayı seçmediğiniz sürece geliştirici yerel çalışma alanı içeriğine erişemez.',
    ],
  },
  es: {
    languageLabel: 'Idioma',
    pageTitle: 'Política de privacidad de Tabibe',
    metaDescription:
      'Conoce cómo Tabibe almacena los datos localmente, utiliza permisos opcionales y protege tu privacidad.',
    title: 'Política de privacidad',
    effectiveLabel: 'Fecha de entrada en vigor',
    effectiveDate: '5 de septiembre de 2026',
    intro:
      'Tabibe es una extensión de nueva pestaña para Chromium diseñada para funcionar localmente en tu navegador. No incluye analítica, publicidad, telemetría, cuentas de usuario ni un servidor remoto de aplicación.',
    dataTitle: 'Datos almacenados en tu dispositivo',
    dataParagraphs: [
      'Tabibe guarda sitios y carpetas de acceso rápido, notas y cuadernos, ajustes de apariencia, imágenes de fondo cargadas y preferencias en chrome.storage.local. Esta información permanece en el perfil local del navegador y no se transmite al desarrollador.',
      'La exportación crea un archivo JSON en tu dispositivo. La importación solo lee el archivo que seleccionas, lo valida localmente y guarda los datos aceptados en el almacenamiento local de la extensión.',
      'Las direcciones y nombres guardados, notas, etiquetas, fechas, identificadores locales y borradores de recuperación se usan solo para el espacio de nueva pestaña. No hay sincronización en la nube. La demo usa localStorage en vez del almacenamiento de la extensión.',
    ],
    permissionsTitle: 'Permisos del navegador',
    permissionsIntro: 'Tabibe aplica el principio de privilegio mínimo:',
    permissionItems: [
      'storage es necesario para guardar los datos de la extensión en el perfil local del navegador.',
      'search permite enviar las búsquedas al proveedor predeterminado de Chrome mediante Chrome Search API sin cambiar la configuración del navegador.',
      'favicon es opcional. Al activar los iconos de sitios, Tabibe puede usar el proveedor integrado de Chrome para direcciones que el navegador ya conoce. Puedes revocar este permiso en Ajustes.',
      'system.memory es opcional. Solo se solicita al activar el indicador de memoria y se puede revocar al desactivarlo.',
    ],
    permissionsClosing:
      'Tabibe lee el número de pestañas y ventanas para el indicador local, sin permiso tabs ni acceso a direcciones, títulos o historial. Los valores opcionales de memoria se muestran temporalmente, sin guardarse ni enviarse al desarrollador. No lee otras páginas, cookies, contraseñas ni sensores.',
    networkTitle: 'Actividad de red',
    networkParagraphs: [
      'Los iconos de marca se incluyen localmente desde Simple Icons. Las direcciones guardadas no se envían a servicios externos de iconos y Tabibe no realiza solicitudes de analítica o telemetría.',
      'Solo las búsquedas enviadas y los enlaces abiertos, incluidos los de las notas, salen de Tabibe. Se usa el buscador predeterminado del navegador salvo que elijas expresamente otro en Tabibe. Tabibe no guarda consultas. Los sitios de destino reciben datos normales de conexión, como tu IP, según sus políticas. Los servicios del navegador se rigen por las políticas de su proveedor.',
    ],
    controlTitle: 'Tus controles',
    controlParagraphs: [
      'Puedes editar o eliminar sitios, carpetas, notas y cuadernos; cambiar o restablecer la apariencia; conceder o revocar permisos opcionales; y exportar o restaurar una copia validada desde Ajustes.',
    ],
    retentionTitle: 'Conservación y eliminación',
    retentionParagraphs: [
      'Eliminar un elemento lo quita del espacio activo. Las copias de deshacer, borradores de recuperación y copias previas a restaurar o restablecer datos pueden conservar contenido anterior localmente. Borrar todo el almacenamiento de Tabibe o desinstalarlo elimina esos datos locales. Los JSON exportados y copias del dispositivo o navegador permanecen hasta que los elimines por separado.',
    ],
    changesTitle: 'Cambios en esta política',
    changesParagraphs: [
      'Los cambios importantes se documentarán con la versión correspondiente de Tabibe y se actualizará la fecha de entrada en vigor.',
    ],
    contactTitle: 'Contacto',
    contactText:
      'Desarrollador: Tercan Keskin. Usa el registro de incidencias para consultas de privacidad. Las incidencias de GitHub son públicas: no adjuntes notas privadas, copias o credenciales. GitHub trata lo que envías voluntariamente según sus políticas y el desarrollador puede leerlo para responder. El sitio público está alojado en GitHub Pages, cuyas políticas también se aplican.',
    contactLink: 'Abrir el registro de incidencias de Tabibe',
    footer: 'Tabibe funciona localmente y mantiene los datos de la extensión bajo tu control.',
    securityTitle: 'Límites del almacenamiento y del servicio',
    limitedTitle: 'Uso limitado (Limited Use)',
    securityParagraphs: [
      'Tabibe no cifra el almacenamiento local ni los JSON exportados. No es una caja fuerte de contraseñas; evita guardar contraseñas, datos de pago u otra información sensible. Protege tu perfil, dispositivo y copias. El desarrollador no tiene copia de tu espacio local y no puede obtenerlo, borrarlo o recuperarlo a distancia.',
      'No se garantiza funcionamiento ininterrumpido, almacenamiento sin pérdidas, recuperación ni soporte continuo. En la medida permitida por la ley, el software se ofrece tal cual, sin garantías adicionales. Se mantienen los derechos obligatorios de los consumidores y las responsabilidades legalmente irrenunciables. Estos límites no reducen los compromisos sobre el uso de datos.',
    ],
    limitedParagraphs: [
      'El uso de datos de Tabibe, incluidos los obtenidos de las API de Chrome, cumple la Chrome Web Store User Data Policy y sus requisitos Limited Use. Los datos sirven solo para las funciones de nueva pestaña descritas. No se venden ni se usan para publicidad, perfiles, decisiones crediticias o fines ajenos. El desarrollador accede al contenido local solo si decides compartirlo para soporte.',
    ],
  },
  pt: {
    languageLabel: 'Idioma',
    pageTitle: 'Política de Privacidade do Tabibe',
    metaDescription:
      'Saiba como o Tabibe armazena dados localmente, usa permissões opcionais e protege sua privacidade.',
    title: 'Política de Privacidade',
    effectiveLabel: 'Data de vigência',
    effectiveDate: '5 de setembro de 2026',
    intro:
      'O Tabibe é uma extensão de nova aba para Chromium criada para funcionar localmente no navegador. Não inclui análise, publicidade, telemetria, contas de usuário ou servidor remoto de aplicação.',
    dataTitle: 'Dados armazenados no dispositivo',
    dataParagraphs: [
      'O Tabibe salva sites e pastas de acesso rápido, notas e cadernos, configurações visuais, imagens de fundo enviadas e preferências em chrome.storage.local. Essas informações permanecem no perfil local do navegador e não são enviadas ao desenvolvedor.',
      'A exportação cria um arquivo JSON no dispositivo. A importação lê somente o arquivo escolhido, valida-o localmente e grava os dados aceitos no armazenamento local da extensão.',
      'Endereços e nomes salvos, notas, etiquetas, datas, identificadores locais e rascunhos de recuperação servem apenas ao espaço da nova guia. Não há sincronização em nuvem. A demonstração usa localStorage no lugar do armazenamento da extensão.',
    ],
    permissionsTitle: 'Permissões do navegador',
    permissionsIntro: 'O Tabibe segue o princípio do menor privilégio:',
    permissionItems: [
      'storage é necessário para salvar os dados da extensão no perfil local do navegador.',
      'search permite enviar pesquisas ao provedor padrão do Chrome pela Chrome Search API sem alterar as configurações do navegador.',
      'favicon é opcional. Ao ativar os ícones dos sites, o Tabibe pode usar o provedor integrado do Chrome para endereços já conhecidos pelo navegador. A permissão pode ser revogada nas Configurações.',
      'system.memory é opcional. Só é solicitado quando o indicador de memória é ativado e pode ser revogado ao desativá-lo.',
    ],
    permissionsClosing:
      'O Tabibe lê a quantidade de guias e janelas para o indicador local, sem permissão tabs nem acesso a endereços, títulos ou histórico. Valores opcionais de memória são exibidos temporariamente, sem armazenamento ou envio ao desenvolvedor. Não lê outras páginas, cookies, senhas ou sensores.',
    networkTitle: 'Atividade de rede',
    networkParagraphs: [
      'Os ícones de marcas são incluídos localmente a partir do Simple Icons. Endereços salvos não são enviados a serviços externos de ícones e o Tabibe não faz solicitações de análise ou telemetria.',
      'Somente pesquisas enviadas e links abertos, inclusive nas notas, saem do Tabibe. A pesquisa usa o provedor padrão do navegador, salvo escolha explícita de outro no Tabibe. O Tabibe não salva consultas. Os sites de destino recebem dados normais de conexão, como seu IP, conforme suas políticas. Os serviços do navegador seguem as políticas do fornecedor.',
    ],
    controlTitle: 'Seus controles',
    controlParagraphs: [
      'Você pode editar ou excluir sites, pastas, notas e cadernos; alterar ou redefinir a aparência; conceder ou revogar permissões opcionais; e exportar ou restaurar um backup validado nas Configurações.',
    ],
    retentionTitle: 'Retenção e exclusão',
    retentionParagraphs: [
      'Excluir um item o remove do espaço ativo. Cópias para desfazer, rascunhos de recuperação e cópias anteriores a restaurações ou redefinições podem reter conteúdo antigo localmente. Limpar todo o armazenamento do Tabibe ou desinstalá-lo remove esses dados locais. Arquivos JSON exportados e backups do dispositivo ou navegador permanecem até serem excluídos separadamente.',
    ],
    changesTitle: 'Alterações nesta política',
    changesParagraphs: [
      'Alterações relevantes serão documentadas com a versão correspondente do Tabibe e a data de vigência será atualizada.',
    ],
    contactTitle: 'Contato',
    contactText:
      'Desenvolvedor: Tercan Keskin. Use o rastreador de problemas para dúvidas de privacidade. Relatos no GitHub são públicos: não anexe notas privadas, backups ou credenciais. O GitHub trata informações enviadas voluntariamente conforme suas políticas, e o desenvolvedor pode lê-las para responder. O site público é hospedado no GitHub Pages, cujas políticas também se aplicam.',
    contactLink: 'Abrir o rastreador de problemas do Tabibe',
    footer: 'O Tabibe funciona localmente e mantém os dados da extensão sob seu controle.',
    securityTitle: 'Limites de armazenamento e serviço',
    limitedTitle: 'Uso limitado (Limited Use)',
    securityParagraphs: [
      'O Tabibe não criptografa o armazenamento local nem os arquivos JSON exportados. Não é um cofre de senhas; evite senhas, dados de pagamento ou outras informações sensíveis. Proteja seu perfil, dispositivo e backups. O desenvolvedor não possui cópia do seu espaço local e não pode acessá-lo, excluí-lo ou recuperá-lo remotamente.',
      'Não há garantia de operação ininterrupta, armazenamento sem perdas, recuperação ou suporte contínuo. Na medida permitida por lei, o software é fornecido como está, sem garantias adicionais. Direitos obrigatórios do consumidor e responsabilidades que não possam ser excluídas por lei permanecem. Esses limites não reduzem os compromissos de uso dos dados.',
    ],
    limitedParagraphs: [
      'O uso de dados pelo Tabibe, incluindo informações das APIs do Chrome, segue a Chrome Web Store User Data Policy e os requisitos Limited Use. Os dados servem apenas às funções de nova guia descritas. Não são vendidos nem usados para publicidade, perfis, decisões de crédito ou fins alheios. O desenvolvedor só acessa conteúdo local se você optar por compartilhá-lo para suporte.',
    ],
  },
  ru: {
    languageLabel: 'Язык',
    pageTitle: 'Политика конфиденциальности Tabibe',
    metaDescription:
      'Узнайте, как Tabibe хранит данные локально, использует необязательные разрешения и защищает конфиденциальность.',
    title: 'Политика конфиденциальности',
    effectiveLabel: 'Дата вступления в силу',
    effectiveDate: '5 сентября 2026 г.',
    intro:
      'Tabibe — расширение новой вкладки Chromium, которое работает локально в браузере. В нем нет аналитики, рекламы, телеметрии, учетных записей или удаленного сервера приложения.',
    dataTitle: 'Данные на вашем устройстве',
    dataParagraphs: [
      'Tabibe хранит сайты и папки быстрого доступа, заметки и блокноты, настройки оформления, загруженные фоновые изображения и предпочтения в chrome.storage.local. Эти сведения остаются в локальном профиле браузера и не передаются разработчику.',
      'Экспорт создает JSON-файл на устройстве. Импорт читает только выбранный файл, проверяет его локально и записывает принятые данные в локальное хранилище расширения.',
      'Сохранённые адреса и имена, тексты заметок, теги, даты, локальные идентификаторы и черновики восстановления используются только для новой вкладки. Облачной синхронизации нет. Демоверсия использует localStorage вместо хранилища расширения.',
    ],
    permissionsTitle: 'Разрешения браузера',
    permissionsIntro: 'Tabibe следует принципу минимальных привилегий:',
    permissionItems: [
      'storage необходимо для сохранения данных расширения в локальном профиле браузера.',
      'search позволяет отправлять запрос через Chrome Search API поисковой системе Chrome по умолчанию, не изменяя настройки браузера.',
      'favicon необязательно. После включения значков Tabibe может использовать встроенный сервис Chrome для адресов, уже известных браузеру. Разрешение можно отозвать в настройках.',
      'system.memory необязательно. Оно запрашивается только при включении индикатора памяти и отзывается при его отключении.',
    ],
    permissionsClosing:
      'Tabibe читает количество вкладок и окон для локального индикатора без разрешения tabs и доступа к адресам, заголовкам или истории. Необязательные значения памяти отображаются временно, не сохраняются и не передаются разработчику. Другие страницы, cookies, пароли и датчики не считываются.',
    networkTitle: 'Сетевая активность',
    networkParagraphs: [
      'Значки брендов локально включены из Simple Icons. Сохраненные адреса не отправляются внешнему сервису значков, а Tabibe не выполняет запросов аналитики или телеметрии.',
      'За пределы Tabibe ведут только отправленные запросы и открытые ссылки, в том числе в заметках. Используется поиск браузера по умолчанию, если вы явно не выбрали другой в Tabibe. Tabibe не сохраняет запросы. Сайты получают обычные данные соединения, например IP-адрес, согласно своим политикам. На службы браузера распространяются политики его поставщика.',
    ],
    controlTitle: 'Ваши возможности управления',
    controlParagraphs: [
      'Можно изменять или удалять сайты, папки, заметки и блокноты; менять или сбрасывать оформление; выдавать или отзывать необязательные разрешения; экспортировать или восстанавливать проверенную резервную копию.',
    ],
    retentionTitle: 'Хранение и удаление',
    retentionParagraphs: [
      'Удаление записи убирает её из активного пространства. Копии отмены, черновики восстановления и снимки перед импортом или сбросом могут сохранять старое содержимое локально. Очистка всего хранилища Tabibe или удаление расширения удаляет эти локальные данные. Экспортированные JSON-файлы и резервные копии устройства или браузера нужно удалять отдельно.',
    ],
    changesTitle: 'Изменения политики',
    changesParagraphs: [
      'Существенные изменения будут документироваться с соответствующим выпуском Tabibe, а дата вступления в силу будет обновляться.',
    ],
    contactTitle: 'Связь',
    contactText:
      'Разработчик: Tercan Keskin. Вопросы о конфиденциальности можно задать в трекере проекта. Обращения GitHub публичны: не прикладывайте личные заметки, копии или учётные данные. Добровольно отправленные сведения обрабатываются GitHub по его политикам и могут читаться разработчиком для ответа. Публичный сайт размещён на GitHub Pages; применяются также его политики.',
    contactLink: 'Открыть список проблем Tabibe',
    footer: 'Tabibe работает локально и оставляет данные расширения под вашим контролем.',
    securityTitle: 'Ограничения хранения и обслуживания',
    limitedTitle: 'Ограниченное использование (Limited Use)',
    securityParagraphs: [
      'Tabibe не шифрует локальное хранилище и экспортированные JSON-файлы. Это не хранилище паролей; избегайте паролей, платёжных и иных чувствительных данных. Защищайте профиль, устройство и копии. У разработчика нет копии вашего локального пространства, и он не может получить, удалить или восстановить его удалённо.',
      'Бесперебойная работа, хранение без потерь, восстановление и постоянная поддержка не гарантируются. В пределах, разрешённых законом, программа предоставляется как есть без дополнительных гарантий. Обязательные права потребителей и ответственность, которую нельзя исключить по закону, сохраняются. Эти ограничения не уменьшают обязательства по использованию данных.',
    ],
    limitedParagraphs: [
      'Использование данных Tabibe, включая сведения из API Chrome, соответствует Chrome Web Store User Data Policy и требованиям Limited Use. Данные служат только описанным функциям новой вкладки. Они не продаются и не используются для рекламы, профилирования, кредитных решений или посторонних целей. Разработчик получает локальное содержимое только если вы решите передать его для поддержки.',
    ],
  },
  ar: {
    languageLabel: 'اللغة',
    pageTitle: 'سياسة خصوصية Tabibe',
    metaDescription:
      'تعرّف على كيفية تخزين Tabibe للبيانات محليًا واستخدام الأذونات الاختيارية وحماية الخصوصية.',
    title: 'سياسة الخصوصية',
    effectiveLabel: 'تاريخ السريان',
    effectiveDate: '5 سبتمبر 2026',
    intro:
      'Tabibe إضافة لصفحة علامة التبويب الجديدة في Chromium، صُممت للعمل محليًا داخل المتصفح. لا تتضمن تحليلات أو إعلانات أو قياسًا عن بُعد أو حسابات مستخدمين أو خادم تطبيق بعيد.',
    dataTitle: 'البيانات المخزنة على جهازك',
    dataParagraphs: [
      'يحفظ Tabibe مواقع ومجلدات الوصول السريع والملاحظات ودفاترها وإعدادات المظهر وصور الخلفية المرفوعة والتفضيلات في chrome.storage.local. تبقى هذه المعلومات في ملف المتصفح المحلي ولا تُرسل إلى المطور.',
      'ينشئ التصدير ملف JSON على جهازك. ولا يقرأ الاستيراد إلا الملف الذي تختاره، ويتحقق منه محليًا، ثم يكتب البيانات المقبولة في التخزين المحلي للإضافة.',
      'تُستخدم العناوين والأسماء المحفوظة ونصوص الملاحظات والوسوم والتواريخ والمعرّفات المحلية ومسودات الاسترداد لمساحة علامة التبويب الجديدة فقط. لا توجد مزامنة سحابية. يستخدم العرض التجريبي localStorage بدلًا من تخزين الإضافة.',
    ],
    permissionsTitle: 'أذونات المتصفح',
    permissionsIntro: 'يتبع Tabibe مبدأ الحد الأدنى من الصلاحيات:',
    permissionItems: [
      'إذن storage مطلوب لحفظ بيانات الإضافة في ملف المتصفح المحلي.',
      'يلزم إذن search لإرسال البحث إلى موفر Chrome الافتراضي عبر Chrome Search API دون تغيير إعدادات البحث في المتصفح.',
      'إذن favicon اختياري. عند تفعيل أيقونات المواقع قد يستخدم Tabibe مزود Chrome المدمج للعناوين التي يعرفها المتصفح. ويمكن سحب الإذن من الإعدادات.',
      'إذن system.memory اختياري. لا يُطلب إلا عند تفعيل مؤشر الذاكرة ويمكن سحبه بتعطيل المؤشر.',
    ],
    permissionsClosing:
      'يقرأ Tabibe عدد علامات التبويب والنوافذ للمؤشر المحلي دون إذن tabs أو الوصول إلى العناوين أو أسماء الصفحات أو سجل التصفح. تُعرض قيم الذاكرة الاختيارية مؤقتًا دون حفظها أو إرسالها إلى المطور. لا يقرأ الصفحات الأخرى أو ملفات تعريف الارتباط أو كلمات المرور أو المستشعرات.',
    networkTitle: 'نشاط الشبكة',
    networkParagraphs: [
      'تُضمّن أيقونات العلامات محليًا من Simple Icons. لا تُرسل العناوين المحفوظة إلى خدمة أيقونات خارجية ولا يجري Tabibe طلبات تحليلات أو قياس عن بُعد.',
      'تنتقل خارج Tabibe فقط عمليات البحث التي ترسلها والروابط التي تفتحها، بما فيها روابط الملاحظات. يُستخدم موفر المتصفح الافتراضي ما لم تختر موفرًا آخر صراحةً داخل Tabibe. لا يحفظ Tabibe الاستعلامات. تتلقى المواقع بيانات الاتصال المعتادة مثل عنوان IP وفق سياساتها. تخضع خدمات المتصفح لسياسات موفره.',
    ],
    controlTitle: 'خيارات التحكم',
    controlParagraphs: [
      'يمكنك تعديل أو حذف المواقع والمجلدات والملاحظات ودفاترها، وتغيير المظهر أو إعادة ضبطه، ومنح الأذونات الاختيارية أو سحبها، وتصدير نسخة احتياطية متحقق منها أو استعادتها من الإعدادات.',
    ],
    retentionTitle: 'الاحتفاظ والحذف',
    retentionParagraphs: [
      'يحذف حذف العنصر ظهوره في مساحة العمل النشطة. قد تحتفظ نسخ التراجع ومسودات الاسترداد والنسخ السابقة للاستعادة أو إعادة الضبط بمحتوى قديم محليًا. يؤدي مسح تخزين Tabibe بالكامل أو إزالة الإضافة إلى إزالة تلك البيانات المحلية. تبقى ملفات JSON المصدّرة ونسخ الجهاز أو المتصفح حتى تحذفها بصورة منفصلة.',
    ],
    changesTitle: 'تغييرات السياسة',
    changesParagraphs: [
      'ستُوثق التغييرات المهمة مع إصدار Tabibe ذي الصلة، وسيُحدّث تاريخ السريان عند تغيير السياسة.',
    ],
    contactTitle: 'التواصل',
    contactText:
      'المطور: Tercan Keskin. استخدم متتبع مشكلات المشروع لأسئلة الخصوصية. بلاغات GitHub علنية؛ لا ترفق ملاحظات خاصة أو نسخًا احتياطية أو بيانات دخول. يعالج GitHub المعلومات المرسلة طوعًا وفق سياساته وقد يقرأها المطور للرد. يُستضاف الموقع العام على GitHub Pages وتسري سياسات الاستضافة أيضًا.',
    contactLink: 'فتح متتبع مشكلات Tabibe',
    footer: 'يعمل Tabibe محليًا ويبقي بيانات الإضافة تحت سيطرتك.',
    securityTitle: 'حدود التخزين والخدمة',
    limitedTitle: 'الاستخدام المحدود (Limited Use)',
    securityParagraphs: [
      'لا يشفّر Tabibe التخزين المحلي أو ملفات JSON المصدّرة. ليس خزنة كلمات مرور؛ تجنب حفظ كلمات المرور أو بيانات الدفع أو المعلومات الحساسة. احمِ ملف المتصفح والجهاز والنسخ الاحتياطية. لا يملك المطور نسخة من مساحة عملك المحلية ولا يمكنه جلبها أو حذفها أو استعادتها عن بُعد.',
      'لا يُضمن التشغيل المتواصل أو الحفظ دون فقدان أو الاسترداد أو الدعم المستمر. يُقدّم البرنامج كما هو، دون ضمانات إضافية، بالقدر الذي يسمح به القانون. تبقى حقوق المستهلك الإلزامية والمسؤوليات التي لا يجوز استبعادها قانونًا سارية. لا تقلل هذه الحدود التزامات استخدام البيانات في هذه السياسة.',
    ],
    limitedParagraphs: [
      'يلتزم استخدام Tabibe للبيانات، بما فيها معلومات واجهات Chrome، بسياسة بيانات المستخدم في Chrome Web Store ومتطلبات Limited Use. تُستخدم البيانات لميزات علامة التبويب الجديدة المعلنة فقط؛ لا تُباع ولا تُستخدم للإعلانات أو التنميط أو قرارات الائتمان أو أغراض غير مرتبطة. لا يصل المطور إلى المحتوى المحلي إلا إذا اخترت مشاركته للدعم.',
    ],
  },
  hi: {
    languageLabel: 'भाषा',
    pageTitle: 'Tabibe गोपनीयता नीति',
    metaDescription:
      'जानें कि Tabibe डेटा को स्थानीय रूप से कैसे रखता है, वैकल्पिक अनुमतियों का उपयोग कैसे करता है और गोपनीयता की रक्षा कैसे करता है।',
    title: 'गोपनीयता नीति',
    effectiveLabel: 'प्रभावी तिथि',
    effectiveDate: '5 सितंबर 2026',
    intro:
      'Tabibe Chromium के लिए नया टैब एक्सटेंशन है जो ब्राउज़र में स्थानीय रूप से काम करता है। इसमें विश्लेषण, विज्ञापन, टेलीमेट्री, उपयोगकर्ता खाते या दूरस्थ एप्लिकेशन सर्वर नहीं हैं।',
    dataTitle: 'आपके डिवाइस पर संग्रहीत डेटा',
    dataParagraphs: [
      'Tabibe त्वरित साइट और फ़ोल्डर, नोट और नोटबुक, दिखावट सेटिंग, अपलोड की गई पृष्ठभूमि और प्राथमिकताएँ chrome.storage.local में रखता है। यह जानकारी स्थानीय ब्राउज़र प्रोफ़ाइल में रहती है और डेवलपर को नहीं भेजी जाती।',
      'निर्यात आपके डिवाइस पर JSON फ़ाइल बनाता है। आयात केवल आपकी चुनी फ़ाइल पढ़ता है, स्थानीय रूप से जाँचता है और स्वीकृत डेटा को एक्सटेंशन के स्थानीय संग्रह में लिखता है।',
      'सहेजे गए पते और नाम, नोट, टैग, समय, स्थानीय पहचानकर्ता और पुनर्प्राप्ति ड्राफ़्ट केवल नई टैब कार्यक्षेत्र के लिए उपयोग होते हैं। क्लाउड सिंक नहीं है। ब्राउज़र डेमो एक्सटेंशन स्टोरेज की जगह localStorage उपयोग करता है।',
    ],
    permissionsTitle: 'ब्राउज़र अनुमतियाँ',
    permissionsIntro: 'Tabibe न्यूनतम अनुमति सिद्धांत का पालन करता है:',
    permissionItems: [
      'storage स्थानीय ब्राउज़र प्रोफ़ाइल में एक्सटेंशन डेटा सहेजने के लिए आवश्यक है।',
      'search अनुमति आपकी खोज को Chrome Search API के ज़रिए Chrome के डिफ़ॉल्ट प्रदाता को भेजती है। यह ब्राउज़र की खोज सेटिंग नहीं बदलती।',
      'favicon वैकल्पिक है। साइट आइकन चालू करने पर Tabibe ब्राउज़र को पहले से ज्ञात पतों के लिए Chrome के अंतर्निहित प्रदाता का उपयोग कर सकता है। इसे सेटिंग में वापस लिया जा सकता है।',
      'system.memory वैकल्पिक है। यह केवल मेमोरी संकेतक चालू करने पर माँगा जाता है और संकेतक बंद करके वापस लिया जा सकता है।',
    ],
    permissionsClosing:
      'Tabibe स्थानीय संकेतक के लिए टैब और विंडो की संख्या पढ़ता है, बिना tabs अनुमति या पते, शीर्षक और इतिहास तक पहुँच के। वैकल्पिक मेमोरी मान अस्थायी रूप से दिखते हैं; सहेजे या डेवलपर को भेजे नहीं जाते। अन्य पेज, कुकी, पासवर्ड और सेंसर नहीं पढ़े जाते।',
    networkTitle: 'नेटवर्क गतिविधि',
    networkParagraphs: [
      'ब्रांड आइकन Simple Icons से स्थानीय रूप से पैक किए जाते हैं। सहेजे गए पते किसी बाहरी आइकन सेवा को नहीं भेजे जाते और Tabibe विश्लेषण या टेलीमेट्री अनुरोध नहीं करता।',
      'केवल भेजी गई खोज और खोले गए लिंक, नोट के लिंक सहित, Tabibe से बाहर जाते हैं। ब्राउज़र का डिफ़ॉल्ट प्रदाता उपयोग होता है, जब तक आप Tabibe में दूसरा प्रदाता स्पष्ट रूप से न चुनें। Tabibe खोज नहीं सहेजता। गंतव्य साइटें अपनी नीतियों के अनुसार IP पते जैसे सामान्य कनेक्शन डेटा प्राप्त करती हैं। ब्राउज़र सेवाओं पर उनके प्रदाता की नीतियाँ लागू होती हैं।',
    ],
    controlTitle: 'आपके नियंत्रण',
    controlParagraphs: [
      'आप साइट, फ़ोल्डर, नोट और नोटबुक संपादित या हटा सकते हैं; दिखावट बदल या रीसेट कर सकते हैं; वैकल्पिक अनुमति दे या वापस ले सकते हैं; और सेटिंग से सत्यापित बैकअप निर्यात या पुनर्स्थापित कर सकते हैं।',
    ],
    retentionTitle: 'डेटा रखना और हटाना',
    retentionParagraphs: [
      'किसी वस्तु को हटाने से वह सक्रिय कार्यक्षेत्र से हटती है। पूर्ववत प्रतियाँ, पुनर्प्राप्ति ड्राफ़्ट और बैकअप बहाली या रीसेट से पहले की प्रतियाँ पुरानी सामग्री स्थानीय रूप से रख सकती हैं। Tabibe का पूरा स्टोरेज साफ़ करने या उसे हटाने से यह स्थानीय डेटा हटता है। निर्यात किए गए JSON और डिवाइस या ब्राउज़र बैकअप अलग से हटाने तक रहते हैं।',
    ],
    changesTitle: 'नीति में बदलाव',
    changesParagraphs: [
      'महत्वपूर्ण बदलाव संबंधित Tabibe रिलीज़ के साथ दर्ज किए जाएँगे और प्रभावी तिथि अपडेट की जाएगी।',
    ],
    contactTitle: 'संपर्क',
    contactText:
      'डेवलपर: Tercan Keskin। गोपनीयता प्रश्नों के लिए प्रोजेक्ट इश्यू ट्रैकर उपयोग करें। GitHub इश्यू सार्वजनिक हैं: निजी नोट, बैकअप या लॉगिन विवरण न जोड़ें। स्वेच्छा से भेजी जानकारी GitHub की नीतियों के अनुसार संसाधित होती है और उत्तर देने के लिए डेवलपर पढ़ सकता है। सार्वजनिक साइट GitHub Pages पर होस्ट है; उसकी नीतियाँ भी लागू हैं।',
    contactLink: 'Tabibe समस्या ट्रैकर खोलें',
    footer: 'Tabibe स्थानीय रूप से काम करता है और एक्सटेंशन डेटा आपके नियंत्रण में रखता है।',
    securityTitle: 'स्टोरेज और सेवा की सीमाएँ',
    limitedTitle: 'सीमित उपयोग (Limited Use)',
    securityParagraphs: [
      'Tabibe स्थानीय स्टोरेज और निर्यात किए गए JSON को एन्क्रिप्ट नहीं करता। यह पासवर्ड वॉल्ट नहीं है; पासवर्ड, भुगतान विवरण या संवेदनशील जानकारी न रखें। प्रोफ़ाइल, डिवाइस और बैकअप सुरक्षित रखें। डेवलपर के पास स्थानीय कार्यक्षेत्र की प्रति नहीं है और वह उसे दूर से प्राप्त, हटा या बहाल नहीं कर सकता।',
      'निर्बाध संचालन, हानि-रहित स्टोरेज, पुनर्प्राप्ति या निरंतर सहायता की गारंटी नहीं दी जाती। कानून द्वारा अनुमत सीमा तक सॉफ़्टवेयर जैसा है वैसा, अतिरिक्त गारंटी के बिना दिया जाता है। अनिवार्य उपभोक्ता अधिकार और कानूनी रूप से न हटाई जा सकने वाली ज़िम्मेदारियाँ बनी रहती हैं। ये सीमाएँ डेटा उपयोग की प्रतिबद्धताओं को कम नहीं करतीं।',
    ],
    limitedParagraphs: [
      'Chrome API की जानकारी सहित Tabibe का डेटा उपयोग Chrome Web Store User Data Policy और Limited Use आवश्यकताओं के अनुरूप है। डेटा केवल बताई गई नई टैब सुविधाओं के लिए है। इसे बेचा नहीं जाता और विज्ञापन, प्रोफ़ाइल, ऋण निर्णय या असंबंधित उद्देश्यों के लिए उपयोग नहीं किया जाता। डेवलपर स्थानीय सामग्री तभी देख सकता है जब आप सहायता के लिए साझा करें।',
    ],
  },
  bn: {
    languageLabel: 'ভাষা',
    pageTitle: 'Tabibe গোপনীয়তা নীতি',
    metaDescription:
      'Tabibe কীভাবে স্থানীয়ভাবে ডেটা রাখে, ঐচ্ছিক অনুমতি ব্যবহার করে এবং গোপনীয়তা রক্ষা করে তা জানুন।',
    title: 'গোপনীয়তা নীতি',
    effectiveLabel: 'কার্যকর তারিখ',
    effectiveDate: '৫ সেপ্টেম্বর ২০২৬',
    intro:
      'Tabibe Chromium-এর জন্য একটি নতুন ট্যাব এক্সটেনশন, যা ব্রাউজারে স্থানীয়ভাবে কাজ করে। এতে বিশ্লেষণ, বিজ্ঞাপন, টেলিমেট্রি, ব্যবহারকারী অ্যাকাউন্ট বা দূরবর্তী অ্যাপ্লিকেশন সার্ভার নেই।',
    dataTitle: 'আপনার ডিভাইসে সংরক্ষিত ডেটা',
    dataParagraphs: [
      'Tabibe দ্রুত প্রবেশের সাইট ও ফোল্ডার, নোট ও নোটবুক, চেহারা সেটিং, আপলোড করা পটভূমি এবং পছন্দ chrome.storage.local-এ রাখে। এই তথ্য স্থানীয় ব্রাউজার প্রোফাইলে থাকে এবং ডেভেলপারের কাছে পাঠানো হয় না।',
      'এক্সপোর্ট আপনার ডিভাইসে একটি JSON ফাইল তৈরি করে। ইমপোর্ট শুধু আপনার নির্বাচিত ফাইল পড়ে, স্থানীয়ভাবে যাচাই করে এবং গৃহীত ডেটা এক্সটেনশনের স্থানীয় স্টোরেজে লেখে।',
      'সংরক্ষিত ঠিকানা ও নাম, নোট, ট্যাগ, সময়, স্থানীয় পরিচয় ও পুনরুদ্ধার খসড়া শুধু নতুন ট্যাবের কাজের জায়গার জন্য ব্যবহৃত হয়। ক্লাউড সিঙ্ক নেই। ব্রাউজার ডেমো এক্সটেনশন স্টোরেজের বদলে localStorage ব্যবহার করে।',
    ],
    permissionsTitle: 'ব্রাউজার অনুমতি',
    permissionsIntro: 'Tabibe সর্বনিম্ন অনুমতির নীতি অনুসরণ করে:',
    permissionItems: [
      'storage স্থানীয় ব্রাউজার প্রোফাইলে এক্সটেনশন ডেটা সংরক্ষণের জন্য প্রয়োজন।',
      'search অনুমতি Chrome Search API দিয়ে Chrome-এর ডিফল্ট প্রদানকারীর কাছে অনুসন্ধান পাঠায়। এটি ব্রাউজারের অনুসন্ধান সেটিংস বদলায় না।',
      'favicon ঐচ্ছিক। সাইট আইকন চালু করলে Tabibe ব্রাউজারের পরিচিত ঠিকানার জন্য Chrome-এর অন্তর্নির্মিত প্রদানকারী ব্যবহার করতে পারে। সেটিংস থেকে অনুমতি প্রত্যাহার করা যায়।',
      'system.memory ঐচ্ছিক। মেমোরি সূচক চালু করলেই এটি চাওয়া হয় এবং সূচক বন্ধ করে প্রত্যাহার করা যায়।',
    ],
    permissionsClosing:
      'Tabibe স্থানীয় সূচকের জন্য ট্যাব ও উইন্ডোর সংখ্যা পড়ে, tabs অনুমতি বা ঠিকানা, শিরোনাম ও ইতিহাসে প্রবেশ ছাড়াই। ঐচ্ছিক মেমরি মান সাময়িকভাবে দেখানো হয়, সংরক্ষণ বা ডেভেলপারকে পাঠানো হয় না। অন্য পৃষ্ঠা, কুকি, পাসওয়ার্ড বা সেন্সর পড়া হয় না।',
    networkTitle: 'নেটওয়ার্ক কার্যকলাপ',
    networkParagraphs: [
      'ব্র্যান্ড আইকন Simple Icons থেকে স্থানীয়ভাবে প্যাক করা হয়। সংরক্ষিত ঠিকানা বাইরের আইকন সেবায় পাঠানো হয় না এবং Tabibe বিশ্লেষণ বা টেলিমেট্রি অনুরোধ করে না।',
      'শুধু পাঠানো অনুসন্ধান ও খোলা লিংক, নোটের লিংকসহ, Tabibe-এর বাইরে যায়। আপনি Tabibe-এ স্পষ্টভাবে অন্য প্রদানকারী না বাছলে ব্রাউজারের ডিফল্ট ব্যবহার হয়। Tabibe অনুসন্ধান সংরক্ষণ করে না। গন্তব্য সাইট নিজস্ব নীতি অনুযায়ী IP ঠিকানার মতো সাধারণ সংযোগ তথ্য পায়। ব্রাউজার সেবায় তার প্রদানকারীর নীতি প্রযোজ্য।',
    ],
    controlTitle: 'আপনার নিয়ন্ত্রণ',
    controlParagraphs: [
      'আপনি সাইট, ফোল্ডার, নোট ও নোটবুক সম্পাদনা বা মুছতে; চেহারা বদলাতে বা রিসেট করতে; ঐচ্ছিক অনুমতি দিতে বা প্রত্যাহার করতে; এবং সেটিংস থেকে যাচাইকৃত ব্যাকআপ এক্সপোর্ট বা পুনরুদ্ধার করতে পারেন।',
    ],
    retentionTitle: 'সংরক্ষণ ও মুছে ফেলা',
    retentionParagraphs: [
      'একটি আইটেম মুছলে তা সক্রিয় কাজের জায়গা থেকে সরে যায়। পূর্বাবস্থার কপি, পুনরুদ্ধার খসড়া এবং ব্যাকআপ ফেরানো বা রিসেটের আগের কপিতে পুরোনো বিষয়বস্তু স্থানীয়ভাবে থাকতে পারে। Tabibe-এর সম্পূর্ণ স্টোরেজ খালি করলে বা এক্সটেনশন সরালে সেই স্থানীয় তথ্য মুছে যায়। রপ্তানি করা JSON ও ডিভাইস বা ব্রাউজার ব্যাকআপ আলাদা করে না মোছা পর্যন্ত থাকে।',
    ],
    changesTitle: 'নীতির পরিবর্তন',
    changesParagraphs: [
      'গুরুত্বপূর্ণ পরিবর্তন সংশ্লিষ্ট Tabibe রিলিজের সঙ্গে নথিভুক্ত হবে এবং কার্যকর তারিখ হালনাগাদ করা হবে।',
    ],
    contactTitle: 'যোগাযোগ',
    contactText:
      'ডেভেলপার: Tercan Keskin। গোপনীয়তার প্রশ্নে প্রকল্পের ইস্যু ট্র্যাকার ব্যবহার করুন। GitHub ইস্যু সবার জন্য উন্মুক্ত: ব্যক্তিগত নোট, ব্যাকআপ বা লগইন তথ্য দেবেন না। স্বেচ্ছায় পাঠানো তথ্য GitHub-এর নীতি অনুযায়ী প্রক্রিয়াকৃত হয় এবং উত্তর দিতে ডেভেলপার পড়তে পারেন। প্রকাশ্য সাইট GitHub Pages-এ হোস্ট করা; তার নীতিও প্রযোজ্য।',
    contactLink: 'Tabibe সমস্যা ট্র্যাকার খুলুন',
    footer: 'Tabibe স্থানীয়ভাবে কাজ করে এবং এক্সটেনশন ডেটা আপনার নিয়ন্ত্রণে রাখে।',
    securityTitle: 'স্টোরেজ ও সেবার সীমা',
    limitedTitle: 'সীমিত ব্যবহার (Limited Use)',
    securityParagraphs: [
      'Tabibe স্থানীয় স্টোরেজ বা রপ্তানি করা JSON এনক্রিপ্ট করে না। এটি পাসওয়ার্ড ভল্ট নয়; পাসওয়ার্ড, পেমেন্টের তথ্য বা সংবেদনশীল তথ্য রাখবেন না। প্রোফাইল, ডিভাইস ও ব্যাকআপ সুরক্ষিত রাখুন। ডেভেলপারের কাছে স্থানীয় কাজের জায়গার কপি নেই এবং তিনি দূর থেকে তা আনতে, মুছতে বা ফেরাতে পারেন না।',
      'নিরবচ্ছিন্ন কাজ, ক্ষতিহীন সংরক্ষণ, পুনরুদ্ধার বা চলমান সহায়তার নিশ্চয়তা নেই। আইন যতটা অনুমতি দেয়, সফটওয়্যার অতিরিক্ত নিশ্চয়তা ছাড়া যেমন আছে তেমন দেওয়া হয়। বাধ্যতামূলক ভোক্তা অধিকার ও আইনত বাদ দেওয়া যায় না এমন দায় বহাল থাকে। এই সীমা তথ্য ব্যবহারের প্রতিশ্রুতি কমায় না।',
    ],
    limitedParagraphs: [
      'Chrome API-এর তথ্যসহ Tabibe-এর তথ্য ব্যবহার Chrome Web Store User Data Policy ও Limited Use শর্ত মেনে চলে। তথ্য শুধু ঘোষিত নতুন ট্যাব বৈশিষ্ট্যের জন্য। তা বিক্রি হয় না এবং বিজ্ঞাপন, প্রোফাইল তৈরি, ঋণ সিদ্ধান্ত বা অন্য উদ্দেশ্যে ব্যবহৃত হয় না। সহায়তার জন্য আপনি শেয়ার করলেই ডেভেলপার স্থানীয় বিষয়বস্তু দেখতে পারেন।',
    ],
  },
  zh: {
    languageLabel: '语言',
    pageTitle: 'Tabibe 隐私政策',
    metaDescription: '了解 Tabibe 如何在本地存储数据、使用可选权限并保护用户隐私。',
    title: '隐私政策',
    effectiveLabel: '生效日期',
    effectiveDate: '2026年9月5日',
    intro:
      'Tabibe 是一款在浏览器本地运行的 Chromium 新标签页扩展。它不包含分析、广告、遥测、用户账户或远程应用服务器。',
    dataTitle: '存储在设备上的数据',
    dataParagraphs: [
      'Tabibe 将快速访问网站和文件夹、笔记和笔记本、外观设置、上传的背景图片及功能偏好保存在 chrome.storage.local 中。这些信息留在本地浏览器配置中，不会发送给开发者。',
      '导出功能会在设备上创建 JSON 文件。导入功能只读取您选择的文件，在本地验证后将接受的数据写入扩展的本地存储。',
      '已保存的网址和名称、笔记文本、标签、时间、本地记录标识符及恢复草稿仅用于新标签页工作区。Tabibe 不提供云同步。浏览器演示使用 localStorage 而非扩展存储。',
    ],
    permissionsTitle: '浏览器权限',
    permissionsIntro: 'Tabibe 遵循最小权限原则：',
    permissionItems: [
      'storage 用于在本地浏览器配置中保存扩展数据，是必需权限。',
      'search 权限用于通过 Chrome Search API 将您提交的搜索发送到 Chrome 默认搜索服务，不更改浏览器搜索设置。',
      'favicon 是可选权限。启用网站图标后，Tabibe 可对浏览器已知的地址使用 Chrome 内置图标提供器。您可以在设置中撤销该权限。',
      'system.memory 是可选权限。仅在启用内存指示器时请求，关闭指示器即可撤销。',
    ],
    permissionsClosing:
      'Tabibe 无需 tabs 权限即可读取标签页和窗口数量用于本地显示，不读取标签页网址、标题或浏览历史。可选内存数据仅临时显示，不保存或发送给开发者。不读取其他页面、Cookie、密码或设备传感器。',
    networkTitle: '网络活动',
    networkParagraphs: [
      '品牌图标由 Simple Icons 本地打包。保存的网站地址不会发送到外部图标服务，Tabibe 也不会发出分析或遥测请求。',
      '只有您提交的搜索及打开的链接（包括笔记中的链接）才会离开 Tabibe。除非您在 Tabibe 中明确选择其他服务，否则使用浏览器默认搜索服务。Tabibe 不保存搜索词。目标网站根据自身政策接收 IP 地址等常规连接数据。浏览器服务遵循浏览器提供商的政策。',
    ],
    controlTitle: '您的控制权',
    controlParagraphs: [
      '您可以编辑或删除网站、文件夹、笔记和笔记本；更改或重置外观；授予或撤销可选权限；并在设置中导出或恢复经过验证的备份。',
    ],
    retentionTitle: '保留与删除',
    retentionParagraphs: [
      '删除项目会将其从当前工作区移除。撤销副本、恢复草稿及恢复备份或重置前的快照可能在本地保留旧内容。清空 Tabibe 的全部扩展存储或卸载扩展会移除这些本地数据。导出的 JSON 文件和设备或浏览器备份需另行删除。',
    ],
    changesTitle: '政策变更',
    changesParagraphs: ['重大变更会随相关 Tabibe 版本记录，政策变更时将更新生效日期。'],
    contactTitle: '联系',
    contactText:
      '开发者：Tercan Keskin。隐私问题可通过项目问题追踪器提出。GitHub 问题公开可见，请勿附上私人笔记、备份或凭据。您自愿提交的信息由 GitHub 按其政策处理，开发者可阅读以回复。公开网站托管于 GitHub Pages，其托管政策也适用。',
    contactLink: '打开 Tabibe 问题跟踪器',
    footer: 'Tabibe 在本地运行，扩展数据始终由您控制。',
    securityTitle: '存储和服务限制',
    limitedTitle: '有限使用（Limited Use）',
    securityParagraphs: [
      'Tabibe 不加密本地存储或导出的 JSON 文件。它不是密码保险库，请避免保存密码、支付详情或其他敏感信息。请保护浏览器配置、设备和备份。开发者没有本地工作区的副本，无法远程获取、删除或恢复它。',
      '不保证服务不中断、存储无损、数据恢复或持续支持。在适用法律允许范围内，软件按现状提供，不附加额外保证。法定消费者权利和依法不可免除的责任不受影响。这些限制不会减轻本政策中的数据使用承诺。',
    ],
    limitedParagraphs: [
      'Tabibe 对用户数据（包括 Chrome API 信息）的使用遵循 Chrome Web Store 用户数据政策及 Limited Use 要求。数据仅用于已说明的新标签页功能，不出售或用于广告、画像、信用决策及无关目的。只有您选择为支持而分享时，开发者才能获取本地内容。',
    ],
  },
  ja: {
    languageLabel: '言語',
    pageTitle: 'Tabibe プライバシーポリシー',
    metaDescription:
      'Tabibe がデータをローカルに保存し、任意の権限を使用してプライバシーを保護する方法をご確認ください。',
    title: 'プライバシーポリシー',
    effectiveLabel: '発効日',
    effectiveDate: '2026年9月5日',
    intro:
      'Tabibe はブラウザー内でローカルに動作する Chromium 用の新しいタブ拡張機能です。分析、広告、テレメトリー、ユーザーアカウント、リモートアプリケーションサーバーは含まれません。',
    dataTitle: '端末に保存されるデータ',
    dataParagraphs: [
      'Tabibe はクイックアクセスのサイトとフォルダー、メモとノートブック、外観設定、アップロードした背景画像、機能設定を chrome.storage.local に保存します。これらはローカルのブラウザープロファイルに留まり、開発者へ送信されません。',
      'エクスポートは端末上に JSON ファイルを作成します。インポートは選択したファイルだけを読み取り、ローカルで検証して、受理したデータを拡張機能のローカルストレージへ書き込みます。',
      '保存したURLや名前、メモ本文、タグ、日時、ローカルの記録ID、復元用下書きは新しいタブの作業領域にのみ使用します。クラウド同期はありません。ブラウザーデモは拡張機能ストレージの代わりに localStorage を使用します。',
    ],
    permissionsTitle: 'ブラウザー権限',
    permissionsIntro: 'Tabibe は最小権限の原則に従います。',
    permissionItems: [
      'storage はローカルのブラウザープロファイルに拡張機能データを保存するために必要です。',
      'search 権限は、送信した検索を Chrome Search API で Chrome の既定の検索プロバイダーに渡すために必要です。ブラウザーの検索設定は変更しません。',
      'favicon は任意です。サイトアイコンを有効にすると、Tabibe はブラウザーが既に認識しているアドレスに Chrome 内蔵のプロバイダーを使用できます。設定から権限を取り消せます。',
      'system.memory は任意です。メモリ表示を有効にした場合のみ要求され、表示を無効にすると取り消せます。',
    ],
    permissionsClosing:
      'Tabibe は tabs 権限なしでタブとウィンドウの数を読み取り、ローカルに表示します。タブのURL、タイトル、閲覧履歴にはアクセスしません。任意のメモリ値は一時的に表示するだけで、保存や開発者への送信は行いません。他のページ、Cookie、パスワード、センサーは読み取りません。',
    networkTitle: 'ネットワーク通信',
    networkParagraphs: [
      'ブランドアイコンは Simple Icons からローカルに同梱されます。保存したサイトアドレスを外部のアイコンサービスへ送信せず、分析やテレメトリーの通信も行いません。',
      '送信した検索と開いたリンク（メモ内のリンクを含む）のみが Tabibe の外部へ移動します。Tabibe で明示的に別のプロバイダーを選ばない限り、ブラウザーの既定の検索を使用します。Tabibe は検索語を保存しません。移動先サイトは独自のポリシーに従ってIPアドレスなど通常の接続情報を受け取ります。ブラウザーサービスには提供元のポリシーが適用されます。',
    ],
    controlTitle: '利用者による管理',
    controlParagraphs: [
      'サイト、フォルダー、メモ、ノートブックの編集や削除、外観の変更やリセット、任意権限の付与や取り消し、設定から検証済みバックアップのエクスポートや復元ができます。',
    ],
    retentionTitle: '保持と削除',
    retentionParagraphs: [
      '項目を削除すると使用中の作業領域から取り除かれます。取り消し用コピー、復元用下書き、バックアップ復元やリセット前のスナップショットには古い内容が残る場合があります。Tabibe の拡張機能ストレージをすべて消去するかアンインストールすると、これらのローカルデータは削除されます。エクスポートしたJSONや端末・ブラウザーのバックアップは別途削除してください。',
    ],
    changesTitle: 'ポリシーの変更',
    changesParagraphs: [
      '重要な変更は関連する Tabibe リリースとともに記録され、変更時には発効日が更新されます。',
    ],
    contactTitle: 'お問い合わせ',
    contactText:
      '開発者：Tercan Keskin。プライバシーの質問はプロジェクトの課題管理に送信できます。GitHub の課題は公開されるため、私的なメモ、バックアップ、認証情報を添付しないでください。任意に送信した情報は GitHub のポリシーで処理され、開発者が回答のために読む場合があります。公開サイトは GitHub Pages でホストされ、そのポリシーも適用されます。',
    contactLink: 'Tabibe の問題トラッカーを開く',
    footer: 'Tabibe はローカルで動作し、拡張機能データを利用者の管理下に保ちます。',
    securityTitle: '保存とサービスの制限',
    limitedTitle: '利用制限（Limited Use）',
    securityParagraphs: [
      'Tabibe はローカルストレージやエクスポートしたJSONを暗号化しません。パスワード保管庫ではないため、パスワード、決済情報、その他の機密情報を保存しないでください。プロファイル、端末、バックアップを保護してください。開発者は作業領域のコピーを持たず、遠隔で取得、削除、復元できません。',
      '中断のない動作、損失のない保存、復元、継続的なサポートは保証しません。適用法で認められる範囲で、ソフトウェアは追加保証なく現状のまま提供します。強行法規による消費者の権利や免除できない責任は影響を受けません。この制限はデータ利用の約束を弱めるものではありません。',
    ],
    limitedParagraphs: [
      'Chrome API の情報を含む Tabibe のユーザーデータ利用は、Chrome Web Store User Data Policy と Limited Use 要件に従います。データは説明した新しいタブ機能のみに使用し、販売、広告、プロファイリング、信用判断、無関係な目的には使用しません。開発者がローカル内容を受け取るのは、利用者がサポートのために共有する場合のみです。',
    ],
  },
};

function resolveLocale() {
  const requestedLocale = new URLSearchParams(window.location.search).get('lang');
  return SUPPORTED_LOCALES.includes(requestedLocale) ? requestedLocale : 'en';
}

function setText(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = value;
}

function renderParagraphs(elementId, paragraphs) {
  const container = document.getElementById(elementId);
  if (!container) return;
  const elements = paragraphs.map((paragraph) => {
    const element = document.createElement('p');
    element.textContent = paragraph;
    return element;
  });
  container.replaceChildren(...elements);
}

function renderList(elementId, items) {
  const list = document.getElementById(elementId);
  if (!list) return;
  const elements = items.map((item) => {
    const element = document.createElement('li');
    element.textContent = item;
    return element;
  });
  list.replaceChildren(...elements);
}

function renderPrivacyPolicy(locale) {
  const copy = PRIVACY_TRANSLATIONS[locale] || PRIVACY_TRANSLATIONS.en;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.title = copy.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', copy.metaDescription);

  setText('privacy-language-label', copy.languageLabel);
  setText('privacy-title', copy.title);
  setText('privacy-effective-label', copy.effectiveLabel);
  setText('privacy-effective-date', copy.effectiveDate);
  setText('privacy-intro', copy.intro);
  setText('privacy-data-title', copy.dataTitle);
  renderParagraphs('privacy-data-content', copy.dataParagraphs);
  setText('privacy-permissions-title', copy.permissionsTitle);
  setText('privacy-permissions-intro', copy.permissionsIntro);
  renderList('privacy-permissions-list', copy.permissionItems);
  setText('privacy-permissions-closing', copy.permissionsClosing);
  setText('privacy-network-title', copy.networkTitle);
  renderParagraphs('privacy-network-content', copy.networkParagraphs);
  setText('privacy-control-title', copy.controlTitle);
  renderParagraphs('privacy-control-content', copy.controlParagraphs);
  setText('privacy-retention-title', copy.retentionTitle);
  renderParagraphs('privacy-retention-content', copy.retentionParagraphs);
  setText('privacy-security-title', copy.securityTitle);
  renderParagraphs('privacy-security-content', copy.securityParagraphs);
  setText('privacy-limited-title', copy.limitedTitle);
  renderParagraphs('privacy-limited-content', copy.limitedParagraphs);
  setText('privacy-changes-title', copy.changesTitle);
  renderParagraphs('privacy-changes-content', copy.changesParagraphs);
  setText('privacy-contact-title', copy.contactTitle);
  setText('privacy-contact-text', copy.contactText);
  setText('privacy-contact-link', copy.contactLink);
  setText('privacy-footer-text', copy.footer);

  const languageSelect = document.getElementById('privacy-language');
  if (languageSelect) languageSelect.value = locale;
}

function handleLanguageChange(event) {
  const locale = SUPPORTED_LOCALES.includes(event.target.value) ? event.target.value : 'en';
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.history.replaceState(null, '', url);
  renderPrivacyPolicy(locale);
}

document.getElementById('privacy-language')?.addEventListener('change', handleLanguageChange);
renderPrivacyPolicy(resolveLocale());
