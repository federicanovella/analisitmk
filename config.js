// ============================================
// CONFIGURAZIONE GOOGLE SHEETS SYNC v3.0
// ============================================

// ⚠️ IMPORTANTE: Sostituisci questi valori con i tuoi
const GOOGLE_SHEETS_CONFIG = {
    // La tua API Key di Google Sheets (istruzioni sotto)
    API_KEY: 'AIzaSyAr8PB5v3s1H6xLo-UoMLgflOIztCGteaw',

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

// ============================================
// 📋 ISTRUZIONI SETUP GOOGLE SHEETS API
// ============================================

/*

🚀 SETUP RAPIDO (5 MINUTI):

1️⃣ GOOGLE CLOUD CONSOLE:
   • Vai su: https://console.cloud.google.com/
   • Crea progetto "Cruscotto Telemarketing"
   • Abilita "Google Sheets API" 
   • Crea "API Key"
   • COPIA la chiave e SOSTITUISCI sopra

2️⃣ GOOGLE SHEETS:
   • Vai su: https://sheets.google.com
   • Crea nuovo foglio
   • Rinomina in "TelemarketingData"
   • COPIA l'ID dall'URL e SOSTITUISCI sopra
   • Rendi pubblico: Condividi > "Chiunque con link può visualizzare"

3️⃣ TEST:
   • Apri index.html
   • Vedi "🟢 Sync" = PERFETTO!
   • Vedi "📴 Offline Mode" = Non configurato (normale)

🎯 RISULTATO: 
Multi-dispositivo automatico! 
Computer/telefono/tablet sempre sincronizzati!

*/
