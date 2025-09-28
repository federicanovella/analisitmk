// TELEMARKETING DASHBOARD v3.0 - GOOGLE SHEETS SYNC
class TelemarketingDashboard {
    constructor() {
        this.data = {
            mesi: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
                   "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            valorePOD: 160, valorePDR: 850, podPerCondominio: 20, pdrPerCondominio: 4,
            valoreCondominio: 6600,
            categorieEsiti: ["Non risponde", "Non interessato", "Numero errato", "Appuntamenti fissati"]
        };
        this.monthlyData = {};
        this.charts = {};
        this.syncEnabled = false;
        this.syncStatus = 'connecting';
        this.syncRetries = 0;
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.init();
    }

    async init() {
        this.setupTabs();
        this.generateMonthForms();
        this.setupEventListeners();
        this.initializeCharts();
        this.setupSyncStatusIndicator();

        this.data.mesi.forEach(mese => {
            if (!this.monthlyData[mese]) {
                this.monthlyData[mese] = {
                    chiamatePartite: 0, nonRisponde: 0, nonInteressato: 0, numeroErrato: 0,
                    appuntamentiFissati: 0, oreLavorate: 0, costoOrario: 0, appuntamentiPercorsi: 0,
                    amministratoriPotenziali: 0, potenzialePDR: 0, potenzialePOD: 0
                };
            }
        });

        await this.initializeGoogleSheetsSync();
        await this.loadData();
        this.setupAutoSync();
    }

    // GOOGLE SHEETS SYNC
    async initializeGoogleSheetsSync() {
        try {
            if (typeof GOOGLE_SHEETS_CONFIG === 'undefined' || 
                GOOGLE_SHEETS_CONFIG.API_KEY === 'AIzaSyAdQr8GTshHJzCZ5sVjKU_WiuCPyXi9lqA' ||
                GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID === '143C8cSljgwMnY7R6fnGInco0SoXXyDaXKi4X-UJjo08') {

                console.warn('⚠️ Google Sheets non configurato. Usando solo localStorage.');
                this.setSyncStatus('offline');
                this.syncEnabled = false;
                return;
            }

            this.setSyncStatus('connecting');
            const testResult = await this.testGoogleSheetsConnection();

            if (testResult.success) {
                this.syncEnabled = true;
                this.setSyncStatus('synced');
                console.log('✅ Google Sheets connesso!');
            } else {
                console.error('❌ Errore Google Sheets:', testResult.error);
                this.setSyncStatus('error');
                this.syncEnabled = false;
            }
        } catch (error) {
            console.error('❌ Errore inizializzazione:', error);
            this.setSyncStatus('error');
            this.syncEnabled = false;
        }
    }

    async testGoogleSheetsConnection() {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
            const response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' }});

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json().catch(() => ({}));
                return { success: false, error: errorData.error?.message || `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    setSyncStatus(status) {
        this.syncStatus = status;
        const indicator = document.getElementById('syncStatus');
        if (!indicator) return;

        indicator.className = 'sync-status';

        switch (status) {
            case 'connecting':
                indicator.classList.add('connecting');
                indicator.textContent = '🔄 Connecting...';
                break;
            case 'synced':
                indicator.classList.add('synced');
                const timeStr = this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'}) : '';
                indicator.textContent = `🟢 Sync ${timeStr}`;
                break;
            case 'syncing':
                indicator.classList.add('syncing');
                indicator.textContent = '🔄 Syncing...';
                break;
            case 'error':
                indicator.classList.add('error');
                indicator.textContent = '❌ Sync Error';
                break;
            case 'offline':
                indicator.classList.add('offline');
                indicator.textContent = '📴 Offline Mode';
                break;
        }
    }

    // INTERFACE SETUP
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.id.replace('tab', 'content');

                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');

                if (targetTab === 'contentGrafici' || targetTab === 'contentRiassunto') {
                    setTimeout(() => this.updateAllCharts(), 100);
                } else if (targetTab === 'contentFunnel') {
                    setTimeout(() => this.updateFunnelChart(), 100);
                }
            });
        });
    }

    generateMonthForms() {
        const container = document.getElementById('monthsContainer');

        this.data.mesi.forEach(mese => {
            const monthCard = document.createElement('div');
            monthCard.className = 'month-card';

            monthCard.innerHTML = `
                <h3>${mese}</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Chiamate Partite</label>
                        <input type="number" id="${mese}_chiamatePartite" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Non Risponde</label>
                        <input type="number" id="${mese}_nonRisponde" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Non Interessato</label>
                        <input type="number" id="${mese}_nonInteressato" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Numero Errato</label>
                        <input type="number" id="${mese}_numeroErrato" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Appuntamenti Fissati</label>
                        <input type="number" id="${mese}_appuntamentiFissati" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Ore Lavorate</label>
                        <input type="number" id="${mese}_oreLavorate" min="0" step="0.5" value="0">
                    </div>
                    <div class="form-group">
                        <label>Costo Orario (€)</label>
                        <input type="number" id="${mese}_costoOrario" min="0" step="0.01" value="0">
                    </div>
                    <div class="form-group">
                        <label>Appuntamenti Percorsi</label>
                        <input type="number" id="${mese}_appuntamentiPercorsi" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Amministratori Potenziali</label>
                        <input type="number" id="${mese}_amministratoriPotenziali" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Potenziale PDR Dichiarato Agente</label>
                        <input type="number" id="${mese}_potenzialePDR" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Potenziale POD Dichiarato Agente</label>
                        <input type="number" id="${mese}_potenzialePOD" min="0" value="0">
                    </div>
                </div>
                <div class="results-grid">
                    <div class="result-item">
                        <div class="result-label">Chiamate Effettive</div>
                        <div class="result-value" id="${mese}_chiamateEffettive">0</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Costo Totale</div>
                        <div class="result-value" id="${mese}_costoTotale">€0</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Valore Amministratori</div>
                        <div class="result-value" id="${mese}_valoreAmministratori">€0</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Valore POD Dichiarato</div>
                        <div class="result-value" id="${mese}_valorePOD">€0</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Valore PDR Dichiarato</div>
                        <div class="result-value" id="${mese}_valorePDR">€0</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Totale Potenziale</div>
                        <div class="result-value" id="${mese}_totPotenziale">€0</div>
                    </div>
                </div>
            `;

            container.appendChild(monthCard);
        });
    }

    // CHARTS INITIALIZATION
    initializeCharts() {
        const chartConfigs = {
            chiamate: {
                type: 'bar',
                data: {
                    labels: this.data.mesi,
                    datasets: [
                        {label: 'Chiamate Partite', data: new Array(12).fill(0), backgroundColor: '#1f2937'},
                        {label: 'Non Interessato', data: new Array(12).fill(0), backgroundColor: '#32b8c6'},
                        {label: 'Appuntamenti Presi', data: new Array(12).fill(0), backgroundColor: '#22c55e'}
                    ]
                },
                options: {responsive: true, maintainAspectRatio: false, scales: {y: {beginAtZero: true}}}
            },
            funnel: {
                type: 'bar',
                data: {
                    labels: ['Chiamate Partite', 'Chiamate Effettive', 'App. Fissati', 'App. Percorsi'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#1f2937', '#32b8c6', '#e68161', '#22c55e']
                    }]
                },
                options: {responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: {legend: {display: false}}}
            }
        };

        Object.entries(chartConfigs).forEach(([key, config]) => {
            const ctx = document.getElementById(`${key}Chart`);
            if (ctx) {
                this.charts[key] = new Chart(ctx.getContext('2d'), config);
            }
        });

        // Inizializza altri grafici base
        const basicCharts = ['appuntamenti', 'potenziale', 'roi', 'valorePotenziali', 'esiti', 'performance', 'fatturato'];
        basicCharts.forEach(chartId => {
            const ctx = document.getElementById(`${chartId}Chart`);
            if (ctx) {
                this.charts[chartId] = new Chart(ctx.getContext('2d'), {
                    type: chartId === 'esiti' ? 'doughnut' : (chartId === 'valorePotenziali' || chartId === 'performance' ? 'line' : 'bar'),
                    data: {labels: this.data.mesi, datasets: [{data: new Array(12).fill(0)}]},
                    options: {responsive: true, maintainAspectRatio: false}
                });
            }
        });
    }

    // EVENT LISTENERS
    setupEventListeners() {
        this.data.mesi.forEach(mese => {
            const inputs = ['chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 'appuntamentiFissati', 'oreLavorate', 'costoOrario', 'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'];

            inputs.forEach(input => {
                const element = document.getElementById(`${mese}_${input}`);
                if (element) {
                    element.addEventListener('input', async () => {
                        this.updateMonthData(mese);
                        this.updateMonthResults(mese);
                        this.updateSummary();
                        this.updateFunnelChart();
                        this.saveDataToStorage();
                        if (this.syncEnabled) {
                            clearTimeout(this.saveTimeout);
                            this.saveTimeout = setTimeout(async () => await this.saveDataToGoogleSheets(), 2000);
                        }
                    });
                }
            });
        });

        document.getElementById('resetBtn')?.addEventListener('click', async () => {
            if (confirm('Sei sicuro di voler resettare tutti i dati?')) await this.resetAllData();
        });

        document.getElementById('funnelMonth')?.addEventListener('change', () => this.updateFunnelChart());
        document.getElementById('chiamateMonth')?.addEventListener('change', () => this.updateChiamateChart());

        this.setupSyncStatusIndicator();
        this.setupSaveLoadButtons();
    }

    setupSyncStatusIndicator() {
        const indicator = document.getElementById('syncStatus');
        if (!indicator) return;

        indicator.addEventListener('click', async () => {
            if (this.syncStatus === 'error' || this.syncStatus === 'offline') {
                await this.initializeGoogleSheetsSync();
                if (this.syncEnabled) await this.loadData();
            }
        });

        indicator.style.cursor = 'pointer';
        indicator.title = 'Clicca per riconnettersi in caso di errore';
    }

    setupSaveLoadButtons() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;

        const exportCsvBtn = document.createElement('button');
        exportCsvBtn.className = 'btn btn--success btn--sm';
        exportCsvBtn.innerHTML = '📊 Esporta CSV';
        exportCsvBtn.addEventListener('click', () => this.exportToCSV());

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) headerActions.insertBefore(exportCsvBtn, resetBtn);
    }

    // DATA MANAGEMENT
    updateMonthData(mese) {
        const data = this.monthlyData[mese];
        const inputs = ['chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 'appuntamentiFissati', 'oreLavorate', 'costoOrario', 'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'];

        inputs.forEach(input => {
            const element = document.getElementById(`${mese}_${input}`);
            if (element) {
                data[input] = input.includes('Orario') ? parseFloat(element.value) || 0 : parseInt(element.value) || 0;
            }
        });
    }

    updateMonthResults(mese) {
        const data = this.monthlyData[mese];
        const chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
        const costoTotale = data.oreLavorate * data.costoOrario;
        const valoreAmministratori = data.amministratoriPotenziali * this.data.valoreCondominio;
        const valorePOD = data.potenzialePOD * this.data.valorePOD;
        const valorePDR = data.potenzialePDR * this.data.valorePDR;
        const totalePotenziale = valorePOD + valorePDR;

        document.getElementById(`${mese}_chiamateEffettive`).textContent = chiamateEffettive;
        document.getElementById(`${mese}_costoTotale`).textContent = `€${costoTotale.toFixed(0)}`;
        document.getElementById(`${mese}_valoreAmministratori`).textContent = `€${valoreAmministratori.toLocaleString()}`;
        document.getElementById(`${mese}_valorePOD`).textContent = `€${valorePOD.toLocaleString()}`;
        document.getElementById(`${mese}_valorePDR`).textContent = `€${valorePDR.toLocaleString()}`;
        document.getElementById(`${mese}_totPotenziale`).textContent = `€${totalePotenziale.toLocaleString()}`;
    }

    // CHARTS UPDATE
    updateAllCharts() {
        if (this.charts.chiamate) this.updateChiamateChart();
        if (this.charts.funnel) this.updateFunnelChart();
    }

    updateChiamateChart() {
        const selectedMonth = document.getElementById('chiamateMonth')?.value || 'all';
        let labels, chiamatePartite, nonInteressato, appuntamentiFissati;

        if (selectedMonth === 'all') {
            labels = this.data.mesi;
            chiamatePartite = this.data.mesi.map(mese => this.monthlyData[mese].chiamatePartite);
            nonInteressato = this.data.mesi.map(mese => this.monthlyData[mese].nonInteressato);
            appuntamentiFissati = this.data.mesi.map(mese => this.monthlyData[mese].appuntamentiFissati);
        } else {
            labels = [selectedMonth];
            const data = this.monthlyData[selectedMonth];
            chiamatePartite = [data.chiamatePartite];
            nonInteressato = [data.nonInteressato];
            appuntamentiFissati = [data.appuntamentiFissati];
        }

        this.charts.chiamate.data.labels = labels;
        this.charts.chiamate.data.datasets[0].data = chiamatePartite;
        this.charts.chiamate.data.datasets[1].data = nonInteressato;
        this.charts.chiamate.data.datasets[2].data = appuntamentiFissati;
        this.charts.chiamate.update();
    }

    updateFunnelChart() {
        const selectedMonth = document.getElementById('funnelMonth')?.value || 'all';
        let chiamatePartite = 0, chiamateEffettive = 0, appFissati = 0, appPercorsi = 0;

        if (selectedMonth === 'all') {
            this.data.mesi.forEach(mese => {
                const data = this.monthlyData[mese];
                chiamatePartite += data.chiamatePartite;
                chiamateEffettive += data.nonInteressato + data.appuntamentiFissati;
                appFissati += data.appuntamentiFissati;
                appPercorsi += data.appuntamentiPercorsi;
            });
        } else {
            const data = this.monthlyData[selectedMonth];
            chiamatePartite = data.chiamatePartite;
            chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
            appFissati = data.appuntamentiFissati;
            appPercorsi = data.appuntamentiPercorsi;
        }

        this.charts.funnel.data.datasets[0].data = [chiamatePartite, chiamateEffettive, appFissati, appPercorsi];
        this.charts.funnel.update();
        this.updateFunnelStats(chiamatePartite, chiamateEffettive, appFissati, appPercorsi);
    }

    updateFunnelStats(chiamatePartite, chiamateEffettive, appFissati, appPercorsi) {
        const funnelMetrics = document.getElementById('funnelMetrics');
        if (!funnelMetrics) return;

        const tassoEffettivita = chiamatePartite > 0 ? ((chiamateEffettive / chiamatePartite) * 100).toFixed(1) : 0;
        const tassoAppFissati = chiamateEffettive > 0 ? ((appFissati / chiamateEffettive) * 100).toFixed(1) : 0;
        const tassoAppPercorsi = appFissati > 0 ? ((appPercorsi / appFissati) * 100).toFixed(1) : 0;
        const tassoFinale = chiamatePartite > 0 ? ((appPercorsi / chiamatePartite) * 100).toFixed(2) : 0;

        funnelMetrics.innerHTML = `
            <div class="funnel-metric"><span class="metric-label">Tasso Efficacia Chiamate</span><span class="metric-value">${tassoEffettivita}%</span></div>
            <div class="funnel-metric"><span class="metric-label">Tasso App. Fissati</span><span class="metric-value">${tassoAppFissati}%</span></div>
            <div class="funnel-metric"><span class="metric-label">Tasso App. Percorsi</span><span class="metric-value">${tassoAppPercorsi}%</span></div>
            <div class="funnel-metric"><span class="metric-label">Conversione Finale</span><span class="metric-value">${tassoFinale}%</span></div>
            <div class="funnel-metric"><span class="metric-label">Resa Complessiva</span><span class="metric-value">${appPercorsi} su ${chiamatePartite}</span></div>
        `;
    }

    updateSummary() {
        let totalChiamateEffettive = 0, totalAppuntamentiFissati = 0, totalCosti = 0, totalPotenzialeAcquisito = 0;

        this.data.mesi.forEach(mese => {
            const data = this.monthlyData[mese];
            const chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
            const costo = data.oreLavorate * data.costoOrario;
            const potenzialeAcquisito = (data.potenzialePOD * this.data.valorePOD) + (data.potenzialePDR * this.data.valorePDR);

            totalChiamateEffettive += chiamateEffettive;
            totalAppuntamentiFissati += data.appuntamentiFissati;
            totalCosti += costo;
            totalPotenzialeAcquisito += potenzialeAcquisito;
        });

        const tassoConversione = totalChiamateEffettive > 0 ? (totalAppuntamentiFissati / totalChiamateEffettive * 100) : 0;
        const costoPerAppuntamento = totalAppuntamentiFissati > 0 ? (totalCosti / totalAppuntamentiFissati) : 0;
        const roiComplessivo = totalCosti > 0 ? ((totalPotenzialeAcquisito - totalCosti) / totalCosti * 100) : 0;

        const kpis = document.getElementById('tassoConversioneKPI');
        if (kpis) {
            document.getElementById('tassoConversioneKPI').textContent = `${tassoConversione.toFixed(1)}%`;
            document.getElementById('costoAppuntamentoKPI').textContent = `€${costoPerAppuntamento.toFixed(0)}`;
            document.getElementById('potenzialeTotaleKPI').textContent = `€${totalPotenzialeAcquisito.toLocaleString()}`;
            document.getElementById('roiKPI').textContent = `${roiComplessivo.toFixed(1)}%`;
        }
    }

    // GOOGLE SHEETS DATA SYNC
    async loadDataFromGoogleSheets() {
        if (!this.syncEnabled) return null;

        try {
            const range = `${GOOGLE_SHEETS_CONFIG.SHEET_NAME}!${GOOGLE_SHEETS_CONFIG.RANGE}`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            if (!data.values || data.values.length < 2) {
                await this.initializeGoogleSheetsStructure();
                return {};
            }

            return this.convertSheetsToAppData(data.values);
        } catch (error) {
            console.error('Errore caricamento Google Sheets:', error);
            throw error;
        }
    }

    async saveDataToGoogleSheets() {
        if (!this.syncEnabled) return;

        try {
            this.setSyncStatus('syncing');
            const sheetsData = this.convertAppDataToSheets();
            const range = `${GOOGLE_SHEETS_CONFIG.SHEET_NAME}!${GOOGLE_SHEETS_CONFIG.RANGE}`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: sheetsData })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.lastSyncTime = new Date();
            this.syncRetries = 0;
            this.setSyncStatus('synced');

        } catch (error) {
            this.syncRetries++;
            if (this.syncRetries < SYNC_CONFIG.MAX_RETRIES) {
                setTimeout(() => this.saveDataToGoogleSheets(), SYNC_CONFIG.RETRY_DELAY);
            } else {
                this.setSyncStatus('error');
                this.syncRetries = 0;
            }
        }
    }

    convertSheetsToAppData(sheetsValues) {
        if (!sheetsValues || sheetsValues.length < 2) return {};
        const rows = sheetsValues.slice(1);
        const appData = {};

        rows.forEach(row => {
            if (row.length === 0 || !row[0]) return;
            const mese = row[0];
            if (this.data.mesi.includes(mese)) {
                appData[mese] = {
                    chiamatePartite: parseInt(row[1]) || 0,
                    nonRisponde: parseInt(row[2]) || 0,
                    nonInteressato: parseInt(row[3]) || 0,
                    numeroErrato: parseInt(row[4]) || 0,
                    appuntamentiFissati: parseInt(row[5]) || 0,
                    oreLavorate: parseFloat(row[6]) || 0,
                    costoOrario: parseFloat(row[7]) || 0,
                    appuntamentiPercorsi: parseInt(row[8]) || 0,
                    amministratoriPotenziali: parseInt(row[9]) || 0,
                    potenzialePDR: parseInt(row[10]) || 0,
                    potenzialePOD: parseInt(row[11]) || 0
                };
            }
        });
        return appData;
    }

    convertAppDataToSheets() {
        const sheetsData = [SHEETS_STRUCTURE.headers];

        this.data.mesi.forEach(mese => {
            const data = this.monthlyData[mese];
            sheetsData.push([
                mese, data.chiamatePartite || 0, data.nonRisponde || 0, data.nonInteressato || 0,
                data.numeroErrato || 0, data.appuntamentiFissati || 0, data.oreLavorate || 0,
                data.costoOrario || 0, data.appuntamentiPercorsi || 0, data.amministratoriPotenziali || 0,
                data.potenzialePDR || 0, data.potenzialePOD || 0, new Date().toISOString()
            ]);
        });
        return sheetsData;
    }

    async initializeGoogleSheetsStructure() {
        if (!this.syncEnabled) return;

        try {
            const headers = SHEETS_STRUCTURE.headers;
            const range = `${GOOGLE_SHEETS_CONFIG.SHEET_NAME}!A1:${String.fromCharCode(64 + headers.length)}1`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_CONFIG.API_KEY}`;

            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: [headers] })
            });
        } catch (error) {
            console.error('Errore inizializzazione struttura:', error);
        }
    }

    setupAutoSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);

        this.syncInterval = setInterval(async () => {
            if (this.syncEnabled && this.syncStatus !== 'syncing') {
                await this.saveDataToGoogleSheets();
            }
        }, SYNC_CONFIG.AUTO_SYNC_INTERVAL);
    }

    async loadData() {
        try {
            if (this.syncEnabled) {
                const sheetsData = await this.loadDataFromGoogleSheets();
                if (sheetsData && Object.keys(sheetsData).length > 0) {
                    this.monthlyData = { ...this.monthlyData, ...sheetsData };
                } else {
                    this.loadDataFromStorage();
                    if (Object.keys(this.monthlyData).filter(m => this.data.mesi.includes(m)).some(m => Object.values(this.monthlyData[m]).some(v => v > 0))) {
                        await this.saveDataToGoogleSheets();
                    }
                }
            } else {
                this.loadDataFromStorage();
            }

            setTimeout(() => {
                this.populateFormsWithData();
                this.data.mesi.forEach(mese => this.updateMonthResults(mese));
                this.updateSummary();
            }, 100);

        } catch (error) {
            console.error('Errore caricamento dati:', error);
            this.loadDataFromStorage();
            this.populateFormsWithData();
        }
    }

    // STORAGE UTILITIES
    saveDataToStorage() {
        try {
            const dataToSave = { timestamp: new Date().toISOString(), monthlyData: this.monthlyData, version: '3.0' };
            localStorage.setItem('telemarketingDashboardData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Errore salvataggio localStorage:', error);
        }
    }

    loadDataFromStorage() {
        try {
            const savedData = localStorage.getItem('telemarketingDashboardData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.monthlyData = parsedData.monthlyData || {};

                // Migrazione da versioni precedenti
                this.data.mesi.forEach(mese => {
                    if (this.monthlyData[mese] && this.monthlyData[mese].condominiiPotenziali !== undefined) {
                        this.monthlyData[mese].amministratoriPotenziali = this.monthlyData[mese].condominiiPotenziali;
                        delete this.monthlyData[mese].condominiiPotenziali;
                    }
                });
            }
        } catch (error) {
            console.error('Errore caricamento localStorage:', error);
        }
    }

    populateFormsWithData() {
        this.data.mesi.forEach(mese => {
            const data = this.monthlyData[mese];
            if (data) {
                const inputs = ['chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 'appuntamentiFissati', 'oreLavorate', 'costoOrario', 'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'];
                inputs.forEach(input => {
                    const element = document.getElementById(`${mese}_${input}`);
                    if (element && data[input] !== undefined) {
                        element.value = data[input];
                    }
                });
            }
        });
    }

    exportToCSV() {
        try {
            let csvContent = 'Mese,Chiamate Partite,Chiamate Effettive,Non Risponde,Non Interessato,Numero Errato,Appuntamenti Fissati,Appuntamenti Percorsi,Ore Lavorate,Costo Orario,Costo Totale,Amministratori Potenziali,POD Potenziali,PDR Potenziali,Valore POD,Valore PDR,Totale Potenziale,ROI %\n';

            this.data.mesi.forEach(mese => {
                const data = this.monthlyData[mese];
                const chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
                const costoTotale = data.oreLavorate * data.costoOrario;
                const valorePOD = data.potenzialePOD * this.data.valorePOD;
                const valorePDR = data.potenzialePDR * this.data.valorePDR;
                const totalePotenziale = valorePOD + valorePDR;
                const roi = costoTotale > 0 ? ((totalePotenziale - costoTotale) / costoTotale * 100) : 0;

                csvContent += `${mese},${data.chiamatePartite},${chiamateEffettive},${data.nonRisponde},${data.nonInteressato},${data.numeroErrato},${data.appuntamentiFissati},${data.appuntamentiPercorsi},${data.oreLavorate},${data.costoOrario},${costoTotale.toFixed(2)},${data.amministratoriPotenziali},${data.potenzialePOD},${data.potenzialePDR},${valorePOD},${valorePDR},${totalePotenziale},${roi.toFixed(2)}\n`;
            });

            const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(csvBlob);
            link.download = `telemarketing_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            alert('📊 Report CSV esportato con successo!');
        } catch (error) {
            console.error('Errore esportazione CSV:', error);
            alert('❌ Errore esportazione CSV.');
        }
    }

    async resetAllData() {
        this.data.mesi.forEach(mese => {
            const inputs = ['chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 'appuntamentiFissati', 'oreLavorate', 'costoOrario', 'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'];

            inputs.forEach(input => {
                const element = document.getElementById(`${mese}_${input}`);
                if (element) element.value = '0';
            });

            this.monthlyData[mese] = {
                chiamatePartite: 0, nonRisponde: 0, nonInteressato: 0, numeroErrato: 0,
                appuntamentiFissati: 0, oreLavorate: 0, costoOrario: 0, appuntamentiPercorsi: 0,
                amministratoriPotenziali: 0, potenzialePDR: 0, potenzialePOD: 0
            };

            this.updateMonthResults(mese);
        });

        localStorage.removeItem('telemarketingDashboardData');

        if (this.syncEnabled) await this.saveDataToGoogleSheets();

        this.updateSummary();
        this.updateAllCharts();
        this.updateFunnelChart();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new TelemarketingDashboard();
});