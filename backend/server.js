const express = require('express');
const app     = express();
const PORT    = 3000;

// Middleware — i thotë Express të lexojë JSON nga body i kërkesave
app.use(express.json());

// Route test — konfirmon që serveri punon
app.get('/', (req, res) => {
  res.json({ message: '✅ Expense Manager API është aktiv' });
});

// Importo routes (i shtojmë pas)
// const expenseRoutes  = require('./routes/expenses');
// const categoryRoutes = require('./routes/categories');
// app.use('/api/expenses',   expenseRoutes);
// app.use('/api/categories', categoryRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Serveri po dëgjon në http://localhost:${PORT}`);
});