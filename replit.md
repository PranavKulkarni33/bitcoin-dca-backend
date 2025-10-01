# Bitcoin DCA Backend

## Overview
This is a Bitcoin Dollar Cost Averaging (DCA) notification system backend that monitors the Fear & Greed Index and sends alerts when market conditions suggest good buying opportunities.

**Current State:** Fully functional backend API running on port 3000

## Project Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Cloud Services:** AWS SNS (for email notifications)
- **External API:** Alternative.me Fear & Greed Index API

### Project Structure
```
.
├── index.js          # Main Express server and API endpoints
├── cron.js           # Cron job logic for automated alerts
├── package.json      # Dependencies and scripts
└── .env              # Environment variables (not tracked)
```

### Core Components

#### 1. Express Server (index.js)
- **Port:** 3000 (localhost)
- **Endpoints:**
  - `POST /send-alert` - Send DCA alert via AWS SNS (accepts: signal, fgIndex, rsi)
  - `POST /subscribe` - Subscribe email to alerts
  - `GET /fg-index` - Fetch current Fear & Greed Index
  - `GET /rsi` - Fetch current Bitcoin RSI (requires TAAPI_SECRET)
  - `GET /test-decision` - Test decision logic (query params: fgIndex, rsi)

#### 2. Cron Job (cron.js)
- Fetches Fear & Greed Index from Alternative.me API
- Fetches Bitcoin RSI from TAAPI.IO (if configured)
- Applies combined decision logic using both indicators
- Sends alert with both indicator values
- Can be triggered manually or scheduled

### Decision Logic
The system uses both the Fear & Greed Index and RSI (Relative Strength Index) to determine optimal buy signals:

**Combined Indicator Logic:**
- **EXTREME_BUY Signal:**
  - Extreme Fear (< 25) + Oversold RSI (< 30), OR
  - Extreme Fear (< 25) + Near Oversold RSI (< 40), OR
  - Fear (< 40) + Oversold RSI (< 30)
  
- **BUY Signal:**
  - Fear (< 40) + Near Oversold RSI (< 40)

**Backward Compatibility:**
- If RSI is not available (TAAPI_SECRET not configured):
  - Extreme Fear (< 25) → EXTREME_BUY
  - Fear (25-39) → BUY
  - Neutral/Greed (≥ 40) → No action

**RSI Thresholds:**
- Oversold: RSI < 30 (strong buy signal)
- Near Oversold: RSI < 40 (moderate buy signal)
- Normal/Overbought: RSI ≥ 40 (no action)

## Environment Variables

Required AWS credentials and configuration:
- `AWS_REGION` - AWS region for SNS
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `SNS_TOPIC_ARN` - SNS topic ARN for alerts
- `ALERT_API_URL` - URL of this API (for cron job callbacks)
- `TAAPI_SECRET` - (Optional) TAAPI.IO API key for RSI data (free tier available at https://taapi.io)
- `FORCE_VALUE` - (Optional) Override Fear & Greed Index for testing

## Setup and Running

### Installation
Dependencies are installed automatically. To manually reinstall:
```bash
npm install
```

### Running the Server
The server is configured to run automatically via the "Backend Server" workflow:
```bash
npm start
```

### Testing Endpoints
```bash
# Get current Fear & Greed Index
curl http://localhost:3000/fg-index

# Get current Bitcoin RSI (requires TAAPI_SECRET)
curl http://localhost:3000/rsi

# Test decision logic with both indicators
curl "http://localhost:3000/test-decision?fgIndex=25&rsi=35"

# Test decision logic with Fear & Greed only (backward compatible)
curl "http://localhost:3000/test-decision?fgIndex=20"

# Subscribe to alerts (requires AWS SNS configuration)
curl -X POST http://localhost:3000/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Example Decision Logic Scenarios
```bash
# EXTREME_BUY: Extreme Fear + Oversold RSI
curl "http://localhost:3000/test-decision?fgIndex=20&rsi=28"
# Response: {"fgIndex":20,"rsi":28,"signal":"EXTREME_BUY"}

# BUY: Fear + Near Oversold RSI
curl "http://localhost:3000/test-decision?fgIndex=25&rsi=35"
# Response: {"fgIndex":25,"rsi":35,"signal":"BUY"}

# EXTREME_BUY: Fear + Oversold RSI
curl "http://localhost:3000/test-decision?fgIndex=38&rsi=29"
# Response: {"fgIndex":38,"rsi":29,"signal":"EXTREME_BUY"}

# No signal: Neither indicator in buy zone
curl "http://localhost:3000/test-decision?fgIndex=35&rsi=50"
# Response: {"fgIndex":35,"rsi":50,"signal":null}
```

### Running the Cron Job
```bash
node cron.js
```

## Recent Changes
- **2025-10-01:** Enhanced with RSI indicator
  - Added RSI (Relative Strength Index) support via TAAPI.IO API
  - Updated decision logic to combine Fear & Greed Index + RSI
  - Added new `/rsi` endpoint to fetch current Bitcoin RSI
  - Enhanced `/test-decision` endpoint to accept both fgIndex and rsi parameters
  - Updated alert messages to include both indicator values
  - Maintained backward compatibility when RSI is not available
  
- **2025-10-01:** Initial Replit setup
  - Configured workflow for backend server
  - Added npm start script to package.json
  - Verified all endpoints working correctly
  - Server running on port 3000 with localhost binding

## Notes
- The backend uses CORS with specific allowed origins
- AWS SNS is used for email notifications - requires valid AWS credentials
- The Fear & Greed Index is fetched from a free public API (Alternative.me)
- RSI data is fetched from TAAPI.IO (requires free API key from https://taapi.io)
- The system works with or without RSI - maintains backward compatibility
- No frontend - this is a pure backend API service

## Getting Started with RSI

To enable RSI integration:
1. Sign up for a free TAAPI.IO account at https://taapi.io
2. Get your API secret key from the dashboard
3. Add `TAAPI_SECRET=your_secret_key` to your `.env` file
4. The system will automatically start using RSI in decision logic
5. Free tier supports up to 5 crypto pairs with basic rate limits
