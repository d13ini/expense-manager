const express = require('express');
const cors    = require('cors');  // lejo kërkesa nga porte të ndryshme
const app     = express();
const PORT    = 3000;

app.use(cors());        // aktivizo CORS për të gjitha routes
app.use(express.json());

const categoryRoutes = require('./routes/categories');
const expenseRoutes  = require('./routes/expenses');

app.use('/api/categories', categoryRoutes);
app.use('/api/expenses',   expenseRoutes);

app.get('/', (req, res) => {
  res.json({ message: '✅ Expense Manager API është aktiv' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveri po dëgjon në http://localhost:${PORT}`);
});