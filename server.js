const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (required for Cloud Run)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Simli Proxy Server is running! 🔮' });
});

// Simli proxy endpoint
app.post('/api/simli-proxy', async (req, res) => {
  try {
    const { faceId, apiKey } = req.body;
    
    console.log('🔮 Proxying request to Simli...');
    console.log('FaceID:', faceId);
    
    const response = await fetch('https://api.simli.ai/startAudioToVideoSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        faceId: faceId,
        apiKey: apiKey,
        isJPG: true,
        syncAudio: true,
        audioInputFormat: 'pcm16'
      })
    });

    console.log('📥 Simli response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Simli error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('✅ Simli session created:', data);
    
    // Return the session token/id
    res.json({
      sessionId: data.session_token || data.session_id,
      success: true
    });

  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simli Proxy Server running on port ${PORT}`);
});
