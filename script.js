// =====================================================
// Expense Tracker - script.js
// =====================================================

// ---------- 1. Variables ----------

// Key name used to save data in localStorage
const STORAGE_KEY = "transactions";

// Array that holds all transactions (it changes, so we use let)
let transactions = [];

// DOM elements (they never change, so we use const)
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const transactionList = document.getElementById("transaction-list");
const incomeDisplay = document.getElementById("total-income");
const expenseDisplay = document.getElementById("total-expense");
const balanceDisplay = document.getElementById("balance");
const errorMessage = document.querySelector("#error-message");
const emptyMessage = document.querySelector("#empty-message");

// ---------- 2. Helper functions ----------

// Show an error message under the form
function showError(message) {
  errorMessage.textContent = message;
}

// Clear the error message
function clearError() {
  errorMessage.textContent = "";
}

// Format a number as rupees. Math.round avoids float issues like 0.1 + 0.2
function formatCurrency(value) {
  const rounded = Math.round(value * 100) / 100;
  return `₹${rounded}`;
}

// ---------- 3. localStorage ----------

// Save the transactions array as a JSON string
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Load saved transactions when the page opens
function loadTransactions() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  // getItem returns null if nothing was saved before
  if (savedData !== null) {
    try {
      transactions = JSON.parse(savedData);
    } catch (error) {
      // If the saved data is broken, start fresh
      transactions = [];
    }
  }

  renderTransactions();
  updateSummary();
}

// ---------- 4. Render transactions ----------

function renderTransactions() {
  // Clear the old list before drawing again
  transactionList.innerHTML = "";

  // Show or hide the empty message
  if (transactions.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  // Create one <li> for every transaction
  transactions.forEach(function (transaction) {
    const item = document.createElement("li");
    item.classList.add("transaction", transaction.type);

    // Left side: description + type
    const info = document.createElement("div");
    info.classList.add("transaction-info");

    const description = document.createElement("span");
    description.classList.add("transaction-description");
    description.textContent = transaction.description;

    const type = document.createElement("span");
    type.classList.add("transaction-type");
    type.textContent = transaction.type === "income" ? "Income" : "Expense";

    info.appendChild(description);
    info.appendChild(type);

    // Right side: amount + delete button
    const right = document.createElement("div");
    right.classList.add("transaction-right");

    const amount = document.createElement("span");
    amount.classList.add("transaction-amount");
    const sign = transaction.type === "income" ? "+" : "-";
    amount.textContent = `${sign}${formatCurrency(transaction.amount)}`;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn-delete");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteTransaction(transaction.id);
    });

    right.appendChild(amount);
    right.appendChild(deleteButton);

    // Put everything inside the <li>, then add it to the list
    item.appendChild(info);
    item.appendChild(right);
    transactionList.appendChild(item);
  });
}

// ---------- 5. Summary (income, expense, balance) ----------

function updateSummary() {
  // filter() -> keep only income transactions
  // reduce() -> add all their amounts together (starting from 0)
  const totalIncome = transactions
    .filter(function (transaction) {
      return transaction.type === "income";
    })
    .reduce(function (total, transaction) {
      return total + transaction.amount;
    }, 0);

  // Same idea for expenses
  const totalExpense = transactions
    .filter(function (transaction) {
      return transaction.type === "expense";
    })
    .reduce(function (total, transaction) {
      return total + transaction.amount;
    }, 0);

  // Balance = Income - Expense
  const balance = totalIncome - totalExpense;

  incomeDisplay.textContent = formatCurrency(totalIncome);
  expenseDisplay.textContent = formatCurrency(totalExpense);
  balanceDisplay.textContent = formatCurrency(balance);
}

// ---------- 6. Delete ----------

function deleteTransaction(id) {
  // filter() keeps every transaction EXCEPT the one with this id
  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });

  saveTransactions();
  renderTransactions();
  updateSummary();
}

// ---------- 7. Add transaction (form submit) ----------

function addTransaction(event) {
  // Stop the page from refreshing
  event.preventDefault();

  // Get the values and remove extra spaces
  const type = typeInput.value;
  const description = descriptionInput.value.trim();
  const amountText = amountInput.value.trim();
  const amount = Number(amountText);

  // Validation
  if (description === "") {
    showError("Please enter a valid description.");
    return;
  }

  if (amountText === "") {
    showError("Please enter an amount.");
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showError("Please enter an amount greater than 0.");
    return;
  }

  // Create the transaction object
  const transaction = {
    id: Date.now(), // current time in ms = unique id
    type: type,
    description: description,
    amount: amount,
  };

  // Add to array, save, redraw, recalculate
  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  updateSummary();

  // Reset the form and error
  form.reset();
  clearError();
  descriptionInput.focus();
}

// ---------- 8. Events and start ----------

form.addEventListener("submit", addTransaction);

// Run once when the page loads
loadTransactions();