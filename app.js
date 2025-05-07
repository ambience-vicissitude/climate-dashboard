import { createLineChart } from './chart-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = GridStack.init({
    column: 12,
    gutter: 16,   // spacing between widgets
    margin: 10
  });

  const widgetConfigs = [
    { id: 'open-meteo', title: 'Open-Meteo Max Temp', w: 6, h: 4 },
    { id: 'geomet', title: 'GeoMet Mean Temp', w: 6, h: 4 },
    { id: 'ghg', title: 'CO₂ Concentration', w: 12, h: 4 }
  ];

  widgetConfigs.forEach(({ id, title, w, h }) => {
    const el = document.createElement('div');
    el.classList.add('grid-stack-item');
    el.setAttribute('gs-w', w);
    el.setAttribute('gs-h', h);
    el.innerHTML = `
      <div class="grid-stack-item-content">
        <h3>${title}</h3>
        <canvas id="${id}-chart"></canvas>
      </div>
    `;
    grid.makeWidget(el);
  });

  // === 1. Open-Meteo
  const meteoRes = await fetch('https://climate-api.open-meteo.com/v1/climate?latitude=43.85&longitude=-79.02&start=2025-06-01&end=2025-06-30&daily=temperature_2m_max&temperature_unit=celsius&timezone=America%2FToronto');
  const meteoData = await meteoRes.json();
  createLineChart(
    document.getElementById('open-meteo-chart'),
    meteoData.daily.time,
    meteoData.daily.temperature_2m_max,
    'Max Temp (°C)',
    'rgba(255, 99, 132)'
  );

  // === 2. GeoMet-OGC
  const geoRes = await fetch('https://api.weather.gc.ca/collections/climate-monthly/items?lang=en&limit=6');
  const geoData = await geoRes.json();
  const geoLabels = geoData.features.map(f => `${f.properties.year}-${f.properties.month}`);
  const geoTemps = geoData.features.map(f => f.properties.mean_temp);
  createLineChart(
    document.getElementById('geomet-chart'),
    geoLabels,
    geoTemps,
    'Mean Temp (°C)',
    'rgba(54, 162, 235)'
  );

  // === 3. GHG Concentrations
  const ghgRes = await fetch('https://global-warming.org/api/co2-api');
  const ghgData = await ghgRes.json();
  const co2Data = ghgData.co2.slice(-12); // last 12 data points
  const ghgLabels = co2Data.map(d => d.year);
  const ghgValues = co2Data.map(d => parseFloat(d.trend));
  createLineChart(
    document.getElementById('ghg-chart'),
    ghgLabels,
    ghgValues,
    'CO₂ (ppm)',
    'rgba(75, 192, 192)'
  );
});
