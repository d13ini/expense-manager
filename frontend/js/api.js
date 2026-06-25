// api.js — të gjitha komunikimin me backend
// BASE_URL: adresa bazë e API-t — nëse ndryshon porti, ndryshon vetëm këtu
const BASE_URL = 'http://localhost:3000/api';

// ─── CATEGORIES ───────────────────────────────────────

// Merr të gjitha kategoritë nga backend
async function getCategories() {
  const response = await fetch(`${BASE_URL}/categories`);
  return response.json();
}

// ─── EXPENSES ─────────────────────────────────────────

// Merr të gjitha shpenzimet
async function getExpenses() {
  const response = await fetch(`${BASE_URL}/expenses`);
  return response.json();
}

// Shto shpenzim të ri
// data = { amount, description, category_id, expense_date }
async function addExpense(data) {
  const response = await fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)   // konverto objektin JS në string JSON
  });
  return response.json();
}

// Fshi shpenzim sipas ID
async function deleteExpense(id) {
  const response = await fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE'
  });
  return response.json();
}