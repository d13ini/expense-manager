const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 3000;

app.use(cors());
app.use(express.json());

const categoryRoutes = require('./routes/categories');
const expenseRoutes  = require('./routes/expenses');
const statsRoutes    = require('./routes/stats');      // E RE

app.use('/api/categories', categoryRoutes);
app.use('/api/expenses',   expenseRoutes);
app.use('/api/stats',      statsRoutes);               // E RE

app.get('/', (req, res) => {
  res.json({ message: '✅ Expense Manager API është aktiv' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveri po dëgjon në http://localhost:${PORT}`);
});