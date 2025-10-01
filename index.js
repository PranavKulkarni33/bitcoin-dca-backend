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
      '"Energy is the currency of the universe, Bitcoin captures it." - Bitcoin Philosophy',
      '"Bitcoin is a declaration of monetary independence." - Bitcoin Revolution',
      '"The Bitcoin standard is coming." - Bitcoin Future',
      '"Bitcoin is sound money for the digital age." - Bitcoin Definition',
      '"Hold Bitcoin, ignore the noise." - Bitcoin Strategy',
      '"Bitcoin is insurance against government mismanagement." - Bitcoin Protection',
      '"Be your own bank with Bitcoin." - Bitcoin Empowerment',
      '"Bitcoin is the exit from fiat." - Bitcoin Escape',
      '"Buying Bitcoin is voting for freedom." - Bitcoin Philosophy',
      '"Bitcoin rewards low time preference." - Bitcoin Economics',
      '"The Bitcoin blockchain is truth." - Bitcoin Reality',
      '"Bitcoin is antifragile money." - Bitcoin Resilience',
      '"Every block makes Bitcoin stronger." - Bitcoin Security',
      '"Bitcoin is global, neutral money." - Bitcoin Property',
      '"No inflation, no confiscation - just Bitcoin." - Bitcoin Promise',
      '"Bitcoin is the biggest idea since the internet." - Bitcoin Innovation',
      '"The Bitcoin revolution is unstoppable." - Bitcoin Movement',
      '"Bitcoin: opt out of the fiat system." - Bitcoin Choice',
      '"Save in Bitcoin, escape inflation." - Bitcoin Strategy',
      '"Bitcoin is permissionless innovation." - Bitcoin Freedom',
      '"The Bitcoin network is an organism." - Bitcoin Nature',
      '"Bitcoin is absolute mathematical scarcity." - Bitcoin Truth',
      '"Every satoshi is precious." - Bitcoin Value',
      '"Bitcoin is the best asymmetric bet." - Bitcoin Investment',
      '"When in doubt, zoom out." - Bitcoin Perspective',
      '"Bitcoin is anti-fragile, anti-government, anti-bank." - Bitcoin Ethos',
      '"The Bitcoin standard fixes civilization." - Bitcoin Vision',
      '"Hyperbitcoinization is inevitable." - Bitcoin Future',
      '"Bitcoin is borderless wealth." - Bitcoin Freedom',
      '"Code is law in Bitcoin." - Bitcoin Governance',
      '"Bitcoin cannot be censored, cannot be stopped." - Bitcoin Power',
      '"The Bitcoin rabbit hole goes deep." - Bitcoin Journey',
      '"Bitcoin is a technological breakthrough." - Bitcoin Innovation',
      '"Sats today, freedom tomorrow." - Bitcoin Vision',
      '"Bitcoin mining secures the network." - Bitcoin Security',
      '"No middleman, just Bitcoin." - Bitcoin Efficiency',
      '"Bitcoin empowers the individual." - Bitcoin Philosophy',
      '"The Bitcoin ledger is immutable." - Bitcoin Truth',
      '"Decentralization is Bitcoin\'s superpower." - Bitcoin Strength',
      '"Bitcoin is global money without borders." - Bitcoin Utility',
      '"Patience pays in Bitcoin." - Bitcoin Wisdom',
      '"Bitcoin is financial sovereignty." - Bitcoin Freedom',
      '"The harder the money, the better." - Bitcoin Economics',
      '"Bitcoin has no CEO, no headquarters." - Bitcoin Decentralization',
      '"Bitcoin scales with Lightning." - Bitcoin Technology',
      '"Trust the protocol, not the person." - Bitcoin Principle',
      '"Bitcoin is an escape hatch." - Bitcoin Safety',
      '"Sats accumulate over time." - Bitcoin Strategy',
      '"Bitcoin is deflationary by design." - Bitcoin Economics',
      '"The Bitcoin clock ticks every 10 minutes." - Bitcoin Mechanism',
      '"Bitcoin is pure, honest money." - Bitcoin Integrity',
      '"No bailouts, just Bitcoin." - Bitcoin Justice',
      '"Bitcoin distribution is fair." - Bitcoin Ethics',
      '"The Bitcoin halving creates scarcity." - Bitcoin Economics',
      '"Bitcoin is global consensus." - Bitcoin Agreement',
      '"Stack sats, build wealth." - Bitcoin Strategy',
      '"Bitcoin miners secure the future." - Bitcoin Security',
      '"The Bitcoin whitepaper changed everything." - Bitcoin History',
      '"Bitcoin is peer-to-peer cash." - Bitcoin Definition',
      '"Self-custody is self-sovereignty." - Bitcoin Philosophy',
      '"Bitcoin transactions are final." - Bitcoin Settlement',
      '"The Bitcoin mempool never lies." - Bitcoin Truth',
      '"Hash rate follows price." - Bitcoin Economics',
      '"Bitcoin grows stronger with time." - Bitcoin Evolution',
      '"Difficulty adjustment is genius." - Bitcoin Engineering',
      '"Bitcoin is censorship-resistant wealth." - Bitcoin Freedom',
      '"No central point of failure." - Bitcoin Architecture',
      '"Bitcoin is programmable scarcity." - Bitcoin Innovation',
      '"The Bitcoin network is a fortress." - Bitcoin Security',
      '"Lightning makes Bitcoin instant." - Bitcoin Speed',
      '"Bitcoin is opt-in money." - Bitcoin Freedom',
      '"The Bitcoin standard elevates humanity." - Bitcoin Vision',
      '"Bitcoin is transparent, verifiable truth." - Bitcoin Honesty',
      '"Store of value, medium of exchange." - Bitcoin Function',
      '"Bitcoin is credibly neutral." - Bitcoin Property',
      '"The longest chain wins." - Bitcoin Consensus',
      '"Bitcoin is incorruptible mathematics." - Bitcoin Foundation',
      '"Mining is energy transformation." - Bitcoin Physics',
      '"Bitcoin is the apex asset." - Bitcoin Investment',
      '"No permission needed, just Bitcoin." - Bitcoin Access',
      '"Bitcoin rewards hodlers." - Bitcoin Economics',
      '"The Bitcoin standard is superior." - Bitcoin Quality',
      '"Bitcoin is absolute finality." - Bitcoin Settlement',
      '"Fiat inflates, Bitcoin deflates." - Bitcoin Contrast',
      '"Bitcoin is digital gold 2.0." - Bitcoin Upgrade',
      '"No counterparty risk in Bitcoin." - Bitcoin Safety',
      '"Bitcoin is trustless money." - Bitcoin Design',
      '"The Bitcoin difficulty adjusts automatically." - Bitcoin Resilience',
      '"Bitcoin is portable wealth." - Bitcoin Utility',
      '"Satoshi gave us freedom." - Bitcoin Gratitude',
      '"Bitcoin is provably scarce." - Bitcoin Math',
      '"The Bitcoin experiment succeeded." - Bitcoin Victory',
      '"Bitcoin is neutral money." - Bitcoin Property',
      '"Cold storage is peace of mind." - Bitcoin Security',
      '"Bitcoin is open source freedom." - Bitcoin Philosophy',
      '"The Bitcoin protocol is law." - Bitcoin Governance',
      '"Bitcoin is unstoppable code." - Bitcoin Power',
      '"Time is Bitcoin\'s friend." - Bitcoin Patience',
      '"Bitcoin is a monetary revolution." - Bitcoin Change',
      '"The Bitcoin pizza guy is legend." - Bitcoin History',
      '"Bitcoin ATH is inevitable." - Bitcoin Confidence',
      '"Bitcoin is always on, always working." - Bitcoin Reliability',
      '"No inflation schedule, just 21M." - Bitcoin Economics',
      '"Bitcoin is financial freedom." - Bitcoin Liberation',
      '"The Bitcoin network effect grows." - Bitcoin Expansion',
      '"Bitcoin is censorship-proof." - Bitcoin Resistance',
      '"Miners compete, network wins." - Bitcoin Game Theory',
      '"Bitcoin is digital energy." - Bitcoin Transformation',
      '"The Bitcoin blockchain is truth." - Bitcoin Ledger',
      '"Bitcoin is unseizable wealth." - Bitcoin Protection',
      '"PoW is the only consensus that works." - Bitcoin Security',
      '"Bitcoin is the signal, everything else is noise." - Bitcoin Clarity',
      '"The Bitcoin supply shock is coming." - Bitcoin Economics',
      '"Bitcoin is mathematical certainty." - Bitcoin Precision',
      '"No third party, no problem." - Bitcoin Efficiency',
      '"Bitcoin is freedom technology." - Bitcoin Tool',
      '"The Bitcoin ethos is freedom." - Bitcoin Spirit',
      '"Bitcoin is pure capitalism." - Bitcoin Economics',
      '"Time preference affects Bitcoin strategy." - Bitcoin Psychology',
      '"Bitcoin is final settlement." - Bitcoin Finality',
      '"The Bitcoin code is law." - Bitcoin Rules',
      '"Bitcoin is liquid wealth." - Bitcoin Liquidity',
      '"Satoshi\'s vision lives on." - Bitcoin Legacy',
      '"Bitcoin is economic freedom." - Bitcoin Liberation',
      '"The Bitcoin supply is fixed forever." - Bitcoin Permanence',
      '"Bitcoin is permissionless freedom." - Bitcoin Access',
      '"No government can stop Bitcoin." - Bitcoin Power',
      '"Bitcoin is the peoples\' ledger." - Bitcoin Ownership',
      '"The Bitcoin halving reduces inflation." - Bitcoin Monetary Policy',
      '"Bitcoin is portable, divisible, scarce." - Bitcoin Properties',
      '"Bitcoin fees secure the future." - Bitcoin Sustainability',
      '"Bitcoin is global settlement layer." - Bitcoin Infrastructure',
      '"The Bitcoin mempool is transparent." - Bitcoin Openness',
      '"Bitcoin is internet-native money." - Bitcoin Digital',
      '"No CEO means no corruption." - Bitcoin Purity',
      '"Bitcoin is decentralized trust." - Bitcoin Innovation',
      '"The Bitcoin protocol evolves slowly." - Bitcoin Stability',
      '"Bitcoin is sound money principles." - Bitcoin Foundation',
      '"Mining follows the cheapest energy." - Bitcoin Efficiency',
      '"Bitcoin is voluntary participation." - Bitcoin Freedom',
      '"The Bitcoin timechain marches on." - Bitcoin Persistence',
      '"Bitcoin is savings technology." - Bitcoin Utility',
      '"Proof of work is proof of value." - Bitcoin Economics',
      '"Bitcoin is finite, fiat is infinite." - Bitcoin Contrast',
      '"The Bitcoin network is alive." - Bitcoin Organism',
      '"Bitcoin is money without rulers." - Bitcoin Governance',
      '"No bank holidays in Bitcoin." - Bitcoin Availability',
      '"Bitcoin is programmed honesty." - Bitcoin Integrity',
      '"The Bitcoin difficulty protects us." - Bitcoin Defense',
      '"Bitcoin is the future of money." - Bitcoin Destiny',
      '"Satoshis add up to Bitcoin." - Bitcoin Accumulation',
      '"Bitcoin is immutable truth." - Bitcoin Reality',
      '"The Bitcoin halving is inevitable." - Bitcoin Certainty',
      '"Bitcoin is peaceful money." - Bitcoin Philosophy',
      '"No backdoors in Bitcoin." - Bitcoin Security',
      '"Bitcoin is perfect money." - Bitcoin Ideal',
      '"The Bitcoin node validates truth." - Bitcoin Verification',
      '"Bitcoin is digital property rights." - Bitcoin Law',
      '"Every block is a timestamp." - Bitcoin Chronicle',
      '"Bitcoin is freedom of transaction." - Bitcoin Liberty',
      '"The Bitcoin network is sovereign." - Bitcoin Independence',
      '"Bitcoin is unstoppable money." - Bitcoin Power',
      '"Miners secure our future." - Bitcoin Gratitude',
      '"Bitcoin is the exit strategy." - Bitcoin Escape',
      '"The Bitcoin standard rewards savers." - Bitcoin Justice',
      '"Bitcoin is absolute scarcity." - Bitcoin Reality',
      '"No inflation tax in Bitcoin." - Bitcoin Fairness',
      '"Bitcoin is the great equalizer." - Bitcoin Justice',
      '"The Bitcoin protocol is elegant." - Bitcoin Design',
      '"Bitcoin is money for enemies." - Bitcoin Neutrality',
      '"Every confirmation is security." - Bitcoin Safety',
      '"Bitcoin is digital sovereignty." - Bitcoin Independence',
      '"The Bitcoin ledger is eternal." - Bitcoin Permanence',
      '"Bitcoin is mathematical money." - Bitcoin Science',
      '"No trust required, only verification." - Bitcoin Truth',
      '"Bitcoin is the ultimate hedge." - Bitcoin Protection',
      '"The Bitcoin difficulty bomb ticks." - Bitcoin Mechanism',
      '"Bitcoin is transparent money." - Bitcoin Honesty',
      '"Satoshi\'s gift to humanity." - Bitcoin Appreciation',
      '"Bitcoin is freedom from inflation." - Bitcoin Protection',
      '"The Bitcoin network is resilient." - Bitcoin Strength',
      '"Bitcoin is pure economics." - Bitcoin Science',
      '"No intermediaries needed." - Bitcoin Direct',
      '"Bitcoin is the monetary reset." - Bitcoin Change',
      '"The Bitcoin supply is auditable." - Bitcoin Transparency',
      '"Bitcoin is freedom from debasement." - Bitcoin Stability',
      '"Every block adds security." - Bitcoin Growth',
      '"Bitcoin is capped money." - Bitcoin Limit',
      '"The Bitcoin standard is honest." - Bitcoin Ethics',
      '"Bitcoin is the new gold standard." - Bitcoin Evolution',
      '"No central bank, no inflation." - Bitcoin Freedom',
      '"Bitcoin is digital bearer asset." - Bitcoin Property',
      '"The Bitcoin blockchain never forgets." - Bitcoin Memory',
      '"Bitcoin is freedom of value." - Bitcoin Liberty',
      '"Miners vote with hash power." - Bitcoin Democracy',
      '"Bitcoin is the people\'s money." - Bitcoin Ownership',
      '"The Bitcoin supply curve is perfect." - Bitcoin Economics',
      '"Bitcoin is peaceful revolution." - Bitcoin Movement',
      '"No nation controls Bitcoin." - Bitcoin Sovereignty',
      '"Bitcoin is the exit from tyranny." - Bitcoin Freedom',
      '"The Bitcoin network is antifragile." - Bitcoin Resilience',
      '"Bitcoin is programmed scarcity." - Bitcoin Code',
      '"Every sat matters." - Bitcoin Value',
      '"Bitcoin is freedom money for all." - Bitcoin Equality',
      '"The Bitcoin halving creates value." - Bitcoin Economics',
      '"Bitcoin is unstoppable truth." - Bitcoin Reality',
      '"No permission, no censorship." - Bitcoin Freedom',
      '"Bitcoin is the future standard." - Bitcoin Destiny',
      '"The Bitcoin clock never stops." - Bitcoin Persistence',
      '"Bitcoin is pure digital scarcity." - Bitcoin Essence',
      '"Satoshi freed money." - Bitcoin Revolution',
      '"Bitcoin is absolute truth." - Bitcoin Reality',
      '"The Bitcoin network is forever." - Bitcoin Eternity',
      '"Bitcoin is freedom incarnate." - Bitcoin Spirit',
      '"No ruler, no rules, just code." - Bitcoin Governance',
      '"Bitcoin is mathematical freedom." - Bitcoin Liberation',
      '"The Bitcoin standard wins." - Bitcoin Victory',
      '"Bitcoin is the way." - Bitcoin Path',
      '"Every halving increases scarcity." - Bitcoin Economics',
      '"Bitcoin is perfect sound money." - Bitcoin Ideal',
      '"The Bitcoin revolution is here." - Bitcoin Present',
      '"Bitcoin is coded freedom." - Bitcoin Technology',
      '"No bank, no problem." - Bitcoin Solution',
      '"Bitcoin is the answer." - Bitcoin Truth',
      '"The Bitcoin standard is inevitable." - Bitcoin Future',
      '"Bitcoin is eternal money." - Bitcoin Permanence',
      '"Proof of work is proof of security." - Bitcoin Defense',
      '"Bitcoin is freedom\'s currency." - Bitcoin Philosophy',
      '"The Bitcoin network is truth." - Bitcoin Reality',
      '"Bitcoin is the great migration." - Bitcoin Movement',
      '"No inflation, just deflation." - Bitcoin Economics',
      '"Bitcoin is monetary perfection." - Bitcoin Excellence',
      '"The Bitcoin whitepaper is gospel." - Bitcoin Scripture',
      '"Bitcoin is freedom in code." - Bitcoin Engineering',
      '"Every node is sovereignty." - Bitcoin Power',
      '"Bitcoin is the hard money." - Bitcoin Standard',
      '"The Bitcoin future is bright." - Bitcoin Optimism',
      '"Bitcoin is unstoppable progress." - Bitcoin Evolution',
      '"No compromise, just Bitcoin." - Bitcoin Purity',
      '"Bitcoin is the orange pill." - Bitcoin Awakening',
      '"The Bitcoin journey begins." - Bitcoin Start',
      '"Bitcoin is freedom forever." - Bitcoin Eternity',
      '"Bitcoin is the best savings account." - Bitcoin Utility',
      '"The future is Bitcoin." - Bitcoin Destiny',
      '"Bitcoin is king." - Bitcoin Royalty',
      '"Every Bitcoin is valuable." - Bitcoin Worth',
      '"Bitcoin is the standard." - Bitcoin Benchmark',
      '"The Bitcoin network never fails." - Bitcoin Reliability',
      '"Bitcoin is sovereignty." - Bitcoin Independence',
      '"No bailouts in Bitcoin." - Bitcoin Fairness',
      '"Bitcoin is the exit." - Bitcoin Escape',
      '"The Bitcoin ledger is truth." - Bitcoin Honesty',
      '"Bitcoin is digital freedom." - Bitcoin Liberation',
      '"Every transaction is final." - Bitcoin Settlement',
      '"Bitcoin is peer-to-peer money." - Bitcoin Direct',
      '"The Bitcoin protocol is immutable." - Bitcoin Permanence',
      '"Bitcoin is censorship-proof." - Bitcoin Freedom',
      '"No permission needed for Bitcoin." - Bitcoin Access',
      '"Bitcoin is the hardest asset." - Bitcoin Strength',
      '"The Bitcoin supply is fixed." - Bitcoin Scarcity',
      '"Bitcoin is digital gold 2.0." - Bitcoin Evolution',
      '"Every confirmation is security." - Bitcoin Safety',
      '"Bitcoin is transparent money." - Bitcoin Openness',
      '"The Bitcoin code is open." - Bitcoin Transparency',
      '"Bitcoin is programmable money." - Bitcoin Technology',
      '"No central authority in Bitcoin." - Bitcoin Decentralization',
      '"Bitcoin is global money." - Bitcoin Universal',
      '"The Bitcoin network is decentralized." - Bitcoin Architecture',
      '"Bitcoin is permissionless wealth." - Bitcoin Freedom',
      '"Every satoshi has value." - Bitcoin Precision',
      '"Bitcoin is the apex asset." - Bitcoin Investment',
      '"The Bitcoin blockchain is immutable." - Bitcoin Permanence',
      '"Bitcoin is deflationary money." - Bitcoin Economics',
      '"No inflation in Bitcoin." - Bitcoin Stability',
      '"Bitcoin is sound money." - Bitcoin Quality',
      '"The Bitcoin halving is programmed." - Bitcoin Code',
      '"Bitcoin is unstoppable." - Bitcoin Power',
      '"Every block secures Bitcoin." - Bitcoin Defense',
      '"Bitcoin is digital property." - Bitcoin Asset',
      '"The Bitcoin network is global." - Bitcoin Reach',
      '"Bitcoin is freedom technology." - Bitcoin Tool',
      '"No counterparty risk." - Bitcoin Safety',
      '"Bitcoin is the future." - Bitcoin Tomorrow',
      '"The Bitcoin standard is here." - Bitcoin Present',
      '"Bitcoin is absolute scarcity." - Bitcoin Limit',
      '"Every miner secures Bitcoin." - Bitcoin Protection',
      '"Bitcoin is the solution." - Bitcoin Answer',
      '"Tick tock, next block." - Bitcoin Rhythm',
      '"Bitcoin is hope for humanity." - Bitcoin Vision'
    ];
    
    const educationalLinks = [
      'Watch: https://www.youtube.com/watch?v=SSo_EIwHSd4',
      'Watch: https://www.youtube.com/watch?v=SXqfFTmYmT0',
      'Watch: https://www.youtube.com/watch?v=bBC-nXj3Ng4',
      'Watch: https://www.youtube.com/watch?v=Gc2en3nHxA4',
      'Watch: https://www.youtube.com/watch?v=41JCpzvnn_0',
      'Watch: https://www.youtube.com/watch?v=l1si5ZWLgy0',
      'Watch: https://www.youtube.com/watch?v=kubGCSj5y3k',
      'Watch: https://www.youtube.com/watch?v=s4g1XFU8Gto',
      'Watch: https://www.youtube.com/watch?v=Um63OQz3bjo',
      'Watch: https://www.youtube.com/watch?v=xIDL_akeras',
      'Watch: https://www.youtube.com/watch?v=6kMG-zg0LZs',
      'Watch: https://www.youtube.com/watch?v=9K1-Y1UF9oQ',
      'Watch: https://www.youtube.com/watch?v=i_wOEL6dprg',
      'Watch: https://www.youtube.com/watch?v=RJ3G5TjFuUg',
      'Watch: https://www.youtube.com/watch?v=0lJzPAYKAqE',
      'Watch: https://www.youtube.com/watch?v=t5JGQXCTe3c',
      'Watch: https://www.youtube.com/watch?v=_BCrI1BSZYA',
      'Watch: https://www.youtube.com/watch?v=NCs7b7pkRbA',
      'Watch: https://www.youtube.com/watch?v=jhOUU1JEDU0',
      'Watch: https://www.youtube.com/watch?v=RYJfWwWH4yo',
      'Watch: https://www.youtube.com/watch?v=O-6iH8hXxC0',
      'Watch: https://www.youtube.com/watch?v=1YyAzVmP9jQ',
      'Watch: https://www.youtube.com/watch?v=YIVAluSL9SU',
      'Watch: https://www.youtube.com/watch?v=MFo2exGM1J0',
      'Watch: https://www.youtube.com/watch?v=nY2Xa0kK78A',
      'Watch: https://www.youtube.com/watch?v=ZKwqNgG-Sv4',
      'Watch: https://www.youtube.com/watch?v=dctmYrvmJsw',
      'Watch: https://www.youtube.com/watch?v=TwWXPQTg-EI',
      'Watch: https://www.youtube.com/watch?v=LgI0liAee4s',
      'Watch: https://www.youtube.com/watch?v=jq8Cg2xpBX0',
      'Watch: https://www.youtube.com/watch?v=2u2x4T5XIAU',
      'Watch: https://www.youtube.com/watch?v=cOBmPlQXz8s',
      'Watch: https://www.youtube.com/watch?v=VYWc9dFqROI',
      'Watch: https://www.youtube.com/watch?v=g2chcYLpKIo',
      'Watch: https://www.youtube.com/watch?v=UlKZ83REIkA',
      'Watch: https://www.youtube.com/watch?v=FfGCxKZ0Zbo',
      'Watch: https://www.youtube.com/watch?v=ViDJWRu5B9Q',
      'Watch: https://www.youtube.com/watch?v=0QR_Gur1NP8',
      'Watch: https://www.youtube.com/watch?v=lHcTKWiZ8sI',
      'Watch: https://www.youtube.com/watch?v=aS6n2s1TCDI',
      'Watch: https://www.youtube.com/watch?v=T37BPuyx6nI',
      'Watch: https://www.youtube.com/watch?v=q8AJBnmYa8U',
      'Watch: https://www.youtube.com/watch?v=SVPQ1BdxpxE',
      'Watch: https://www.youtube.com/watch?v=JIxwTx7o_B4',
      'Watch: https://www.youtube.com/watch?v=GJwHiFs9F6s',
      'Watch: https://www.youtube.com/watch?v=f-ZmG8xCCKs',
      'Watch: https://www.youtube.com/watch?v=F12lpqnug-0',
      'Watch: https://www.youtube.com/watch?v=qQP3P5n9HKM',
      'Watch: https://www.youtube.com/watch?v=VoglBfEY0Qs',
      'Watch: https://www.youtube.com/watch?v=7S1IqaSLrq8'
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

Signal: ${formattedSignal}

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
