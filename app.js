/* =========================================================
   SQL Playground (Demo)
   Runs real SQLite in the browser via sql.js (SQLite compiled
   to WebAssembly). No backend, no server round-trip — every
   query executes on-device.
   ========================================================= */

const SCHEMA_SQL = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  phone TEXT
);

CREATE TABLE vehicles (
  id INTEGER PRIMARY KEY,
  model TEXT NOT NULL,
  category TEXT,
  price INTEGER,
  stock INTEGER
);

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  vehicle_id INTEGER,
  sale_date TEXT,
  quantity INTEGER,
  total_amount INTEGER,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

INSERT INTO customers (id, name, city, phone) VALUES
 (1, 'Ravi Kumar', 'Malegaon', '9876500001'),
 (2, 'Sunita Deshmukh', 'Nashik', '9876500002'),
 (3, 'Farhan Qureshi', 'Malegaon', '9876500003'),
 (4, 'Ayesha Sheikh', 'Dhule', '9876500004');

INSERT INTO vehicles (id, model, category, price, stock) VALUES
 (1, 'Zephyr 125', 'Motorcycle', 85000, 6),
 (2, 'Raptor 150', 'Motorcycle', 110000, 4),
 (3, 'Cruiser X', 'Motorcycle', 145000, 3),
 (4, 'CityLine', 'Hatchback', 650000, 5),
 (5, 'Voyager', 'Sedan', 920000, 3),
 (6, 'Trailblazer', 'SUV', 1280000, 2);

INSERT INTO sales (id, customer_id, vehicle_id, sale_date, quantity, total_amount) VALUES
 (1, 1, 2, '2026-06-03', 1, 110000),
 (2, 2, 4, '2026-06-10', 1, 650000),
 (3, 3, 1, '2026-07-01', 2, 170000),
 (4, 4, 5, '2026-07-15', 1, 920000),
 (5, 1, 3, '2026-08-02', 1, 145000);
`;

const EXAMPLES = [
  "SELECT * FROM vehicles;",
  "SELECT * FROM customers;",
  "SELECT model, price FROM vehicles WHERE category = 'Motorcycle';",
  `SELECT c.name, v.model, s.quantity, s.total_amount
FROM sales s
JOIN customers c ON c.id = s.customer_id
JOIN vehicles v ON v.id = s.vehicle_id;`,
  `SELECT v.category, SUM(s.total_amount) AS revenue
FROM sales s JOIN vehicles v ON v.id = s.vehicle_id
GROUP BY v.category
ORDER BY revenue DESC;`,
  "SELECT model, stock FROM vehicles WHERE stock < 4;",
];

let db;

function buildDatabase(SQL) {
  const database = new SQL.Database();
  database.run(SCHEMA_SQL);
  return database;
}

function renderSchema() {
  const grid = document.getElementById("schema-grid");
  const tables = [
    { name: "customers", cols: ["id", "name", "city", "phone"] },
    { name: "vehicles", cols: ["id", "model", "category", "price", "stock"] },
    { name: "sales", cols: ["id", "customer_id", "vehicle_id", "sale_date", "quantity", "total_amount"] },
  ];
  grid.innerHTML = tables
    .map((t) => `<div class="schema-table"><h4>${t.name}</h4><ul>${t.cols.map((c) => `<li>${c}</li>`).join("")}</ul></div>`)
    .join("");
}

function renderChips() {
  const wrap = document.getElementById("example-chips");
  wrap.innerHTML = EXAMPLES.map((q, i) => `<span class="chip" data-idx="${i}">${q.split("\n")[0].slice(0, 40)}${q.length > 40 ? "…" : ""}</span>`).join("");
  wrap.addEventListener("click", (e) => {
    const idx = e.target.dataset.idx;
    if (idx === undefined) return;
    document.getElementById("sql-input").value = EXAMPLES[idx];
    runQuery();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function runQuery() {
  const sql = document.getElementById("sql-input").value.trim();
  const errorBox = document.getElementById("query-error");
  const resultArea = document.getElementById("result-area");
  errorBox.style.display = "none";
  resultArea.innerHTML = "";
  if (!sql) return;

  try {
    const results = db.exec(sql);
    if (results.length === 0) {
      resultArea.innerHTML = `<p class="muted">Query ran successfully — no rows returned.</p>`;
      return;
    }
    results.forEach((res) => {
      const meta = `<div class="result-meta">${res.values.length} row(s)</div>`;
      const head = `<tr>${res.columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
      const rows = res.values.map((row) => `<tr>${row.map((v) => `<td>${v === null ? "<em>NULL</em>" : escapeHtml(v)}</td>`).join("")}</tr>`).join("");
      resultArea.innerHTML += `${meta}<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
    });
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = "block";
  }
}

document.getElementById("btn-run").addEventListener("click", runQuery);
document.getElementById("sql-input").addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runQuery();
});
document.getElementById("btn-reset").addEventListener("click", () => {
  db = buildDatabase(window.__SQL);
  document.getElementById("query-error").style.display = "none";
  document.getElementById("result-area").innerHTML = `<p class="muted">Database reset to its original sample data.</p>`;
});

/* ---------------- init sql.js ---------------- */
initSqlJs({ locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` })
  .then((SQL) => {
    window.__SQL = SQL;
    db = buildDatabase(SQL);
    document.getElementById("engine-status").textContent = "SQLite engine ready";
    renderSchema();
    renderChips();
    runQuery();
  })
  .catch((err) => {
    document.getElementById("engine-status").textContent = "Failed to load SQLite engine";
    document.getElementById("query-error").style.display = "block";
    document.getElementById("query-error").textContent =
      "Could not load sql.js from the CDN. Check your internet connection and reload. (" + err.message + ")";
  });
