# Gastrokniff (gastrokniff.de)

Sito statico HTML/CSS/JS (nessun framework, nessun build step) con calcolatori gratuiti e articoli per ristoratori tedeschi (Gastronomen). Pubblicato su Netlify.

## Pubblico e lingua

- Tutti i testi sono in **tedesco semplice e diretto**: molti utenti non sono madrelingua tedeschi.
- Frasi corte, parole comuni, niente gergo aziendale/consulenziale non necessario.
- Termini tecnici (Deckungsbeitrag, Wareneinsatz, Kalkulation...) vanno bene se sono il vocabolario standard del settore gastronomico — ma vanno sempre spiegati al primo utilizzo in un articolo.

## Struttura degli articoli

Ogni articolo segue lo schema "cosa fare / cosa evitare": un box verde con quello che il lettore dovrebbe fare (✓ `.box.tun` — "Das solltest du tun") e un box rosso/arancio con quello da evitare (✗ `.box.weg` — "Das solltest du vermeiden"). Vedi `artikel-*.html` per il pattern CSS/HTML esistente da riusare, non reinventare la struttura.

## Tono

- Onesto e diretto, mai da marketing gonfiato.
- Niente promesse esagerate o irrealistiche ("garantiert", "sofort reich", "in 5 Minuten zum Erfolg" e simili sono da evitare).
- Va bene essere schietti sui limiti di un calcolatore o di un consiglio (es. "das ersetzt keine Steuerberatung").

## Privacy

- Privacy massima: nessun tracking non necessario, nessuna raccolta dati non dichiarata.
- I calcolatori girano lato client (nel browser) quando possibile — non inviare dati dei calcoli a server esterni senza motivo.
- Qualsiasi nuova raccolta dati (form, analytics, cookie) va dichiarata in `datenschutz.html` e va scelta l'opzione meno invasiva disponibile.

## Convenzioni tecniche osservate nel repo

- Una pagina = un file HTML autonomo, CSS inline in `<style>` nell'`<head>`, nessuna dipendenza da build tool.
- Palette condivisa via CSS custom properties (`--paper`, `--ink`, `--stone`, `--accent`, `--good`, `--warn`, `--line`, `--card`...) — riusare gli stessi valori tra le pagine invece di introdurne di nuovi.
- Font: Bricolage Grotesque (titoli), Inter (testo), JetBrains Mono (tag/label monospazio).
- Naming file: `index.html` (home), `rechner.html` (hub calcolatori), `*-rechner.html` (singoli calcolatori), `artikel-*.html` (articoli), `impressum.html` / `datenschutz.html` (pagine legali).
