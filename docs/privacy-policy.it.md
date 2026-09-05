# Informativa sulla privacy di Tabibe

[English](privacy-policy.md) | [Türkçe](privacy-policy.tr.md) | [Français](privacy-policy.fr.md) | [Deutsch](privacy-policy.de.md) | Italiano

**Data di entrata in vigore:** 5 settembre 2026

Tabibe è un’estensione per la nuova scheda di Chromium progettata per funzionare localmente nel browser. Non include analisi, pubblicità, telemetria, account utente o un backend remoto dell’applicazione.

## Dati archiviati sul dispositivo

Tabibe archivia siti e cartelle di accesso rapido, note e taccuini, impostazioni dell’aspetto, immagini di sfondo caricate e preferenze delle funzionalità in chrome.storage.local. Queste informazioni restano nel profilo locale del browser e non vengono trasmesse allo sviluppatore.

L’esportazione di un backup crea un file JSON sul dispositivo. L’importazione legge solo il file selezionato, lo convalida localmente e scrive i dati accettati nell’archivio locale dell’estensione.

Indirizzi e nomi salvati, testi delle note, tag, date, identificatori locali e bozze di recupero servono solo allo spazio della nuova scheda. Tabibe non offre sincronizzazione cloud. La demo nel browser usa localStorage al posto dell’archiviazione dell’estensione.

## Autorizzazioni del browser

Tabibe applica il principio del privilegio minimo:

- storage è necessario per salvare i dati dell’estensione nel profilo locale del browser.
- search è necessario per inviare le ricerche al motore predefinito di Chrome tramite Chrome Search API, senza modificare le impostazioni di ricerca del browser.
- favicon è facoltativo. Quando attivi le icone dei siti, Tabibe può usare il provider di favicon integrato di Chrome per gli indirizzi già noti al browser. Puoi revocare questa autorizzazione dalle Impostazioni.
- system.memory è facoltativo. Viene richiesto solo quando attivi l’indicatore della memoria e può essere revocato disattivando l’indicatore.

Tabibe legge il numero di schede e finestre per l’indicatore locale, senza autorizzazione tabs né accesso a indirizzi, titoli o cronologia. I valori facoltativi della memoria sono mostrati temporaneamente, senza essere salvati o inviati allo sviluppatore. Non legge altre pagine, cookie, password o sensori del dispositivo.

## Attività di rete

Le icone dei marchi di Simple Icons sono incluse localmente. Gli indirizzi dei siti salvati non vengono inviati a un servizio di icone esterno e Tabibe non effettua richieste di analisi o telemetria.

Solo le ricerche inviate e i link aperti, anche nelle note, portano fuori da Tabibe. Viene usato il motore predefinito del browser, salvo scelta esplicita di un altro in Tabibe. Tabibe non salva le ricerche. I siti di destinazione ricevono i normali dati di connessione, come l’indirizzo IP, secondo le proprie informative. Ai servizi del browser si applicano le politiche del relativo fornitore.

## I tuoi controlli

Puoi modificare o eliminare siti, cartelle, note e taccuini; cambiare o reimpostare le preferenze dell’aspetto; concedere o revocare le autorizzazioni facoltative; ed esportare o ripristinare un backup convalidato dalle Impostazioni.

## Conservazione ed eliminazione

Eliminare un elemento lo rimuove dallo spazio attivo. Copie di annullamento, bozze di recupero e istantanee precedenti a ripristini o reimpostazioni possono conservare vecchi contenuti localmente. Svuotare tutta l’archiviazione di Tabibe o disinstallarlo elimina questi dati locali. I file JSON esportati e i backup del dispositivo o browser restano fino all’eliminazione separata.

## Limiti di archiviazione e servizio

Tabibe non cifra l’archiviazione locale né i file JSON esportati. Non è un gestore di password: evita password, dati di pagamento e altre informazioni sensibili. Proteggi profilo, dispositivo e backup. Lo sviluppatore non possiede una copia dello spazio locale e non può recuperarlo, eliminarlo o ripristinarlo da remoto.

Non si garantiscono funzionamento ininterrotto, archiviazione senza perdite, recupero o assistenza continuativa. Nei limiti consentiti dalla legge, il software è fornito così com’è, senza ulteriori garanzie. Restano salvi i diritti inderogabili dei consumatori e le responsabilità non escludibili per legge. Questi limiti non riducono gli impegni sull’uso dei dati.

## Uso limitato (Limited Use)

L’uso dei dati da parte di Tabibe, incluse le informazioni delle API Chrome, rispetta la Chrome Web Store User Data Policy e i requisiti Limited Use. I dati servono solo alle funzioni della nuova scheda descritte. Non sono venduti né usati per pubblicità, profilazione, valutazioni creditizie o scopi estranei. Lo sviluppatore accede ai contenuti locali solo se scegli di condividerli per assistenza.

## Modifiche a questa informativa

Le modifiche sostanziali a questa informativa saranno documentate con la relativa versione di Tabibe. La data di entrata in vigore verrà aggiornata quando l’informativa cambia.

## Contatti

Sviluppatore: Tercan Keskin. Per domande sulla privacy usa il tracker del progetto. Le segnalazioni GitHub sono pubbliche: non allegare note private, backup o credenziali. I dati inviati volontariamente sono trattati da GitHub secondo le sue politiche e possono essere letti dallo sviluppatore per rispondere. Il sito pubblico è ospitato da GitHub Pages, le cui politiche si applicano a sua volta.

[Apri il registro dei problemi di Tabibe](https://github.com/tercan/tabibe/issues)

[Italiano](https://tercan.github.io/tabibe/privacy/?lang=it)
