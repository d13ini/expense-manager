const nodemailer = require('nodemailer');
const pool       = require('../db');

// ─── KONFIGURIMI I TRANSPORTIT ────────────────────────
// transporter = lidhja me Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function checkAndSendAlert() {
  try {
    // merr totalin mujor
    const totalResult = await pool.query(`
      SELECT SUM(amount) AS total
      FROM expenses
      WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // merr konfigurimin nga DB
    const configResult = await pool.query(
      'SELECT * FROM alert_config WHERE id = 1'
    );

    const total  = parseFloat(totalResult.rows[0].total) || 0;
    const config = configResult.rows[0];
    const limit  = parseFloat(config?.monthly_limit) || parseFloat(process.env.ALERT_LIMIT) || 500;
    const email  = config?.email || process.env.ALERT_EMAIL;

    if (total >= limit) {
      // merr analizën sipas kategorisë
      const analysisResult = await pool.query(`
        SELECT 
          c.name              AS category,
          c.color             AS color,
          SUM(e.amount)       AS total,
          COUNT(*)            AS count,
          ROUND(SUM(e.amount) / $1 * 100, 1) AS percentage
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY c.name, c.color
        ORDER BY total DESC
      `, [total]);

      const rows = analysisResult.rows.map(r => `
        <tr>
          <td style="padding:8px">
            <span style="background:${r.color};color:white;padding:2px 8px;border-radius:12px;font-size:12px">
              ${r.category || 'Pa kategori'}
            </span>
          </td>
          <td style="padding:8px;text-align:right"><strong>€${parseFloat(r.total).toFixed(2)}</strong></td>
          <td style="padding:8px;text-align:right">${r.count} shpenzime</td>
          <td style="padding:8px;text-align:right">${r.percentage}%</td>
        </tr>
      `).join('');

      await transporter.sendMail({
        from:    process.env.EMAIL_USER,
        to:      email,
        subject: `⚠️ Keni arritur limitin mujor — €${total.toFixed(2)}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#ef4444">⚠️ Alert: Limiti Mujor u Arrit</h2>
            
            <div style="background:#fee2e2;padding:16px;border-radius:8px;margin-bottom:24px">
              <p>Keni shpenzuar <strong>€${total.toFixed(2)}</strong> këtë muaj.</p>
              <p>Limiti juaj është <strong>€${limit.toFixed(2)}</strong>.</p>
              <p>Keni tejkaluar me <strong style="color:#ef4444">€${(total - limit).toFixed(2)}</strong>.</p>
            </div>

            <h3 style="color:#1e293b">📊 Analiza sipas Kategorisë</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr style="background:#f1f5f9">
                <th style="padding:8px;text-align:left">Kategoria</th>
                <th style="padding:8px;text-align:right">Totali</th>
                <th style="padding:8px;text-align:right">Nr.</th>
                <th style="padding:8px;text-align:right">%</th>
              </tr>
              ${rows}
            </table>

            <p style="color:#64748b;font-size:12px">
              Ky email u dërgua automatikisht nga Menaxhuesi i Shpenzimeve.
            </p>
          </div>
        `
      });

      console.log(`✅ Alert email u dërgua — total: €${total.toFixed(2)}`);
    }
  } catch (err) {
    console.error('❌ Gabim gjatë dërgimit të alert:', err.message);
  }
}

// ─── RAPORT JAVOR ─────────────────────────────────────
async function sendWeeklyReport() {
  try {
    const result = await pool.query(`
      SELECT 
        SUM(e.amount)       AS total,
        COUNT(*)            AS count,
        c.name              AS category,
        SUM(e.amount)       AS category_total
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.expense_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY c.name
      ORDER BY category_total DESC
    `);

    const total = result.rows.reduce((sum, r) => sum + parseFloat(r.total), 0);

    const rows = result.rows.map(r => `
      <tr>
        <td>${r.category || 'Pa kategori'}</td>
        <td>€${parseFloat(r.category_total).toFixed(2)}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from:    process.env.EMAIL_USER,
      to:      process.env.ALERT_EMAIL,
      subject: `📊 Raporti Javor i Shpenzimeve`,
      html: `
        <h2>📊 Raporti Javor</h2>
        <p>Periudha: 7 ditët e fundit</p>
        <p>Totali: <strong>€${total.toFixed(2)}</strong></p>
        <table border="1" cellpadding="8" style="border-collapse:collapse">
          <tr><th>Kategoria</th><th>Totali</th></tr>
          ${rows}
        </table>
      `
    });
    console.log('✅ Raport javor u dërgua');
  } catch (err) {
    console.error('❌ Gabim gjatë raportit javor:', err.message);
  }
}

// ─── RAPORT MUJOR ─────────────────────────────────────
async function sendMonthlyReport() {
  try {
    const result = await pool.query(`
      SELECT 
        c.name              AS category,
        SUM(e.amount)       AS category_total,
        COUNT(*)            AS count
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      GROUP BY c.name
      ORDER BY category_total DESC
    `);

    const total = result.rows.reduce((sum, r) => sum + parseFloat(r.category_total), 0);

    const rows = result.rows.map(r => `
      <tr>
        <td>${r.category || 'Pa kategori'}</td>
        <td>€${parseFloat(r.category_total).toFixed(2)}</td>
        <td>${r.count}</td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from:    process.env.EMAIL_USER,
      to:      process.env.ALERT_EMAIL,
      subject: `📈 Raporti Mujor i Shpenzimeve`,
      html: `
        <h2>📈 Raporti Mujor</h2>
        <p>Totali i muajit të kaluar: <strong>€${total.toFixed(2)}</strong></p>
        <table border="1" cellpadding="8" style="border-collapse:collapse">
          <tr><th>Kategoria</th><th>Totali</th><th>Nr. Shpenzimeve</th></tr>
          ${rows}
        </table>
      `
    });
    console.log('✅ Raport mujor u dërgua');
  } catch (err) {
    console.error('❌ Gabim gjatë raportit mujor:', err.message);
  }
}

module.exports = { checkAndSendAlert, sendWeeklyReport, sendMonthlyReport };