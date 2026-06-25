// main.js — inicializimi dhe event listeners

// ─── INICIALIZIMI ─────────────────────────────────────

// Kur faqja ngarkohet, merr të dhënat nga API
document.addEventListener('DOMContentLoaded', async () => {
  // vendos datën e sotme si default në input
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  await loadCategories();
  await loadExpenses();
});

// ─── LOAD FUNCTIONS ───────────────────────────────────

async function loadCategories() {
  try {
    const categories = await getCategories();
    renderCategories(categories);
  } catch (err) {
    showMessage('Gabim gjatë ngarkimit të kategorive', 'error');
  }
}

async function loadExpenses() {
  try {
    const expenses = await getExpenses();
    renderExpenses(expenses);
    renderStats(expenses);
  } catch (err) {
    showMessage('Gabim gjatë ngarkimit të shpenzimeve', 'error');
  }
}

// ─── EVENT LISTENERS ──────────────────────────────────

// Butoni "Shto Shpenzim"
document.getElementById('btn-add').addEventListener('click', async () => {
  const amount      = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const category_id = document.getElementById('category').value;
  const date        = document.getElementById('date').value;

  // validim në frontend para se të dërgojmë te backend
  if (!amount || amount <= 0) {
    showMessage('Shuma duhet të jetë më e madhe se 0', 'error');
    return;
  }

  if (!date) {
    showMessage('Zgjidh një datë', 'error');
    return;
  }

  try {
    await addExpense({
      amount:       parseFloat(amount),
      description:  description || null,
      category_id:  category_id || null,
      expense_date: date
    });

    showMessage('Shpenzimi u shtua me sukses!');
    clearForm();

    // vendos datën e sotme përsëri pas pastrimit
    document.getElementById('date').value = new Date().toISOString().split('T')[0];

    await loadExpenses(); // rifresko listën
  } catch (err) {
    showMessage('Gabim gjatë shtimit të shpenzimit', 'error');
  }
});

// ─── DELETE ───────────────────────────────────────────

// Kjo funksion thirret nga onclick në ui.js
async function handleDelete(id) {
  if (!confirm('A je i sigurt që dëshiron ta fshish këtë shpenzim?')) return;

  try {
    await deleteExpense(id);
    showMessage('Shpenzimi u fshi!');
    await loadExpenses(); // rifresko listën
  } catch (err) {
    showMessage('Gabim gjatë fshirjes', 'error');
  }
}