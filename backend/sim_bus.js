// sim_bus.js - simple bus GPS simulator that posts to the API
const fetch = require('node-fetch');
const URL = process.env.API_URL || 'http://127.0.0.1:3000/bus/update';
const BUS_ID = 'bus-demo-1';

const route = [
  [12.9716, 77.5946],
  [12.9728, 77.5900],
  [12.9750, 77.5850],
  [12.9780, 77.5800],
  [12.9820, 77.5790]
];

async function runLoop() {
  let i = 0;
  while (true) {
    const [lat, lon] = route[i % route.length];
    const payload = { bus_id: BUS_ID, latitude: lat + (i * 0.0001), longitude: lon + (i * 0.0001), speed: 25.0 };
    try {
      const res = await fetch(URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      const text = await res.text();
      console.log('POST', payload, '=>', res.status, text);
    } catch (e) {
      console.error('Error sending telemetry:', e.message || e);
    }
    i++;
    await new Promise(r => setTimeout(r, 3000));
  }
}

runLoop();
