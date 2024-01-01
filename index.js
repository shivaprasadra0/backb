// server/app.js

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, './build')));

app.get('/api/top100cryptos', async (req, res) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
    const top100Cryptos = await response.json();
    res.json(top100Cryptos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/convert', async (req, res) => {
  const { sourceCrypto, amount, targetCurrency } = req.query;

  try {
    const cryptoPriceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${sourceCrypto}&vs_currencies=usd,eur`);
    const cryptoPriceData = await cryptoPriceResponse.json();

    const sourceCryptoPriceUSD = cryptoPriceData[sourceCrypto]?.usd;
    const sourceCryptoPriceEUR = cryptoPriceData[sourceCrypto]?.eur;

    if (!sourceCryptoPriceUSD || !sourceCryptoPriceEUR) {
      return res.status(400).json({ error: 'Invalid source cryptocurrency' });
    }

    const exchangeRateResponse = await fetch('https://api.coingecko.com/api/v3/exchange_rates');
    const exchangeRateData = await exchangeRateResponse.json();

    let convertedAmount;

    if (targetCurrency === 'usd') {
      convertedAmount = amount * sourceCryptoPriceUSD ;
    } else if (targetCurrency === 'eur') {
      convertedAmount = amount * sourceCryptoPriceEUR ;
    } else {
      return res.status(400).json({ error: 'Invalid target currency' });
    }

    res.json({
      sourceCrypto,
      amount,
      targetCurrency,
      convertedAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

