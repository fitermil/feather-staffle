const SHEET_ID = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMrGB2GLfTWfKlWLGvvUns0FFHMoiXtzTqJHPnF-vD1J3owNoxYRCRDMKO1yHqXaOdYAzwAdxNJXmM/pubhtml";
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let DATA = [];
let ANSWER = null;

// Load data from Google Sheets
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    DATA = json.table.rows.map(r => ({
      name: r.c[0]?.v ?? "",
      status: r.c[1]?.v ?? "",
      rank: r.c[2]?.v ?? "",
      year: r.c[3]?.v ?? "",
      month: r.c[4]?.v ?? ""
      reinstate: r.c[5]?.v ?? ""
    }));

    ANSWER = getDailyAnswer(DATA);
  });

const DAILY_ANSWERS = {
  "2026-01-22": "Fitermil",
  "2026-01-23": "Trapane"
};

function getDailyAnswer(data) {
  const today = new Date().toISOString().slice(0, 10);
  const name = DAILY_ANSWERS[today];

  if (!name) {
    console.error("No hardcoded answer for today");
    return null;
  }

  return data.find(
    x => x.name.toLowerCase() === name.toLowerCase()
  );
}

function handleGuess() {
  if (!ANSWER) return;

  const input = document.getElementById("guessInput").value.trim();

  const guess = DATA.find(
    x => x.name.toLowerCase() === input.toLowerCase()
  );

  if (!guess) {
    alert("Name not found");
    return;
  }

  renderResult(guess);
}

function renderResult(guess) {
  const tbody = document.getElementById("results");
  tbody.innerHTML = "";

  ["status", "rank", "year", "month", "reinstate"].forEach(key => {
    const tr = document.createElement("tr");

    const match = guess[key] === ANSWER[key];

    tr.innerHTML = `
      <td>${key}</td>
      <td>${guess[key]}</td>
      <td>${match ? "YES" : "NO"}</td>
    `;

    tbody.appendChild(tr);
  });
}
