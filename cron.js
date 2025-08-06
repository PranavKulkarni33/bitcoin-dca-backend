require('dotenv').config();
const axios = require('axios');

async function fetchAndSendIfNeeded() {
  try {
    const res = await axios.get('https://api.alternative.me/fng/');
    const value = parseInt(res.data.data[0].value);
    console.log(`Fear & Greed Index: ${value}`);

    if (value < 25) {
      console.log('Triggering BUY alert...');

      const apiRes = await axios.post(`${process.env.ALERT_API_URL}/send-alert`, {
        signal: 'BUY'
      });

      console.log('Response:', apiRes.data);
    } else {
      console.log('Index above threshold — no alert sent.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fetchAndSendIfNeeded();
