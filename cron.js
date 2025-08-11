require('dotenv').config();
const axios = require('axios');

function decideSignal(val){
  if (val < 25) return 'EXTREME_BUY';
  if (val < 40) return 'BUY';
  return null;
}

async function fetchAndSendIfNeeded() {
  try {
    // Use FORCE_VALUE if provided (for testing), else fetch real API
    let value;
    if (process.env.FORCE_VALUE) {
      value = parseInt(process.env.FORCE_VALUE, 10);
      console.log(`Using FORCE_VALUE=${value}`);
    } else {
      const res = await axios.get('https://api.alternative.me/fng/');
      value = parseInt(res.data.data[0].value, 10);
      console.log(`Fear & Greed Index (live): ${value}`);
    }

    const signalToSend = decideSignal(value);
    console.log(`Decision for value ${value}: ${signalToSend || 'NO ALERT'}`);

    if (!signalToSend) return;

    const apiRes = await axios.post(`${process.env.ALERT_API_URL}/send-alert`, {
      signal: signalToSend
    });
    console.log('Alert sent:', apiRes.status, apiRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Cron error:', err.response.status, err.response.data);
    } else {
      console.error('Cron error:', err.message);
    }
  }
}
fetchAndSendIfNeeded();
module.exports = { decideSignal }; 
