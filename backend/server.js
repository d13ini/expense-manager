const express = require('express');
const app     = express();
const PORT    = 3000;

// Middleware — lexon JSON nga body i kërkesave
app.use(express.json());

// Importo routes
const categoryRoutes = require('./routes/categories');
const expenseRoutes  = require('./routes/expenses');

// Lidh routes me URL-të përkatëse
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses',   expenseRoutes);

// Route test
app.get('/', (req, res) => {
  res.json({ message: '✅ Expense Manager API është aktiv' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveri po dëgjon në http://localhost:${PORT}`);
});