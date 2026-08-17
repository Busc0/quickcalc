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

operators.forEach((button) => {
  button.addEventListener("click", () => {
    operators.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    selectedOp = button.dataset.op;
  });
});

function formatNumber(value) {
  return Number.isInteger(value)
    ? String(value)
    : Number(value.toFixed(8)).toString();
}

function calculateResult(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") return b === 0 ? null : a / b;
}

function operatorSymbol(op) {
  return {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  }[op];
}

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML =
      '<p class="empty">Dina senaste beräkningar visas här.</p>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
        <div class="history-item">
          <span class="expression">
            ${item.a} ${operatorSymbol(item.op)} ${item.b}
          </span>
          <span class="history-result">${item.result}</span>
        </div>
      `
    )
    .join("");
}

calculate.addEventListener("click", () => {
  const a = Number(first.value);
  const b = Number(second.value);

  if (first.value === "" || second.value === "") {
    resultValue.textContent = "Fyll i båda";
    return;
  }

  const result = calculateResult(a, b, selectedOp);

  if (result === null) {
    resultValue.textContent = "Kan inte dela med 0";
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

  history = history.slice(0, 10);

  localStorage.setItem(
    "quickcalc-history",
    JSON.stringify(history)
  );

  renderHistory();
});

clearHistory.addEventListener("click", () => {
  history = [];
  localStorage.removeItem("quickcalc-history");
  renderHistory();
});

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("light");

  const light =
    document.documentElement.classList.contains("light");

  localStorage.setItem(
    "quickcalc-theme",
    light ? "light" : "dark"
  );

  themeToggle.textContent = light ? "☾" : "☀︎";
});

if (localStorage.getItem("quickcalc-theme") === "light") {
  document.documentElement.classList.add("light");
  themeToggle.textContent = "☾";
}

renderHistory();
