const first = document.getElementById("first");
const second = document.getElementById("second");
const calculate = document.getElementById("calculate");
const resultValue = document.querySelector("#result strong");
const historyList = document.getElementById("historyList");
const clearHistory = document.getElementById("clearHistory");
const themeToggle = document.getElementById("themeToggle");
const operators = document.querySelectorAll(".operator");

let selectedOp = "+";

let history = JSON.parse(
  localStorage.getItem("quickcalc-history") || "[]"
);

// -------------------------
// Räknesätt
// -------------------------

operators.forEach((button) => {
  button.addEventListener("click", () => {
    operators.forEach((b) => b.classList.remove("active"));

    button.classList.add("active");

    selectedOp = button.dataset.op;

    // Liten haptisk feedback på iPhone
    if (navigator.vibrate) {
      navigator.vibrate(8);
    }
  });
});

// -------------------------
// Hjälpfunktioner
// -------------------------

function formatNumber(value) {
  return Number.isInteger(value)
    ? String(value)
    : Number(value.toFixed(8)).toString();
}

function calculateResult(a, b, op) {
  switch (op) {
    case "+":
      return a + b;

    case "-":
      return a - b;

    case "*":
      return a * b;

    case "/":
      return b === 0 ? null : a / b;

    default:
      return null;
  }
}

function operatorSymbol(op) {
  return {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  }[op];
}

// -------------------------
// Toast
// -------------------------

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

// -------------------------
// Historik
// -------------------------

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML =
      '<p class="empty">Dina senaste beräkningar visas här.</p>';

    return;
  }

  historyList.innerHTML = history
    .map(
      (item, index) => `
        <div class="history-item" data-index="${index}">
          <button
            class="history-main"
            type="button"
            aria-label="Använd ${item.a} ${operatorSymbol(item.op)} ${item.b}"
          >
            <span class="expression">
              ${item.a} ${operatorSymbol(item.op)} ${item.b}
            </span>

            <span class="history-result">
              ${item.result}
            </span>
          </button>

          <button
            class="delete-history"
            type="button"
            data-delete="${index}"
            aria-label="Ta bort beräkning"
          >
            ×
          </button>
        </div>
      `
    )
    .join("");

  // Klick på historik → återanvänd beräkningen
  document.querySelectorAll(".history-main").forEach((button) => {
    button.addEventListener("click", () => {
      const item = history[
        Number(button.closest(".history-item").dataset.index)
      ];

      first.value = item.a;
      second.value = item.b;

      selectedOp = item.op;

      operators.forEach((operator) => {
        operator.classList.toggle(
          "active",
          operator.dataset.op === selectedOp
        );
      });

      resultValue.textContent = item.result;

      showToast("Beräkning återanvänd");
    });
  });

  // Ta bort enskild historikpost
  document.querySelectorAll(".delete-history").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const index = Number(button.dataset.delete);

      history.splice(index, 1);

      saveHistory();
      renderHistory();

      showToast("Borttagen");
    });
  });
}

function saveHistory() {
  localStorage.setItem(
    "quickcalc-history",
    JSON.stringify(history)
  );
}

// -------------------------
// Beräkna
// -------------------------

function performCalculation() {
  const a = Number(first.value);
  const b = Number(second.value);

  if (first.value === "" || second.value === "") {
    resultValue.textContent = "Fyll i båda";
    showToast("Fyll i båda talen");
    return;
  }

  const result = calculateResult(a, b, selectedOp);

  if (result === null) {
    resultValue.textContent = "Kan inte dela med 0";
    showToast("Kan inte dela med 0");
    return;
  }

  const formatted = formatNumber(result);

  resultValue.textContent = formatted;

  history.unshift({
    a: formatNumber(a),
    b: formatNumber(b),
    op: selectedOp,
    result: formatted,
  });

  // Behåll max 10 beräkningar
  history = history.slice(0, 10);

  saveHistory();
  renderHistory();

  if (navigator.vibrate) {
    navigator.vibrate(12);
  }
}

calculate.addEventListener("click", performCalculation);

// Enter på tangentbordet
[first, second].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performCalculation();
    }
  });
});

// -------------------------
// Rensa historik
// -------------------------

clearHistory.addEventListener("click", () => {
  if (!history.length) {
    showToast("Historiken är redan tom");
    return;
  }

  history = [];

  localStorage.removeItem("quickcalc-history");

  renderHistory();

  showToast("Historiken rensad");
});

// -------------------------
// Dark / Light mode
// -------------------------

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("light");

  const light =
    document.documentElement.classList.contains("light");

  localStorage.setItem(
    "quickcalc-theme",
    light ? "light" : "dark"
  );

  themeToggle.textContent = light ? "☾" : "☀︎";

  if (navigator.vibrate) {
    navigator.vibrate(8);
  }
});

// Ladda sparat tema
if (localStorage.getItem("quickcalc-theme") === "light") {
  document.documentElement.classList.add("light");

  themeToggle.textContent = "☾";
}

// -------------------------
// Start
// -------------------------

renderHistory();
