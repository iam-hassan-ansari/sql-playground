# SQL Playground - Showroom DB (Demo)

A real SQLite database running entirely inside the browser - write and run SQL against a sample showroom dataset with no backend at all.

## Overview
This project demonstrates SQL and database skills interactively: it loads a real SQLite engine (compiled to WebAssembly) straight into the page, seeds it with a small "vehicle showroom" schema, and lets anyone type and run their own queries against it - joins, aggregates, filters - with results rendered as a table.

## Live Demo
Add the link here once this repo is deployed on GitHub Pages
(Settings -> Pages -> Deploy from branch -> main -> / (root))

Note: needs an internet connection even when run locally - the SQLite engine loads from a CDN (see below).

## Features
- **Real SQL, real SQLite** - not a simulation; every query genuinely executes via [sql.js](https://sql.js.org/)
- **Sample schema** - `customers`, `vehicles`, `sales`, pre-loaded with sample rows and a foreign-key relationship
- **Example queries** - one-click chips for common patterns (filter, join, `GROUP BY`)
- **Reset button** - restores the original sample data at any time
- **Keyboard shortcut** - Ctrl/Cmd+Enter to run the current query

## Tech Stack
- HTML5, CSS3, vanilla JavaScript
- [sql.js](https://sql.js.org/) (SQLite compiled to WebAssembly via Emscripten), loaded from cdnjs
- No backend, no build step - the entire database lives in the browser tab's memory

## How It Works - Code Walkthrough
- **Loading the engine**: `initSqlJs({ locateFile })` (from the `sql-wasm.js` script tag) asynchronously downloads and initializes the WebAssembly SQLite build. `locateFile` tells it where to find the matching `.wasm` binary on the same CDN.
- **Seeding data**: `buildDatabase()` creates a fresh in-memory `SQL.Database()` and runs `SCHEMA_SQL` - a single multi-statement string with three `CREATE TABLE` statements (including a `FOREIGN KEY` on `sales`) followed by `INSERT` statements with sample rows. `db.run()` executes a whole script like this in one call.
- **Running a query**: `db.exec(sql)` runs whatever the user typed and returns an array of result sets (one per statement), each with a `columns` array and a `values` array of row arrays. `runQuery()` turns that into an HTML table, or shows the engine's own error message (e.g. a typo in a column name) in a red error box - real SQL error messages, not custom validation.
- **Example chips**: each chip just fills the textarea with a canned query and runs it - a quick way to demonstrate `WHERE`, a two-table `JOIN`, and a `GROUP BY ... ORDER BY` aggregate without the visitor having to write SQL from scratch.
- **Reset**: re-runs `buildDatabase()` to throw away the in-memory database and rebuild it from the same seed script - nothing is ever persisted to disk, so a reload also gives a clean slate.

## Run Locally
Open `index.html` in a browser with an internet connection (it needs to fetch the SQLite engine from cdnjs on first load).

## Notes
- This is an original demo project built for portfolio purposes, using a fictional sample dataset.
- The SQL statements used here were also verified independently against Python's built-in SQLite engine to confirm correctness, since sql.js runs the same SQLite dialect.
