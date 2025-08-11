require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: 'https://431e5602-8be0-4ddb-ba56-6f8b9463a9cc-00-2jarswai5wrdp.worf.replit.dev'
  }));
const PORT = 3000;

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sns = new AWS.SNS();

app.use(express.json());

app.post('/send-alert', async (req, res) => {
    const { signal } = req.body;
  
    const validSignals = ['BUY', 'EXTREME_BUY'];
    const formattedSignal = signal?.toUpperCase();
  
    if (!validSignals.includes(formattedSignal)) {
      return res.status(400).json({ error: 'Signal must be EXTREME_BUY or BUY' });
    }
  
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
    });
  
    const message = `
  Bitcoin DCA Alert
  
  Signal: ${formattedSignal === 'EXTREME_BUY' ? 'Extreme Buy' : 'Buy'}
  
  Based on the current market sentiment and the Fear & Greed Index, this may be a good opportunity to accumulate Bitcoin.
  
  Details:
  - Market Signal: ${formattedSignal === 'EXTREME_BUY' ? 'Extreme Fear (Strong Accumulation Zone)' : 'Fear (Accumulation Zone)'}
  - Source: Fear & Greed Index
  - Time: ${now}
  
  — Bitcoin DCA Notification System
    `;
  
    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: 'Bitcoin DCA Alert',
      Message: message.trim(),
    };
  
    try {
      await sns.publish(params).promise();
      res.json({ success: true, message: `DCA ${formattedSignal} alert sent.` });
    } catch (err) {
      console.error('SNS Publish Error:', err);
      res.status(500).json({ error: 'Failed to send alert' });
    }
  });
  
  

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;
  
    if (!email) return res.status(400).json({ error: 'Email required' });
  
    const params = {
      Protocol: 'email',
      TopicArn: process.env.SNS_TOPIC_ARN,
      Endpoint: email,
    };
  
    try {
      await sns.subscribe(params).promise();
      res.json({ success: true, message: `Confirmation email sent to ${email}` });
    } catch (err) {
      console.error('Subscribe error:', err);
      res.status(500).json({ error: 'Subscription failed' });
    }
  });

  // Return current Fear & Greed Index directly (verifies source works)
app.get('/fg-index', async (req, res) => {
    try {
      const axios = require('axios');
      const r = await axios.get('https://api.alternative.me/fng/');
      const value = parseInt(r.data.data[0].value, 10);
      res.json({ value });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch F&G index' });
    }
  });
  
  // Test decision path without sending email
  app.get('/test-decision', (req, res) => {
    const { decideSignal } = require('./cron'); // uses same logic
    const n = parseInt(req.query.value, 10);
    if (Number.isNaN(n)) return res.status(400).json({ error: 'value required' });
    res.json({ value: n, signal: decideSignal(n) });
  });
  
  

app.listen(PORT, () => {
  console.log(`🚀 Bitcoin DCA backend running at http://localhost:${PORT}`);
});
