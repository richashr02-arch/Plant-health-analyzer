const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS to allow requests from your React frontend
app.use(cors());

const SHEET_ID = '1zmXD0dlAEBpJYcwwXCm6DNwE-1M30h3Di5Y7dSlm8q0';
// We use the export endpoint which is reliable for server-side fetching
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

app.get('/api/reviews', async (req, res) => {
  try {
    console.log('Fetching data from Google Sheets...');
    const response = await fetch(GOOGLE_SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Google Sheets responded with ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Check if we got HTML instead of CSV (common issue with permissions)
    if (text.trim().startsWith("<!DOCTYPE html") || text.includes("google.com/accounts")) {
       console.error("Error: Retrieved HTML login page instead of CSV.");
       return res.status(403).json({ error: "Sheet is not public or requires auth." });
    }

    // Send the raw CSV text back to the frontend
    res.header('Content-Type', 'text/csv');
    res.send(text);
    console.log('Data successfully sent to frontend.');
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});