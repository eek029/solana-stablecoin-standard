import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// Internal endpoint called by the Indexer
app.post('/dispatch', (req, res) => {
  const payload = req.body;
  
  console.log(`[Webhook] Received internal payload:`, payload);
  console.log(`[Webhook] Simulating configurable notifications...`);
  
  // Here we would implement retry logic, queuing with Redis, and sending
  // HTTP POSTs out to configured client destinations (e.g. Sanctions Tracker endpoints)
  setTimeout(() => {
    console.log(`[Webhook] ✔ Successfully dispatched ${payload.eventType} to remote clients.`);
  }, 1000);

  res.json({ status: 'queued', id: Date.now().toString() });
});

app.listen(PORT, () => {
  console.log(`[Webhook] Service running on port ${PORT}`);
});
