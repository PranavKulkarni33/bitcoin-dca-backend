require('dotenv').config();
const express = require('express');
const AWS = require('aws-sdk');

const app = express();
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
  
    // Only accept 'BUY' or 'SELL'
    const formattedSignal = signal?.toUpperCase();
    if (!['BUY', 'SELL'].includes(formattedSignal)) {
      return res.status(400).json({ error: 'Signal must be BUY or SELL' });
    }
  
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
    });
  
    const message = `
  🚨 Bitcoin DCA Alert 🚨
  
  Signal: ${formattedSignal}
  
  Based on the current market sentiment and the Fear & Greed Index, it may be a good time to ${
      formattedSignal === 'BUY'
        ? 'accumulate Bitcoin.'
        : 'pause accumulation or consider rebalancing.'
    }
  
  ─────────────
  
  📊 Signal Details:
  • Market Signal: ${formattedSignal}
  • Source: Fear & Greed Index
  • Time: ${now}
  
  ─────────────
  
  — Team Bitcoin DCA
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
  

app.listen(PORT, () => {
  console.log(`🚀 Bitcoin DCA backend running at http://localhost:${PORT}`);
});
