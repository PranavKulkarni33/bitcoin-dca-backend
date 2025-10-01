require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();
app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'https://431e5602-8be0-4ddb-ba56-6f8b9463a9cc-00-2jarswai5wrdp.worf.replit.dev',
        'https://moksha.capital'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
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
    const { signal, fgIndex, rsi } = req.body;
  
    const validSignals = ['BUY', 'EXTREME_BUY'];
    const formattedSignal = signal?.toUpperCase();
  
    if (!validSignals.includes(formattedSignal)) {
      return res.status(400).json({ error: 'Signal must be EXTREME_BUY or BUY' });
    }
  
    const maxiQuotes = [
      '"There is no second best." - Michael Saylor',
      '"Stack sats, stay humble." - Bitcoin Proverb',
      '"Not your keys, not your coins." - Andreas Antonopoulos',
      '"Fix the money, fix the world." - Bitcoin Ethos',
      '"The best time to buy Bitcoin was yesterday. The second best time is now." - Bitcoin Wisdom',
      '"Everyone gets Bitcoin at the price they deserve." - Bitcoin Truth',
      '"When others are fearful, be greedy." - Warren Buffett (adopted by Bitcoiners)',
      '"Study Bitcoin." - Saifedean Ammous',
      '"Bitcoin is a swarm of cyber hornets serving the goddess of wisdom." - Nassim Taleb'
    ];
    
    const randomQuote = maxiQuotes[Math.floor(Math.random() * maxiQuotes.length)];
    
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
    });
  
    const signalEmoji = formattedSignal === 'EXTREME_BUY' ? '🚨' : '📊';
    const signalText = formattedSignal === 'EXTREME_BUY' ? 'EXTREME ACCUMULATION ZONE' : 'ACCUMULATION ZONE';
    
    let metrics = '';
    if (fgIndex !== undefined) {
      metrics += `F&G: ${fgIndex}`;
    }
    if (rsi !== undefined && rsi !== null) {
      metrics += fgIndex !== undefined ? ` | RSI: ${rsi}` : `RSI: ${rsi}`;
    }
  
    const message = `
${signalEmoji} ${signalText} ${signalEmoji}

${metrics}

Others are fearful. Smart money accumulates.

${randomQuote}

────────────────────────
${now}
Moksha Capital
    `.trim();
  
    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: `${signalEmoji} Bitcoin Buy Signal - Moksha Capital`,
      Message: message,
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
  
  // Return current Bitcoin RSI
  app.get('/rsi', async (req, res) => {
    try {
      const { fetchRSI } = require('./cron');
      const rsi = await fetchRSI();
      if (rsi === null) {
        return res.status(503).json({ error: 'TAAPI_SECRET not configured or RSI fetch failed' });
      }
      res.json({ value: rsi });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch RSI' });
    }
  });
  
  // Test decision path without sending email
  app.get('/test-decision', (req, res) => {
    const { decideSignal } = require('./cron'); // uses same logic
    const fgValue = parseInt(req.query.fgIndex || req.query.value, 10);
    const rsiValue = req.query.rsi ? parseInt(req.query.rsi, 10) : null;
    
    if (Number.isNaN(fgValue)) {
      return res.status(400).json({ error: 'fgIndex (or value) required' });
    }
    
    const signal = decideSignal(fgValue, rsiValue);
    res.json({ fgIndex: fgValue, rsi: rsiValue, signal });
  });
  
  

app.listen(PORT, () => {
  console.log(`🚀 Bitcoin DCA backend running at http://localhost:${PORT}`);
});
