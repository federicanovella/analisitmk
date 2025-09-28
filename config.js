// ============================================
// CONFIGURAZIONE GOOGLE SHEETS SYNC
// ============================================

// ⚠️ IMPORTANTE: Sostituisci questi valori con i tuoi
const GOOGLE_SHEETS_CONFIG = {
    // La tua API Key di Google Sheets (istruzioni sotto)
    API_KEY: 'AIzaSyAdQr8GTshHJzCZ5sVjKU_WiuCPyXi9lqA',

    // ID del tuo foglio Google Sheets (lo trovi nell'URL)
    SPREADSHEET_ID: '143C8cSljgwMnY7R6fnGInco0SoXXyDaXKi4X-UJjo08',

    // Nome del foglio (tab) dove salvare i dati
    SHEET_NAME: 'TelemarketingData',

    // Range dove scrivere i dati (A1:Z100 copre tutto)
    RANGE: 'A1:Z100'
};

// ============================================
// IMPOSTAZIONI AVANZATE (non modificare)
// ============================================
const SYNC_CONFIG = {
    // Intervallo di sincronizzazione automatica (in millisecondi)
    AUTO_SYNC_INTERVAL: 30000, // 30 secondi

    // Timeout per le richieste API (in millisecondi) 
    API_TIMEOUT: 10000, // 10 secondi

    // Numero massimo di tentativi in caso di errore
    MAX_RETRIES: 3,

    // Delay tra i tentativi (in millisecondi)
    RETRY_DELAY: 2000 // 2 secondi
};

// ============================================
// STRUTTURA DATI GOOGLE SHEETS
// ============================================
const SHEETS_STRUCTURE = {
    headers: [
        'Mese',
        'ChiamatePartite', 
        'NonRisponde',
        'NonInteressato', 
        'NumeroErrato',
        'AppuntamentiFissati',
        'OreLavorate',
        'CostoOrario', 
        'AppuntamentiPercorsi',
        'AmministratoriPotenziali',
        'PotenzialePDR',
        'PotenzialePOD',
        'LastUpdated'
    ]
};

// Export delle configurazioni (per uso nei moduli)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GOOGLE_SHEETS_CONFIG,
        SYNC_CONFIG, 
        SHEETS_STRUCTURE
    };
}

// ============================================
// 📋 ISTRUZIONI PER CONFIGURARE L'API
// ============================================

/*

🔧 SETUP GOOGLE SHEETS API - PASSO PASSO:

1. VAI SU GOOGLE CLOUD CONSOLE:
   https://console.cloud.google.com/

2. CREA UN PROGETTO (se non ne hai uno):
   • Clicca "Nuovo Progetto"
   • Nome: "Cruscotto Telemarketing"
   • Clicca "Crea"

3. ABILITA GOOGLE SHEETS API:
   • Vai su "API e Servizi" > "Libreria"
   • Cerca "Google Sheets API"
   • Clicca "Abilita"

4. CREA UNA API KEY:
   • Vai su "Credenziali"
   • Clicca "Crea credenziali" > "Chiave API"
   • Copia la chiave generata
   • INCOLLA QUI SOPRA in API_KEY

5. CREA IL FOGLIO GOOGLE SHEETS:
   • Vai su sheets.google.com
   • Clicca "Nuovo foglio"
   • Rinomina il foglio in "TelemarketingData"
   • Dall'URL copia l'ID: 
     https://docs.google.com/spreadsheets/d/[QUESTO_È_L_ID]/edit
   • INCOLLA QUI SOPRA in SPREADSHEET_ID

6. RENDI PUBBLICO IL FOGLIO:
   • Nel foglio Google Sheets clicca "Condividi"
   • In "Ottieni link" seleziona "Chiunque con il link può visualizzare"
   • Clicca "Copia link" (NON serve il link, solo renderlo pubblico)

7. TESTA LA CONFIGURAZIONE:
   • Apri il cruscotto
   • Se vedi "🟢 Connected" sei a posto!
   • Se vedi errori, controlla API Key e Spreadsheet ID

🎯 RISULTATO: 
Il cruscotto si sincronizza automaticamente con Google Sheets!
Puoi accedere da qualsiasi dispositivo e i dati sono sempre aggiornati.

⚠️ SICUREZZA:
• La API Key è pubblica ma limitata solo ai fogli pubblici
• I tuoi dati sono sicuri su Google Sheets 
• Solo chi ha il link al cruscotto può vedere i dati

*/