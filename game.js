const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMrGB2GLfTWfKlWLGvvUns0FFHMoiXtzTqJHPnF-vD1J3owNoxYRCRDMKO1yHqXaOdYAzwAdxNJXmM/pub?output=csv";

const DAILY_ANSWERS = {
  "2026-01-22": "Fitermil",
  "2026-01-23": "Trapane"
};

let DATA = [];
let ANSWER = null;
let guesses = [];

const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true;

const todayKey = "dailyGuess_" + new Date().toISOString().slice(0, 10);

const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset progress (test)";
resetBtn.onclick = () => {
  localStorage.removeItem(todayKey);
  guesses = [];
  document.getElementById("results").innerHTML = "";
  submitBtn.disabled = false;
  alert("Progress reset!");
};
document.body.insertBefore(resetBtn, submitBtn.nextSibling);

fetch(SHEET_URL)
  .then(res => res.text())
  .then(csvText => {
    const lines = csvText.trim().split("\n");

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

    loadProgress();
    submitBtn.disabled = !canPlayToday();
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

function loadProgress() {
  const savedProgress = JSON.parse(localStorage.getItem(todayKey) || "[]");
  guesses = savedProgress.slice();
  guesses.forEach(g => renderResult(g));
}

function canPlayToday() {
  if (!ANSWER) return false;
  // If correct guess already made
  if (guesses.some(g => g.name.toLowerCase() === ANSWER.name.toLowerCase())) return false;
  return guesses.length < 6;
}

function handleGuess() {
  if (!ANSWER) return;
  if (!canPlayToday()) return showEndScreen();

  const input = document.getElementById("guessInput").value.trim();
  if (!input) return alert("Please enter a name.");

  const guess = DATA.find(x => x.name.toLowerCase() === input.toLowerCase());
  if (!guess) return alert("Name not found in dataset.");

  guesses.push(guess);
  localStorage.setItem(todayKey, JSON.stringify(guesses));

  renderResult(guess);

  if (guess.name.toLowerCase() === ANSWER.name.toLowerCase()) {
    showEndScreen(true);
    submitBtn.disabled = true;
  } else if (guesses.length >= 6) {
    showEndScreen(false);
    submitBtn.disabled = true;
  }
}

function renderResult(guess) {
  const tbody = document.getElementById("results");
  const tr = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.textContent = guess.name;
  tr.appendChild(nameCell);

  ["status", "rank", "year", "month", "reinstate"].forEach(key => {
    const td = document.createElement("td");
    td.textContent = guess[key];
    td.classList.add(ANSWER[key] === guess[key] ? "correct" : "wrong");
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}

function showEndScreen(correct) {
  const message = document.createElement("div");
  message.style.marginTop = "20px";
  message.style.fontSize = "20px";
  message.style.fontWeight = "bold";

  if (correct) {
    message.textContent = `🎉 Correct! You got it in ${guesses.length} guess${guesses.length > 1 ? "es" : ""}.`;
  } else {
    message.textContent = `❌ All guesses used! The answer was: ${ANSWER.name}`;
  }

  submitBtn.disabled = true;
  document.getElementById("guessInput").disabled = true;

  document.body.appendChild(message);
}
