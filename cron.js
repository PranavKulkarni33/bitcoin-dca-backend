require('dotenv').config();
const axios = require('axios');

async function fetchRSI() {
  if (!process.env.TAAPI_SECRET) {
    console.log('TAAPI_SECRET not configured, skipping RSI');
    return null;
  }

  try {
    const res = await axios.get('https://api.taapi.io/rsi', {
      params: {
        secret: process.env.TAAPI_SECRET,
        exchange: 'binance',
        symbol: 'BTC/USDT',
        interval: '1d'
      }
    });
    return res.data.value;
  } catch (err) {
    console.error('RSI fetch error:', err.message);
    return null;
  }
}

function decideSignal(fgIndex, rsi = null) {
  const fgExtremeFear = fgIndex < 25;
  const fgFear = fgIndex < 40;
  
  const rsiOversold = rsi !== null && rsi < 30;
  const rsiNearOversold = rsi !== null && rsi < 40;

  if (fgExtremeFear && rsiOversold) {
    return 'EXTREME_BUY';
  }
  
  if ((fgExtremeFear && rsiNearOversold) || (fgFear && rsiOversold)) {
    return 'EXTREME_BUY';
  }
  
  if (fgFear && rsiNearOversold) {
    return 'BUY';
  }
  
  if (fgExtremeFear && rsi === null) {
    return 'EXTREME_BUY';
  }
  
  if (fgFear && rsi === null) {
    return 'BUY';
  }
  
  return null;
}

async function fetchAndSendIfNeeded() {
  try {
    let fgValue;
    if (process.env.FORCE_VALUE) {
      fgValue = parseInt(process.env.FORCE_VALUE, 10);
      console.log(`Using FORCE_VALUE=${fgValue}`);
    } else {
      const res = await axios.get('https://api.alternative.me/fng/');
      fgValue = parseInt(res.data.data[0].value, 10);
      console.log(`Fear & Greed Index (live): ${fgValue}`);
    }

    const rsiValue = await fetchRSI();
    if (rsiValue !== null) {
      console.log(`Bitcoin RSI (1d): ${rsiValue}`);
    }

    const signalToSend = decideSignal(fgValue, rsiValue);
    console.log(`Decision (FG=${fgValue}, RSI=${rsiValue}): ${signalToSend || 'NO ALERT'}`);

    if (!signalToSend) return;

    const apiRes = await axios.post(`${process.env.ALERT_API_URL}/send-alert`, {
      signal: signalToSend,
      fgIndex: fgValue,
      rsi: rsiValue
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
module.exports = { decideSignal, fetchRSI }; 
