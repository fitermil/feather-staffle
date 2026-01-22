const SHEET_ID = "YOUR_SHEET_ID_HERE";
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vTMrGB2GLfTWfKlWLGvvUns0FFHMoiXtzTqJHPnF-vD1J3owNoxYRCRDMKO1yHqXaOdYAzwAdxNJXmM/pubhtml`;

let DATA = [];
let ANSWER = null;

// Load data from Google Sheets
fetch(SHEET_URL)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    DATA = json.table.rows.map(r => ({
      name: r.c[0]?.v ?? "",
      role: r.c[1]?.v ?? "",
      year: r.c[2]?.v ?? "",
      month: r.c[3]?.v ?? "",
      addRole: r.c[4]?.v ?? "",
      status: r.c[5]?.v ?? ""
    }));

    ANSWER = getDailyAnswer(DATA);
  });

function getDailyAnswer(data) {
  const day = Math.floor(Date.now() / 86400000);
  return data[day % data.length];
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

  ["role", "year", "month", "addRole", "status"].forEach(key => {
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
