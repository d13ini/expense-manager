const express    = require('express');
const cors       = require('cors');
const cron       = require('node-cron');
require('dotenv').config();

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const categoryRoutes    = require('./routes/categories');
const expenseRoutes     = require('./routes/expenses');
const statsRoutes       = require('./routes/stats');
const alertConfigRoutes = require('./routes/alertConfig'); // E RE

app.use('/api/categories',   categoryRoutes);
app.use('/api/expenses',     expenseRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/alert-config', alertConfigRoutes); // E RE

const { checkAndSendAlert, sendWeeklyReport, sendMonthlyReport } = require('./services/emailService');

cron.schedule('0 20 * * *', () => checkAndSendAlert());
cron.schedule('0 8 * * 1',  () => sendWeeklyReport());
cron.schedule('0 8 1 * *',  () => sendMonthlyReport());

app.get('/', (req, res) => {
  res.json({ message: '✅ Expense Manager API është aktiv' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveri po dëgjon në http://localhost:${PORT}`);
});

