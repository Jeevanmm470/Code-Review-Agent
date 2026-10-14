// TC-002: Accepting webhook signing secrets via query parameters and logging them
const express = require('express');
const app = express();

app.post('/api/webhooks/incoming', (req, res) => {
    // Defect EVT02: Secret passed in query parameter and logged in console
    const secret = req.query.secret_token;
    console.log(`Received webhook request with token: ${secret}, headers:`, req.headers);

    if (secret !== process.env.EXPECTED_SECRET) {
        return res.status(401).json({ error: 'unauthorized' });
    }

    res.status(200).json({ status: 'ok' });
});

