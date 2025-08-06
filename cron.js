require('dotenv').config();
const axios = require('axios');

async function fetchAndSendIfNeeded() {
  try {
    const res = await axios.get('https://api.alternative.me/fng/');
    const value = parseInt(res.data.data[0].value);
    console.log(`Fear & Greed Index: ${value}`);

    let signalToSend = null;

    if (value < 25) {
      signalToSend = 'EXTREME_BUY';
    } else if (value < 40) {
      signalToSend = 'BUY';
    }

    if (signalToSend) {
      console.log(`Triggering ${signalToSend} alert...`);
      const apiRes = await axios.post(`${process.env.ALERT_API_URL}/send-alert`, {
        signal: signalToSend
      });
      console.log('Alert sent:', apiRes.data);
    } else {
      console.log('No alert sent — Index is above threshold.');
    }
  } catch (err) {
    console.error('Error in cron job:', err.message);
  }
}

fetchAndSendIfNeeded();
