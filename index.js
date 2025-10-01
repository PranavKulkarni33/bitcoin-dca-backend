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
      '"Everyone gets Bitcoin at the price they deserve." - Bitcoin Truth',
      '"Study Bitcoin." - Saifedean Ammous',
      '"Bitcoin is a swarm of cyber hornets serving the goddess of wisdom." - Nassim Taleb',
      '"Bitcoin changes absolutely everything." - Jack Dorsey',
      '"The world will have a single currency, and I believe it will be Bitcoin." - Jack Dorsey',
      '"What inspires me most about Bitcoin is the community driving it." - Jack Dorsey',
      '"Bitcoin succeeds through payments, not speculation." - Jack Dorsey',
      '"My hope is that Bitcoin creates world peace." - Jack Dorsey',
      '"If I were not at Square or Twitter, I would be working on Bitcoin." - Jack Dorsey',
      '"Sound money is an essential element of a free society." - Saifedean Ammous',
      '"Bitcoin is the hardest money ever invented." - Saifedean Ammous',
      '"History shows it is not possible to insulate yourself from the consequences of others holding money that is harder than yours." - Saifedean Ammous',
      '"Money that is easy to produce is no money at all." - Saifedean Ammous',
      '"Bitcoin gives us an insurance policy against an Orwellian future." - Saifedean Ammous',
      '"Governments will inevitably succumb to the temptation of inflating the money supply." - Saifedean Ammous',
      '"Bitcoin is the apex property of the human race." - Michael Saylor',
      '"Bitcoin is hope." - Michael Saylor',
      '"Bitcoin is a bank in cyberspace, run by incorruptible software." - Michael Saylor',
      '"21 million Bitcoin will be worth more than all the fiat currency in the world." - Michael Saylor',
      '"Bitcoin is the greatest monetary network ever created." - Michael Saylor',
      '"Bitcoin is the solution to the tyranny of fiat currency." - Michael Saylor',
      '"Bitcoin is engineered money." - Michael Saylor',
      '"The last object the establishment could control, namely currency, is no longer their monopoly." - Andreas Antonopoulos',
      '"Bitcoin is borderless, permissionless, and censorship-resistant money." - Andreas Antonopoulos',
      '"Bitcoin is a tool to liberate and protect people." - Andreas Antonopoulos',
      '"In Bitcoin, we don\'t need to trust anyone, we verify everything." - Andreas Antonopoulos',
      '"Bitcoin is the internet of money." - Andreas Antonopoulos',
      '"Bitcoin is peaceful, voluntary money that cannot be debased." - Andreas Antonopoulos',
      '"Bitcoin will do to banks what email did to the postal industry." - Rick Falkvinge',
      '"Hal Finney predicted Bitcoin at $10 million per coin." - Hal Finney (2009)',
      '"Bitcoin seems to be a very promising idea." - Hal Finney',
      '"The computer can be used as a tool to liberate people." - Hal Finney',
      '"I see Bitcoin as ultimately becoming a reserve currency for banks." - Hal Finney',
      '"Our money depends on trust in a third party - Bitcoin fixes this." - Nick Szabo',
      '"Bitcoin doesn\'t depend on a trusted central authority." - Nick Szabo',
      '"Fiat currency creates mountains of debt and inflation risks." - Nick Szabo',
      '"Bitcoin is a readily-validated form of hard money." - Nick Szabo',
      '"Smart property might be created by embedding smart contracts in physical objects." - Nick Szabo',
      '"Bitcoin is one of the most important inventions in all of human history." - Roger Ver',
      '"In the future, banks will be museums." - Brett Scott',
      '"Bitcoin enables anyone to be their own bank." - Bitcoin Truth',
      '"Be greedy when others are fearful." - Warren Buffett (Bitcoin adaptation)',
      '"Bitcoin is a mathematical breakthrough." - Paul Buchheit',
      '"Bitcoin will do to money what the internet did to information." - Naval Ravikant',
      '"Bitcoin is incorruptible money." - Naval Ravikant',
      '"Bitcoin is the most peaceful revolution ever conceived." - Bitcoin Philosophy',
      '"The root problem with conventional currency is the trust that\'s required." - Satoshi Nakamoto',
      '"Bitcoin is a peer-to-peer electronic cash system." - Satoshi Nakamoto',
      '"The nature of Bitcoin is such that once version 0.1 was released, the core design was set in stone." - Satoshi Nakamoto',
      '"I\'ve been working on a new electronic cash system that\'s fully peer-to-peer." - Satoshi Nakamoto',
      '"Lost coins only make everyone else\'s coins worth slightly more." - Satoshi Nakamoto',
      '"Bitcoin never sleeps." - Bitcoin Truth',
      '"1 BTC = 1 BTC" - Bitcoin Maxim',
      '"Tick tock next block." - Bitcoin Saying',
      '"Have fun staying poor." - Bitcoin Meme',
      '"Few understand this." - Bitcoin Saying',
      '"HODL." - Bitcoin Culture',
      '"This is gentlemen." - Bitcoin Saying',
      '"In Satoshi we trust." - Bitcoin Community',
      '"Run your own node." - Bitcoin Ethos',
      '"Verify, don\'t trust." - Bitcoin Principle',
      '"Bitcoin is backed by energy, mathematics, and thermodynamics." - Bitcoin Truth',
      '"Mining Bitcoin is converting energy into digital gold." - Bitcoin Mining',
      '"The Bitcoin network never stops, never sleeps, never takes a holiday." - Bitcoin Reality',
      '"Bitcoin is freedom money." - Bitcoin Philosophy',
      '"Fiat is a slow rug pull." - Bitcoin Truth',
      '"All money eventually goes to zero, except Bitcoin." - Bitcoin Belief',
      '"Bitcoin is saving technology." - Bitcoin Truth',
      '"Bitcoin fixes this." - Bitcoin Community',
      '"Stay humble, stack sats." - Matt Odell',
      '"Bitcoin is a savings technology, not a payment system." - Jameson Lopp',
      '"Bitcoin is the most honest money ever created." - Bitcoin Philosophy',
      '"When you understand Bitcoin, you understand everything." - Bitcoin Truth',
      '"Bitcoin is the ultimate protest vote." - Bitcoin Philosophy',
      '"Bitcoin doesn\'t care about your feelings." - Bitcoin Truth',
      '"Bitcoin is inevitable." - Bitcoin Belief',
      '"The honey badger of money." - Bitcoin Description',
      '"Bitcoin is an idea whose time has come." - Bitcoin Truth',
      '"You don\'t change Bitcoin, Bitcoin changes you." - Bitcoin Wisdom',
      '"Bitcoin is the great monetary reset." - Bitcoin Philosophy',
      '"Every sat counts." - Bitcoin Saying',
      '"Inflation is theft." - Bitcoin Economics',
      '"Print money, create problems. Bitcoin solves this." - Bitcoin Truth',
      '"Central banks are Ponzi schemes." - Bitcoin Perspective',
      '"Bitcoin is digital scarcity." - Bitcoin Definition',
      '"Bitcoin separates money from state." - Bitcoin Philosophy',
      '"The best time to learn about Bitcoin was 10 years ago. The second best time is now." - Bitcoin Wisdom',
      '"Bitcoin is a lifeboat in a sea of fiat." - Bitcoin Metaphor',
      '"Orange coin good." - Bitcoin Humor',
      '"Bitcoin doesn\'t need you, but you need Bitcoin." - Bitcoin Truth',
      '"Mathematics secures Bitcoin, not governments or banks." - Bitcoin Security',
      '"Bitcoin is permission-less prosperity." - Bitcoin Vision',
      '"You can ban Bitcoin, but you can\'t stop Bitcoin." - Bitcoin Reality',
      '"Bitcoin is the people\'s money." - Bitcoin Philosophy',
      '"Scarcity creates value, Bitcoin has absolute scarcity." - Bitcoin Economics',
      '"Time in the market beats timing the market." - Bitcoin Investment (adapted)',
      '"Dollar cost average and chill." - Bitcoin Strategy',
      '"Bitcoin rewards patience." - Bitcoin Wisdom',
      '"Bitcoin punishes leverage." - Bitcoin Truth',
      '"Bitcoin is the ultimate long-term investment." - Bitcoin Belief',
      '"Weak hands get shaken out." - Bitcoin Market',
      '"Diamond hands prevail." - Bitcoin Culture',
      '"Bitcoin doesn\'t care about your portfolio." - Bitcoin Truth',
      '"Bitcoin is programmed to win." - Bitcoin Code',
      '"21 million is the hardest cap in existence." - Bitcoin Economics',
      '"Bitcoin mining turns electricity into digital gold." - Bitcoin Mining',
      '"Proof of work proves worth." - Bitcoin Consensus',
      '"Energy is the currency of the universe, Bitcoin captures it." - Bitcoin Philosophy'
    ];
    
    const educationalLinks = [
      'Watch: https://www.youtube.com/@aantonop',
      'Watch: https://www.youtube.com/@CoinBureau',
      'Watch: https://www.youtube.com/@WhiteboardCrypto',
      'Watch: https://www.youtube.com/@99Bitcoinsofficial',
      'Watch: https://www.youtube.com/@AltcoinDaily',
      'Watch: https://www.youtube.com/@BenjaminCowen',
      'Watch: https://www.youtube.com/@glassnode',
      'Watch: https://www.youtube.com/@Bankless',
      'Watch: https://www.youtube.com/@Finematics',
      'Watch: https://www.youtube.com/@CryptoCasey',
      'Watch: https://www.youtube.com/@BrianJung',
      'Watch: https://www.youtube.com/@IvanOnTech',
      'Watch: https://www.youtube.com/@VirtualBacon',
      'Watch: https://www.youtube.com/@CryptoBanter',
      'Watch: https://www.youtube.com/@TheMoonCarl',
      'Watch: https://www.youtube.com/@BlockwareIntelligence'
    ];
    
    const randomQuote = maxiQuotes[Math.floor(Math.random() * maxiQuotes.length)];
    const randomLink = educationalLinks[Math.floor(Math.random() * educationalLinks.length)];
    
    const now = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
    });
  
    const signalEmoji = formattedSignal === 'EXTREME_BUY' ? '🚨' : '📊';
    const signalText = formattedSignal === 'EXTREME_BUY' ? 'EXTREME ACCUMULATION ZONE' : 'ACCUMULATION ZONE';
    
    function getFearGreedText(value) {
      if (value < 25) return `${value}/100 - Extreme Fear 😱`;
      if (value < 40) return `${value}/100 - Fear 😟`;
      if (value < 60) return `${value}/100 - Neutral 😐`;
      if (value < 75) return `${value}/100 - Greed 😊`;
      return `${value}/100 - Extreme Greed 🤑`;
    }
    
    function getRSIText(value) {
      if (value < 30) return `${value}/100 - Deeply Oversold 🔥`;
      if (value < 40) return `${value}/100 - Oversold 💎`;
      if (value < 60) return `${value}/100 - Neutral ⚖️`;
      if (value < 70) return `${value}/100 - Overbought 📈`;
      return `${value}/100 - Extremely Overbought 🚀`;
    }
    
    let metrics = '';
    if (fgIndex !== undefined) {
      metrics += `📊 Market Sentiment: ${getFearGreedText(fgIndex)}`;
    }
    if (rsi !== undefined && rsi !== null) {
      if (metrics) metrics += '\n';
      metrics += `⚡ Price Momentum: ${getRSIText(rsi)}`;
    }
  
    const message = `
${signalEmoji} ${signalText} ${signalEmoji}

${metrics}

Others are fearful. Smart money accumulates.

${randomQuote}

${randomLink}

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
