// Precipitación mensual en Guanajuato (mm)
const MONTHLY_PRECIP = [4.9, 9.9, 0, 0, 61.6, 207.16, 64.3, 157.47, 168.02, 5.6, 0, 10.4];
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

let savingsChart;

document.addEventListener("DOMContentLoaded", () => {
    initChart();
    setupListeners();
    calculateAll();
});

function setupListeners() {
    document.getElementById("roofLargo").addEventListener("input", calculateAll);
    document.getElementById("roofAncho").addEventListener("input", calculateAll);
    document.getElementById("waterCost").addEventListener("input", calculateAll);
    document.getElementById("gardenArea").addEventListener("input", calculateAll);
    document.getElementById("irrigationFreq").addEventListener("change", calculateAll);
}

function calculateAll() {
    // 1. CAPTACIÓN DE AGUA
    const largo = parseFloat(document.getElementById("roofLargo").value) || 0;
    const ancho = parseFloat(document.getElementById("roofAncho").value) || 0;
    const roofArea = largo * ancho;
    const runoffCoeff = 0.80; // Eficiencia promedio del techo

    // Litros acumulados por mes
    const monthlyLitres = MONTHLY_PRECIP.map(mm => mm * roofArea * runoffCoeff);
    const annualLitres = monthlyLitres.reduce((a, b) => a + b, 0);
    const annualM3 = annualLitres / 1000;

    // 2. AHORRO EN DINERO
    const costPerM3 = parseFloat(document.getElementById("waterCost").value) || 0;
    const annualSavings = annualM3 * costPerM3;
    const monthlySavings = monthlyLitres.map(litres => (litres / 1000) * costPerM3);

    document.getElementById("totalMoneySaved").textContent = `$${Math.round(annualSavings).toLocaleString('es-MX')} MXN`;
    document.getElementById("totalWaterHarvested").textContent = `${Math.round(annualLitres).toLocaleString('es-MX')} Litros captados (${annualM3.toFixed(1)} m³)`;

    // 3. RIEGO DE HUERTO
    const gardenArea = parseFloat(document.getElementById("gardenArea").value) || 0;
    const freqFactor = parseFloat(document.getElementById("irrigationFreq").value) || 0.5;

    // Consumo estándar eficiente de riego: 4 litros por m² en cada riego
    const litresPerIrrigation = gardenArea * 4; 
    
    let totalRiegos = 0;
    if (litresPerIrrigation > 0) {
        totalRiegos = Math.floor(annualLitres / litresPerIrrigation);
    }

    // Días de riego cubiertos según la frecuencia elegida
    const daysCovered = freqFactor > 0 ? Math.floor(totalRiegos / freqFactor) : 0;

    document.getElementById("totalRiegosCount").textContent = `${totalRiegos.toLocaleString('es-MX')} Riegos`;
    document.getElementById("daysOfGardenWater").innerHTML = `Equivale a <strong>${daysCovered} días</strong> con riego asegurado`;

    document.getElementById("gardenSummary").innerHTML = 
        `💡 Con el agua de lluvia cosechada puedes regar tu huerto de <strong>${gardenArea} m²</strong> un total de <strong>${totalRiegos} veces</strong> ` +
        `(usando aprox. ${Math.round(litresPerIrrigation)} L por riego).`;

    // Actualizar gráfica
    if (savingsChart) {
        savingsChart.data.datasets[0].data = monthlySavings;
        savingsChart.update();
    }
}

function initChart() {
    const ctx = document.getElementById("savingsChart").getContext("2d");
    savingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MONTH_NAMES,
            datasets: [{
                label: 'Ahorro mensual ($ MXN)',
                data: [],
                backgroundColor: '#0077b6',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}
