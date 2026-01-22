const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMrGB2GLfTWfKlWLGvvUns0FFHMoiXtzTqJHPnF-vD1J3owNoxYRCRDMKO1yHqXaOdYAzwAdxNJXmM/pub?output=csv";

const DAILY_ANSWERS = {
  "2026-01-22": "Fitermil",
  "2026-01-23": "Trapane"
};

let DATA = [];
let ANSWER = null;

const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true;

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csvText => {
    const lines = csvText.trim().split("\n");

    const headers = lines[0].split(",");

    DATA = lines.slice(1).map(line => {
      const values = line.split(",");
      return {
        name: values[0]?.trim() ?? "",
        status: values[1]?.trim() ?? "",
        rank: values[2]?.trim() ?? "",
        year: values[3]?.trim() ?? "",
        month: values[4]?.trim() ?? "",
        reinstate: values[5]?.trim() ?? ""
      };
    });

    ANSWER = getDailyAnswer(DATA);
    submitBtn.disabled = false;
  })
  .catch(err => {
    console.error("Error loading CSV:", err);
    alert("Failed to load CSV. Check your URL and publish settings.");
  });

function getDailyAnswer(data) {
  const today = new Date().toISOString().slice(0, 10);
  const name = DAILY_ANSWERS[today];
  if (!name) return null;

  return data.find(x => x.name.toLowerCase() === name.toLowerCase());
}

function handleGuess() {
  if (!ANSWER) return;

  const input = document.getElementById("guessInput").value.trim();
  if (!input) return alert("Please enter a name.");

  const guess = DATA.find(x => x.name.toLowerCase() === input.toLowerCase());
  if (!guess) return alert("Name not found in dataset.");

  renderResult(guess);
}

function renderResult(guess) {
  const tbody = document.getElementById("results");

  // Create a new row for this guess
  const tr = document.createElement("tr");

  // Name column
  const nameCell = document.createElement("td");
  nameCell.textContent = guess.name;
  tr.appendChild(nameCell);

  // Add each field as a colored cell
  ["status", "rank", "year", "month", "reinstate"].forEach(key => {
    const td = document.createElement("td");
    td.textContent = guess[key];

    if (ANSWER[key] === guess[key]) {
      td.classList.add("correct");
    } else {
      td.classList.add("wrong");
    }

    tr.appendChild(td);
  });

  // Append this guess row to the table
  tbody.appendChild(tr);
}
