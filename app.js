// Telemarketing Dashboard App
class TelemarketingDashboard {
    constructor() {
        this.data = {
            mesi: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", 
                   "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            valorePOD: 160,
            valorePDR: 850,
            podPerCondominio: 20,
            pdrPerCondominio: 4,
            valoreCondominio: 6600,
            categorieEsiti: ["Non risponde", "Non interessato", "Numero errato", "Appuntamenti fissati"]
        };

        this.monthlyData = {};
        this.charts = {};

        this.init();
    }

    init() {
        this.setupTabs();
        this.generateMonthForms();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDataFromStorage(); // Carica i dati salvati

        // Initialize empty data for all months if not loaded
        this.data.mesi.forEach(mese => {
            if (!this.monthlyData[mese]) {
                this.monthlyData[mese] = {
                    chiamatePartite: 0,
                    nonRisponde: 0,
                    nonInteressato: 0,
                    numeroErrato: 0,
                    appuntamentiFissati: 0,
                    oreLavorate: 0,
                    costoOrario: 0,
                    appuntamentiPercorsi: 0,
                    amministratoriPotenziali: 0,
                    potenzialePDR: 0,
                    potenzialePOD: 0
                };
            }
        });

        // Auto-save ogni 30 secondi
        setInterval(() => {
            this.saveDataToStorage();
        }, 30000);
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.id.replace('tab', 'content');

                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');

                // Update charts when switching to graphs, funnel or summary tab
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

    setupEventListeners() {
        // Add input listeners for all form fields
        this.data.mesi.forEach(mese => {
            const inputs = [
                'chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 
                'appuntamentiFissati', 'oreLavorate', 'costoOrario', 
                'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'
            ];

            inputs.forEach(input => {
                const element = document.getElementById(`${mese}_${input}`);
                if (element) {
                    element.addEventListener('input', () => {
                        this.updateMonthData(mese);
                        this.updateMonthResults(mese);
                        this.updateSummary();
                        this.updateFunnelChart();
                        this.saveDataToStorage(); // Auto-save ad ogni modifica
                    });
                }
            });
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Sei sicuro di voler resettare tutti i dati?')) {
                this.resetAllData();
            }
        });

        // Funnel month selector
        document.getElementById('funnelMonth').addEventListener('change', () => {
            this.updateFunnelChart();
        });

        // Chiamate chart month selector - NUOVO
        document.getElementById('chiamateMonth').addEventListener('change', () => {
            this.updateChiamateChart();
        });

        // Aggiungi listener per i nuovi pulsanti di salvataggio
        this.setupSaveLoadButtons();
    }

    setupSaveLoadButtons() {
        // Aggiungi i pulsanti nell'header
        const headerActions = document.querySelector('.header-actions');

        // Pulsante Esporta CSV
        const exportCsvBtn = document.createElement('button');
        exportCsvBtn.id = 'exportCsvBtn';
        exportCsvBtn.className = 'btn btn--success btn--sm';
        exportCsvBtn.innerHTML = '📊 Esporta CSV';
        exportCsvBtn.addEventListener('click', () => this.exportToCSV());

        // Pulsante Carica Dati
        const loadBtn = document.createElement('button');
        loadBtn.id = 'loadBtn';
        loadBtn.className = 'btn btn--outline btn--sm';
        loadBtn.innerHTML = '📁 Carica Dati';
        loadBtn.addEventListener('click', () => this.importData());

        // Pulsante Salva Dati
        const saveBtn = document.createElement('button');
        saveBtn.id = 'saveBtn';
        saveBtn.className = 'btn btn--primary btn--sm';
        saveBtn.innerHTML = '💾 Salva Dati';
        saveBtn.addEventListener('click', () => this.exportData());

        // Input file nascosto per il caricamento
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'fileInput';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => this.handleFileLoad(e));

        // Indicatore di auto-save
        const saveIndicator = document.createElement('span');
        saveIndicator.id = 'saveIndicator';
        saveIndicator.className = 'save-indicator';
        saveIndicator.innerHTML = '💾 Auto-salvato';
        saveIndicator.style.opacity = '0';
        saveIndicator.style.transition = 'opacity 0.3s ease';

        // Inserisci i pulsanti prima del pulsante reset
        const resetBtn = document.getElementById('resetBtn');
        headerActions.insertBefore(exportCsvBtn, resetBtn);
        headerActions.insertBefore(loadBtn, resetBtn);
        headerActions.insertBefore(saveBtn, resetBtn);
        headerActions.insertBefore(fileInput, resetBtn);
        headerActions.appendChild(saveIndicator);
    }

    saveDataToStorage() {
        try {
            const dataToSave = {
                timestamp: new Date().toISOString(),
                monthlyData: this.monthlyData,
                version: '2.2' // Nuova versione per le modifiche grafici
            };
            localStorage.setItem('telemarketingDashboardData', JSON.stringify(dataToSave));
            this.showSaveIndicator();
        } catch (error) {
            console.error('Errore nel salvataggio:', error);
        }
    }

    loadDataFromStorage() {
        try {
            const savedData = localStorage.getItem('telemarketingDashboardData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.monthlyData = parsedData.monthlyData || {};

                // Migrazione dati da versione precedente
                this.data.mesi.forEach(mese => {
                    if (this.monthlyData[mese] && this.monthlyData[mese].condominiiPotenziali !== undefined) {
                        // Migra da condominiiPotenziali a amministratoriPotenziali
                        this.monthlyData[mese].amministratoriPotenziali = this.monthlyData[mese].condominiiPotenziali;
                        delete this.monthlyData[mese].condominiiPotenziali;
                    }
                });

                // Aggiorna i form con i dati caricati
                setTimeout(() => {
                    this.populateFormsWithData();

                    // Aggiorna tutti i risultati
                    this.data.mesi.forEach(mese => {
                        this.updateMonthResults(mese);
                    });

                    this.updateSummary();
                    console.log('✅ Dati caricati automaticamente dal browser');
                }, 100);
            }
        } catch (error) {
            console.error('Errore nel caricamento:', error);
        }
    }

    populateFormsWithData() {
        this.data.mesi.forEach(mese => {
            const data = this.monthlyData[mese];
            if (data) {
                const inputs = [
                    'chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 
                    'appuntamentiFissati', 'oreLavorate', 'costoOrario', 
                    'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'
                ];

                inputs.forEach(input => {
                    const element = document.getElementById(`${mese}_${input}`);
                    if (element && data[input] !== undefined) {
                        element.value = data[input];
                    }
                });
            }
        });
    }

    showSaveIndicator() {
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 2000);
        }
    }

    exportData() {
        try {
            const dataToExport = {
                timestamp: new Date().toISOString(),
                monthlyData: this.monthlyData,
                version: '2.2',
                exported: true
            };

            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `telemarketing_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();

            alert('✅ Dati esportati con successo! Il file è stato scaricato.');
        } catch (error) {
            console.error('Errore nell\'esportazione:', error);
            alert('❌ Errore nell\'esportazione dei dati.');
        }
    }

    importData() {
        document.getElementById('fileInput').click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const importedData = JSON.parse(content);

                if (importedData.monthlyData) {
                    this.monthlyData = importedData.monthlyData;

                    // Migrazione dati da versione precedente se necessario
                    this.data.mesi.forEach(mese => {
                        if (this.monthlyData[mese] && this.monthlyData[mese].condominiiPotenziali !== undefined) {
                            this.monthlyData[mese].amministratoriPotenziali = this.monthlyData[mese].condominiiPotenziali;
                            delete this.monthlyData[mese].condominiiPotenziali;
                        }
                    });

                    this.populateFormsWithData();

                    this.data.mesi.forEach(mese => {
                        this.updateMonthResults(mese);
                    });

                    this.updateSummary();
                    this.updateAllCharts();
                    this.updateFunnelChart();
                    this.saveDataToStorage();

                    alert('✅ Dati importati con successo!');
                } else {
                    alert('❌ Formato file non valido.');
                }
            } catch (error) {
                console.error('Errore nell\'importazione:', error);
                alert('❌ Errore nell\'importazione. Verifica che il file sia valido.');
            }
        };

        reader.readAsText(file);
        event.target.value = ''; // Reset input
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
            console.error('Errore nell\'esportazione CSV:', error);
            alert('❌ Errore nell\'esportazione CSV.');
        }
    }

    updateMonthData(mese) {
        const data = this.monthlyData[mese];

        data.chiamatePartite = parseInt(document.getElementById(`${mese}_chiamatePartite`).value) || 0;
        data.nonRisponde = parseInt(document.getElementById(`${mese}_nonRisponde`).value) || 0;
        data.nonInteressato = parseInt(document.getElementById(`${mese}_nonInteressato`).value) || 0;
        data.numeroErrato = parseInt(document.getElementById(`${mese}_numeroErrato`).value) || 0;
        data.appuntamentiFissati = parseInt(document.getElementById(`${mese}_appuntamentiFissati`).value) || 0;
        data.oreLavorate = parseFloat(document.getElementById(`${mese}_oreLavorate`).value) || 0;
        data.costoOrario = parseFloat(document.getElementById(`${mese}_costoOrario`).value) || 0;
        data.appuntamentiPercorsi = parseInt(document.getElementById(`${mese}_appuntamentiPercorsi`).value) || 0;
        data.amministratoriPotenziali = parseInt(document.getElementById(`${mese}_amministratoriPotenziali`).value) || 0;
        data.potenzialePDR = parseInt(document.getElementById(`${mese}_potenzialePDR`).value) || 0;
        data.potenzialePOD = parseInt(document.getElementById(`${mese}_potenzialePOD`).value) || 0;
    }

    updateMonthResults(mese) {
        const data = this.monthlyData[mese];

        // Calculate derived values
        const chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
        const costoTotale = data.oreLavorate * data.costoOrario;
        const valoreAmministratori = data.amministratoriPotenziali * this.data.valoreCondominio;
        const valorePOD = data.potenzialePOD * this.data.valorePOD;
        const valorePDR = data.potenzialePDR * this.data.valorePDR;
        const totalePotenziale = valorePOD + valorePDR;

        // Update display
        document.getElementById(`${mese}_chiamateEffettive`).textContent = chiamateEffettive;
        document.getElementById(`${mese}_costoTotale`).textContent = `€${costoTotale.toFixed(0)}`;
        document.getElementById(`${mese}_valoreAmministratori`).textContent = `€${valoreAmministratori.toLocaleString()}`;
        document.getElementById(`${mese}_valorePOD`).textContent = `€${valorePOD.toLocaleString()}`;
        document.getElementById(`${mese}_valorePDR`).textContent = `€${valorePDR.toLocaleString()}`;
        document.getElementById(`${mese}_totPotenziale`).textContent = `€${totalePotenziale.toLocaleString()}`;
    }

    initializeCharts() {
        // Initialize all charts
        this.initChiamateChart();
        this.initAppuntamentiChart();
        this.initPotenzialeChart();
        this.initRoiChart();
        this.initValorePotenzialiChart();
        this.initEsitiChart();
        this.initPerformanceChart();
        this.initFatturatoChart();
        this.initFunnelChart();
    }

    // MODIFICATO: Nuovo grafico chiamate con istogrammi e selettore mese
    initChiamateChart() {
        const ctx = document.getElementById('chiamateChart').getContext('2d');
        this.charts.chiamate = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.mesi,
                datasets: [
                    {
                        label: 'Chiamate Partite',
                        data: new Array(12).fill(0),
                        backgroundColor: '#1f2937',
                        borderColor: '#374151',
                        borderWidth: 1
                    },
                    {
                        label: 'Non Interessato',
                        data: new Array(12).fill(0),
                        backgroundColor: '#32b8c6',
                        borderColor: '#218089',
                        borderWidth: 1
                    },
                    {
                        label: 'Appuntamenti Presi',
                        data: new Array(12).fill(0),
                        backgroundColor: '#22c55e',
                        borderColor: '#16a34a',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Numero Chiamate'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Periodo'
                        }
                    }
                }
            }
        });
    }

    initAppuntamentiChart() {
        const ctx = document.getElementById('appuntamentiChart').getContext('2d');
        this.charts.appuntamenti = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.mesi,
                datasets: [
                    {
                        label: 'Appuntamenti Fissati',
                        data: new Array(12).fill(0),
                        backgroundColor: '#32b8c6',
                        borderColor: '#218089',
                        borderWidth: 1
                    },
                    {
                        label: 'Appuntamenti Percorsi',
                        data: new Array(12).fill(0),
                        backgroundColor: '#e66161',
                        borderColor: '#c0152f',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initPotenzialeChart() {
        const ctx = document.getElementById('potenzialeChart').getContext('2d');
        this.charts.potenziale = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.mesi,
                datasets: [
                    {
                        label: 'POD Potenziali',
                        data: new Array(12).fill(0),
                        backgroundColor: '#32b8c6',
                        borderColor: '#218089',
                        borderWidth: 1
                    },
                    {
                        label: 'PDR Potenziali',
                        data: new Array(12).fill(0),
                        backgroundColor: '#e68161',
                        borderColor: '#a84f2f',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initValorePotenzialiChart() {
        const ctx = document.getElementById('valorePotenzialiChart').getContext('2d');
        this.charts.valorePotenziali = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.mesi,
                datasets: [
                    {
                        label: 'Valore POD (€)',
                        data: new Array(12).fill(0),
                        borderColor: '#32b8c6',
                        backgroundColor: 'rgba(50, 184, 198, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Valore PDR (€)',
                        data: new Array(12).fill(0),
                        borderColor: '#e68161',
                        backgroundColor: 'rgba(230, 129, 97, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    initRoiChart() {
        const ctx = document.getElementById('roiChart').getContext('2d');
        this.charts.roi = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.mesi,
                datasets: [
                    {
                        label: 'Costi (€)',
                        data: new Array(12).fill(0),
                        backgroundColor: '#ff5459',
                        borderColor: '#c0152f',
                        borderWidth: 1
                    },
                    {
                        label: 'Potenziale Acquisito (€)',
                        data: new Array(12).fill(0),
                        backgroundColor: '#32b8c6',
                        borderColor: '#218089',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    initEsitiChart() {
        const ctx = document.getElementById('esitiChart').getContext('2d');
        this.charts.esiti = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.data.categorieEsiti,
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#a84f2f', '#32b8c6', '#ff5459', '#e68161'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.mesi,
                datasets: [
                    {
                        label: 'Tasso Conversione (%)',
                        data: new Array(12).fill(0),
                        borderColor: '#218089',
                        backgroundColor: 'rgba(33, 128, 137, 0.1)',
                        borderWidth: 3,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tasso Conversione (%)'
                        }
                    }
                }
            }
        });
    }

    initFatturatoChart() {
        const ctx = document.getElementById('fatturatoChart').getContext('2d');
        this.charts.fatturato = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.data.mesi,
                datasets: [{
                    label: 'Potenziale Economico (€)',
                    data: new Array(12).fill(0),
                    backgroundColor: '#32b8c6',
                    borderColor: '#218089',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // MODIFICATO: Funnel ridotto da 5 a 4 elementi
    initFunnelChart() {
        const ctx = document.getElementById('funnelChart').getContext('2d');
        this.charts.funnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Chiamate Partite', 'Chiamate Effettive', 'App. Fissati', 'App. Percorsi'],
                datasets: [{
                    label: 'Funnel Conversioni',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#1f2937',
                        '#32b8c6', 
                        '#e68161',
                        '#22c55e'
                    ],
                    borderColor: [
                        '#374151',
                        '#218089',
                        '#a84f2f', 
                        '#16a34a'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateAllCharts() {
        this.updateChiamateChart();
        this.updateAppuntamentiChart();
        this.updatePotenzialeChart();
        this.updateValorePotenzialiChart();
        this.updateRoiChart();
        this.updateEsitiChart();
        this.updatePerformanceChart();
        this.updateFatturatoChart();
    }

    // MODIFICATO: Nuovo metodo per aggiornare grafico chiamate con selettore
    updateChiamateChart() {
        const selectedMonth = document.getElementById('chiamateMonth').value;

        let labels, chiamatePartite, nonInteressato, appuntamentiFissati;

        if (selectedMonth === 'all') {
            // Mostra tutti i mesi
            labels = this.data.mesi;
            chiamatePartite = this.data.mesi.map(mese => this.monthlyData[mese].chiamatePartite);
            nonInteressato = this.data.mesi.map(mese => this.monthlyData[mese].nonInteressato);
            appuntamentiFissati = this.data.mesi.map(mese => this.monthlyData[mese].appuntamentiFissati);
        } else {
            // Mostra solo il mese selezionato
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

    updateAppuntamentiChart() {
        const fissati = this.data.mesi.map(mese => this.monthlyData[mese].appuntamentiFissati);
        const percorsi = this.data.mesi.map(mese => this.monthlyData[mese].appuntamentiPercorsi);

        this.charts.appuntamenti.data.datasets[0].data = fissati;
        this.charts.appuntamenti.data.datasets[1].data = percorsi;
        this.charts.appuntamenti.update();
    }

    updatePotenzialeChart() {
        const pod = this.data.mesi.map(mese => this.monthlyData[mese].potenzialePOD);
        const pdr = this.data.mesi.map(mese => this.monthlyData[mese].potenzialePDR);

        this.charts.potenziale.data.datasets[0].data = pod;
        this.charts.potenziale.data.datasets[1].data = pdr;
        this.charts.potenziale.update();
    }

    updateValorePotenzialiChart() {
        const valorePOD = this.data.mesi.map(mese => {
            return this.monthlyData[mese].potenzialePOD * this.data.valorePOD;
        });

        const valorePDR = this.data.mesi.map(mese => {
            return this.monthlyData[mese].potenzialePDR * this.data.valorePDR;
        });

        this.charts.valorePotenziali.data.datasets[0].data = valorePOD;
        this.charts.valorePotenziali.data.datasets[1].data = valorePDR;
        this.charts.valorePotenziali.update();
    }

    updateRoiChart() {
        const costi = this.data.mesi.map(mese => {
            const monthData = this.monthlyData[mese];
            return monthData.oreLavorate * monthData.costoOrario;
        });

        const potenzialeAcquisito = this.data.mesi.map(mese => {
            const data = this.monthlyData[mese];
            return (data.potenzialePOD * this.data.valorePOD) + (data.potenzialePDR * this.data.valorePDR);
        });

        this.charts.roi.data.datasets[0].data = costi;
        this.charts.roi.data.datasets[1].data = potenzialeAcquisito;
        this.charts.roi.update();
    }

    updateEsitiChart() {
        let totalNonRisponde = 0, totalNonInteressato = 0, totalNumeroErrato = 0, totalAppuntamenti = 0;

        this.data.mesi.forEach(mese => {
            const data = this.monthlyData[mese];
            totalNonRisponde += data.nonRisponde;
            totalNonInteressato += data.nonInteressato;
            totalNumeroErrato += data.numeroErrato;
            totalAppuntamenti += data.appuntamentiFissati;
        });

        this.charts.esiti.data.datasets[0].data = [
            totalNonRisponde, totalNonInteressato, totalNumeroErrato, totalAppuntamenti
        ];
        this.charts.esiti.update();
    }

    updatePerformanceChart() {
        const tassiConversione = this.data.mesi.map(mese => {
            const data = this.monthlyData[mese];
            const chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
            return chiamateEffettive > 0 ? (data.appuntamentiFissati / chiamateEffettive * 100) : 0;
        });

        this.charts.performance.data.datasets[0].data = tassiConversione;
        this.charts.performance.update();
    }

    updateFatturatoChart() {
        const potenzialeEconomico = this.data.mesi.map(mese => {
            const data = this.monthlyData[mese];
            return (data.potenzialePOD * this.data.valorePOD) + (data.potenzialePDR * this.data.valorePDR);
        });

        this.charts.fatturato.data.datasets[0].data = potenzialeEconomico;
        this.charts.fatturato.update();
    }

    // MODIFICATO: Funnel ridotto da 5 a 4 elementi
    updateFunnelChart() {
        const selectedMonth = document.getElementById('funnelMonth').value;

        let chiamatePartite = 0, chiamateEffettive = 0, appFissati = 0, appPercorsi = 0;

        if (selectedMonth === 'all') {
            // Calculate totals for all months
            this.data.mesi.forEach(mese => {
                const data = this.monthlyData[mese];
                chiamatePartite += data.chiamatePartite;
                chiamateEffettive += data.nonInteressato + data.appuntamentiFissati;
                appFissati += data.appuntamentiFissati;
                appPercorsi += data.appuntamentiPercorsi;
            });
        } else {
            // Calculate for selected month
            const data = this.monthlyData[selectedMonth];
            chiamatePartite = data.chiamatePartite;
            chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
            appFissati = data.appuntamentiFissati;
            appPercorsi = data.appuntamentiPercorsi;
        }

        this.charts.funnel.data.datasets[0].data = [
            chiamatePartite, chiamateEffettive, appFissati, appPercorsi
        ];
        this.charts.funnel.update();

        // Update funnel stats - MODIFICATO per 4 elementi
        this.updateFunnelStats(chiamatePartite, chiamateEffettive, appFissati, appPercorsi);
    }

    // MODIFICATO: Statistiche funnel per 4 elementi
    updateFunnelStats(chiamatePartite, chiamateEffettive, appFissati, appPercorsi) {
        const funnelMetrics = document.getElementById('funnelMetrics');

        // Calculate conversion rates
        const tassoEffettivita = chiamatePartite > 0 ? ((chiamateEffettive / chiamatePartite) * 100).toFixed(1) : 0;
        const tassoAppFissati = chiamateEffettive > 0 ? ((appFissati / chiamateEffettive) * 100).toFixed(1) : 0;
        const tassoAppPercorsi = appFissati > 0 ? ((appPercorsi / appFissati) * 100).toFixed(1) : 0;
        const tassoFinale = chiamatePartite > 0 ? ((appPercorsi / chiamatePartite) * 100).toFixed(2) : 0;

        funnelMetrics.innerHTML = `
            <div class="funnel-metric">
                <span class="metric-label">Tasso Efficacia Chiamate</span>
                <span class="metric-value">${tassoEffettivita}%</span>
            </div>
            <div class="funnel-metric">
                <span class="metric-label">Tasso App. Fissati</span>
                <span class="metric-value">${tassoAppFissati}%</span>
            </div>
            <div class="funnel-metric">
                <span class="metric-label">Tasso App. Percorsi</span>
                <span class="metric-value">${tassoAppPercorsi}%</span>
            </div>
            <div class="funnel-metric">
                <span class="metric-label">Conversione Finale</span>
                <span class="metric-value">${tassoFinale}%</span>
            </div>
            <div class="funnel-metric">
                <span class="metric-label">Resa Complessiva</span>
                <span class="metric-value">${appPercorsi} su ${chiamatePartite}</span>
            </div>
        `;
    }

    updateSummary() {
        this.updateKPIs();
        this.updateSummaryTable();
    }

    updateKPIs() {
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

        // Calcola KPIs
        const tassoConversione = totalChiamateEffettive > 0 ? (totalAppuntamentiFissati / totalChiamateEffettive * 100) : 0;
        const costoPerAppuntamento = totalAppuntamentiFissati > 0 ? (totalCosti / totalAppuntamentiFissati) : 0;
        const roiComplessivo = totalCosti > 0 ? ((totalPotenzialeAcquisito - totalCosti) / totalCosti * 100) : 0;

        // Aggiorna UI
        document.getElementById('tassoConversioneKPI').textContent = `${tassoConversione.toFixed(1)}%`;
        document.getElementById('costoAppuntamentoKPI').textContent = `€${costoPerAppuntamento.toFixed(0)}`;
        document.getElementById('potenzialeTotaleKPI').textContent = `€${totalPotenzialeAcquisito.toLocaleString()}`;
        document.getElementById('roiKPI').textContent = `${roiComplessivo.toFixed(1)}%`;
    }

    updateSummaryTable() {
        const tableBody = document.getElementById('summaryTableBody');
        tableBody.innerHTML = '';

        this.data.mesi.forEach(mese => {
            const data = this.monthlyData[mese];
            const chiamateEffettive = data.nonInteressato + data.appuntamentiFissati;
            const costoTotale = data.oreLavorate * data.costoOrario;
            const potenzialeEconomico = (data.potenzialePOD * this.data.valorePOD) + (data.potenzialePDR * this.data.valorePDR);
            const roi = costoTotale > 0 ? ((potenzialeEconomico - costoTotale) / costoTotale * 100) : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${mese}</strong></td>
                <td>${data.chiamatePartite}</td>
                <td>${chiamateEffettive}</td>
                <td>${data.appuntamentiFissati}</td>
                <td>${data.appuntamentiPercorsi}</td>
                <td>${data.amministratoriPotenziali}</td>
                <td>${data.potenzialePOD}</td>
                <td>${data.potenzialePDR}</td>
                <td>€${costoTotale.toFixed(0)}</td>
                <td>€${potenzialeEconomico.toLocaleString()}</td>
                <td>${roi.toFixed(1)}%</td>
            `;

            tableBody.appendChild(row);
        });
    }

    resetAllData() {
        // Reset all form inputs
        this.data.mesi.forEach(mese => {
            const inputs = [
                'chiamatePartite', 'nonRisponde', 'nonInteressato', 'numeroErrato', 
                'appuntamentiFissati', 'oreLavorate', 'costoOrario', 
                'appuntamentiPercorsi', 'amministratoriPotenziali', 'potenzialePDR', 'potenzialePOD'
            ];

            inputs.forEach(input => {
                const element = document.getElementById(`${mese}_${input}`);
                if (element) element.value = '0';
            });

            // Reset monthly data
            this.monthlyData[mese] = {
                chiamatePartite: 0,
                nonRisponde: 0,
                nonInteressato: 0,
                numeroErrato: 0,
                appuntamentiFissati: 0,
                oreLavorate: 0,
                costoOrario: 0,
                appuntamentiPercorsi: 0,
                amministratoriPotenziali: 0,
                potenzialePDR: 0,
                potenzialePOD: 0
            };

            // Update month results
            this.updateMonthResults(mese);
        });

        // Clear localStorage
        localStorage.removeItem('telemarketingDashboardData');

        // Update summary, charts and funnel
        this.updateSummary();
        this.updateAllCharts();
        this.updateFunnelChart();
    }
}

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TelemarketingDashboard();
});