const displayValue =
  document.getElementById("displayValue");

const expression =
  document.getElementById("expression");

const calculate =
  document.getElementById("calculate");

const clear =
  document.getElementById("clear");

const historyList =
  document.getElementById("historyList");

const clearHistory =
  document.getElementById("clearHistory");

const themeToggle =
  document.getElementById("themeToggle");

const numberButtons =
  document.querySelectorAll(".number");

const operatorButtons =
  document.querySelectorAll(".operator");


let currentValue = "0";
let firstValue = null;
let selectedOperator = null;
let waitingForSecondValue = false;


let history = JSON.parse(
  localStorage.getItem("quickcalc-history") || "[]"
);


// -------------------------
// Display
// -------------------------

function updateDisplay() {

  displayValue.textContent = currentValue;

}


// -------------------------
// Numbers
// -------------------------

numberButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const number =
      button.dataset.number;


    if (waitingForSecondValue) {

      currentValue =
        number === "."
          ? "0."
          : number;

      waitingForSecondValue = false;

    } else {

      if (number === "." &&
          currentValue.includes(".")) {

        return;

      }


      if (currentValue === "0" &&
          number !== ".") {

        currentValue = number;

      } else {

        currentValue += number;

      }

    }


    updateDisplay();


    if (navigator.vibrate) {

      navigator.vibrate(6);

    }

  });

});


// -------------------------
// Operators
// -------------------------

operatorButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const inputValue =
      Number(currentValue);


    if (firstValue === null) {

      firstValue = inputValue;

    } else if (selectedOperator) {

      const result =
        calculateResult(
          firstValue,
          inputValue,
          selectedOperator
        );

      if (result === null) {

        currentValue = "Fel";
        updateDisplay();

        return;

      }


      firstValue = result;

      currentValue =
        formatNumber(result);

    }


    selectedOperator =
      button.dataset.op;

    waitingForSecondValue = true;


    expression.textContent =
      `${formatNumber(firstValue)} ${operatorSymbol(selectedOperator)}`;


    operatorButtons.forEach((b) => {

      b.classList.remove("active");

    });


    button.classList.add("active");


    updateDisplay();


    if (navigator.vibrate) {

      navigator.vibrate(8);

    }

  });

});


// -------------------------
// Calculate
// -------------------------

calculate.addEventListener("click", () => {

  if (
    firstValue === null ||
    selectedOperator === null
  ) {

    return;

  }


  const secondValue =
    Number(currentValue);


  const result =
    calculateResult(
      firstValue,
      secondValue,
      selectedOperator
    );


  if (result === null) {

    currentValue = "Kan inte dela med 0";

    updateDisplay();

    return;

  }


  const formatted =
    formatNumber(result);


  expression.textContent =
    `${formatNumber(firstValue)} ${operatorSymbol(selectedOperator)} ${formatNumber(secondValue)} =`;


  currentValue =
    formatted;


  history.unshift({

    a: formatNumber(firstValue),

    b: formatNumber(secondValue),

    op: selectedOperator,

    result: formatted

  });


  history =
    history.slice(0, 10);


  localStorage.setItem(
    "quickcalc-history",
    JSON.stringify(history)
  );


  firstValue = null;

  selectedOperator = null;

  waitingForSecondValue = true;


  operatorButtons.forEach((button) => {

    button.classList.remove("active");

  });


  renderHistory();


  if (navigator.vibrate) {

    navigator.vibrate(12);

  }

});


// -------------------------
// Clear
// -------------------------

clear.addEventListener("click", () => {

  currentValue = "0";

  firstValue = null;

  selectedOperator = null;

  waitingForSecondValue = false;

  expression.textContent = "";


  operatorButtons.forEach((button) => {

    button.classList.remove("active");

  });


  updateDisplay();


  if (navigator.vibrate) {

    navigator.vibrate(8);

  }

});


// -------------------------
// Calculation
// -------------------------

function calculateResult(a, b, op) {

  switch (op) {

    case "+":

      return a + b;

    case "-":

      return a - b;

    case "*":

      return a * b;

    case "/":

      return b === 0
        ? null
        : a / b;

    default:

      return null;

  }

}


// -------------------------
// Formatting
// -------------------------

function formatNumber(value) {

  return Number.isInteger(value)

    ? String(value)

    : Number(value.toFixed(8)).toString();

}


function operatorSymbol(op) {

  return {

    "+": "+",

    "-": "−",

    "*": "×",

    "/": "÷"

  }[op];

}


// -------------------------
// History
// -------------------------

function renderHistory() {

  if (!history.length) {

    historyList.innerHTML =
      '<p class="empty">Dina senaste beräkningar visas här.</p>';

    return;

  }


  historyList.innerHTML =
    history.map((item) => `

      <div class="history-item">

        <span class="expression">

          ${item.a}
          ${operatorSymbol(item.op)}
          ${item.b}

        </span>

        <strong>

          ${item.result}

        </strong>

      </div>

    `).join("");

}


// -------------------------
// Theme
// -------------------------

themeToggle.addEventListener("click", () => {

  document.documentElement.classList.toggle("light");


  const light =
    document.documentElement.classList.contains("light");


  localStorage.setItem(

    "quickcalc-theme",

    light
      ? "light"
      : "dark"

  );


  themeToggle.textContent =
    light ? "☾" : "☀︎";

});


// -------------------------
// Clear history
// -------------------------

clearHistory.addEventListener("click", () => {

  history = [];

  localStorage.removeItem(
    "quickcalc-history"
  );

  renderHistory();

});


// -------------------------
// Load theme
// -------------------------

if (
  localStorage.getItem("quickcalc-theme")
  === "light"
) {

  document.documentElement.classList.add("light");

  themeToggle.textContent = "☾";

}


// -------------------------
// Start
// -------------------------

updateDisplay();

renderHistory();