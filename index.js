// server/app.js

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, './build')));

app.get('/api/top100cryptos', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    });

    const top100Cryptos = response.data;
    res.json(top100Cryptos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/convert', async (req, res) => {
  const { sourceCrypto, amount, targetCurrency } = req.query;

  try {
    const cryptoPriceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: sourceCrypto,
        vs_currencies: 'usd',
      },
    });

    const sourceCryptoPrice = cryptoPriceResponse.data[sourceCrypto]?.usd;

    if (!sourceCryptoPrice) {
      return res.status(400).json({ error: 'Invalid source cryptocurrency' });
    }

    const exchangeRateResponse = await axios.get('https://api.coingecko.com/api/v3/exchange_rates');

    const targetCurrencyRate = exchangeRateResponse.data.rates[targetCurrency];

    if (!targetCurrencyRate) {
      return res.status(400).json({ error: 'Invalid target currency' });
    }

    const convertedAmount = amount * sourceCryptoPrice * targetCurrencyRate.value;

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
