// ---------------------------
// CONFIG
// ---------------------------

// Published Google Sheet URL in gviz JSON format
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMrGB2GLfTWfKlWLGvvUns0FFHMoiXtzTqJHPnF-vD1J3owNoxYRCRDMKO1yHqXaOdYAzwAdxNJXmM/gviz/tq?tqx=out:json";

// Hardcoded daily answers (YYYY-MM-DD: name)
const DAILY_ANSWERS = {
  "2026-01-22": "Fitermil",
  "2026-01-23": "Trapane"
};

// ---------------------------
// GLOBALS
// ---------------------------
let DATA = [];
let ANSWER = null;

// ---------------------------
// LOAD DATA FROM GOOGLE SHEETS
// ---------------------------
const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true; // disable until data loads

fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    // Remove gviz wrapper
    const json = JSON.parse(text.substring(47).slice(0, -2));

    // Map sheet rows to JS objects
    DATA = json.table.rows.map(r => ({
      name: r.c[0]?.v ?? "",
      status: r.c[1]?.v ?? "",
      rank: r.c[2]?.v ?? "",
      year: r.c[3]?.v ?? "",
      month: r.c[4]?.v ?? "",
      reinstate: r.c[5]?.v ?? ""
    }));

    // Set today's answer
    ANSWER = getDailyAnswer(DATA);

    if (!ANSWER) {
      alert("No hardcoded answer for today!");
    }

    // Enable the submit button now that data is ready
    submitBtn.disabled = false;
  })
  .catch(err => {
    console.error("Error loading Google Sheet:", err);
    alert("Failed to load data. Check your sheet URL and permissions.");
  });

// ---------------------------
// GET DAILY ANSWER
// ---------------------------
function getDailyAnswer(data) {
  const today = new Date().toISOString().slice(0, 10);
  const name = DAILY_ANSWERS[today];

  if (!name) return null;

  return data.find(x => x.name.toLowerCase() === name.toLowerCase());
}

// ---------------------------
// HANDLE GUESS
// ---------------------------
function handleGuess() {
  if (!ANSWER) return;

  const input = document.getElementById("guessInput").value.trim();
  if (!input) return alert("Please enter a name.");

  const guess = DATA.find(x => x.name.toLowerCase() === input.toLowerCase());
  if (!guess) return alert("Name not found in dataset.");

  renderResult(guess);
}

// ---------------------------
// RENDER RESULTS
// ---------------------------
function renderResult(guess) {
  const tbody = document.getElementById("results");
  tbody.innerHTML = "";

  // Fields to check
  ["status", "rank", "year", "month", "reinstate"].forEach(key => {
    const tr = document.createElement("tr");
    const match = guess[key] === ANSWER[key];

    tr.innerHTML = `
      <td>${key}</td>
      <td>${guess[key]}</td>
      <td style="color: ${match ? "green" : "red"}">${match ? "YES" : "NO"}</td>
    `;
    tbody.appendChild(tr);
  });
}
