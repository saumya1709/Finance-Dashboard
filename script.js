const API_URL = "http://localhost:5000/transactions";

let transactions = [];
let currentRole = "viewer";

let trendChart;
let categoryChart;

// Role setup
const roleSelect = document.getElementById("role");

roleSelect.addEventListener("change", (e) => {
    currentRole = e.target.value;

    document.getElementById("adminControls").style.display =
        currentRole === "admin" ? "block" : "none";

    renderTransactions();
});

// Initial role
currentRole = roleSelect.value;
if (currentRole !== "admin") {
    document.getElementById("adminControls").style.display = "none";
}

// Fetch data
async function fetchTransactions() {
    const res = await fetch(API_URL);
    transactions = await res.json();

    renderTransactions();
    updateSummary();
    generateInsights();
    renderCharts();
}

// Render table
function renderTransactions() {
    const table = document.getElementById("transactionTable");
    table.innerHTML = "";

    transactions.forEach(t => {
        const row = `
            <tr>
                <td>${t.date}</td>
                <td>${t.amount}</td>
                <td>${t.category}</td>
                <td>${t.type}</td>
                <td>
                    ${currentRole === "admin" ? `
                        <button onclick="deleteTransaction('${t._id}')">Delete</button>
                        <button onclick="editTransaction('${t._id}')">Edit</button>
                    ` : ""}
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

async function addTransaction() {

    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const type = document.getElementById("type").value;

    if (!date || !amount || !category) {
        alert("Please fill all fields properly!");
        return;
    }

    const data = {
        date,
        amount: Number(amount),
        category,
        type
    };

    console.log("Sending:", data); // DEBUG

    await fetch("http://localhost:5000/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    fetchTransactions();
}

// Delete
async function deleteTransaction(id) {
    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    fetchTransactions();
}

// Edit
async function editTransaction(id) {
    const newAmount = prompt("Enter new amount:");
    if (!newAmount) return;

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(newAmount) })
    });

    fetchTransactions();
}

// Summary
function updateSummary() {
    let income = 0, expense = 0;

    transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    document.getElementById("income").innerText = "₹" + income;
    document.getElementById("expenses").innerText = "₹" + expense;
    document.getElementById("balance").innerText = "₹" + (income - expense);
}

// Insights
function generateInsights() {
    const categoryMap = {};

    transactions.forEach(t => {
        if (t.type === "expense") {
            categoryMap[t.category] =
                (categoryMap[t.category] || 0) + t.amount;
        }
    });

    let maxCat = "-", maxVal = 0;

    for (let cat in categoryMap) {
        if (categoryMap[cat] > maxVal) {
            maxVal = categoryMap[cat];
            maxCat = cat;
        }
    }

    document.getElementById("highestCategory").innerText =
        "Highest Spending Category: " + maxCat;
}

// Charts
function renderCharts() {
    const dates = transactions.map(t => t.date);

    let balance = 0;
    const balanceData = transactions.map(t => {
        if (t.type === "income") balance += t.amount;
        else balance -= t.amount;
        return balance;
    });

    if (trendChart) trendChart.destroy();
    if (categoryChart) categoryChart.destroy();

    // Line Chart
    const ctx1 = document.getElementById("trendChart").getContext("2d");
    trendChart = new Chart(ctx1, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Balance Trend",
                data: balanceData,
                borderColor: "green"
            }]
        }
    });

    // Pie Chart
    const categoryMap = {};

    transactions.forEach(t => {
        if (t.type === "expense") {
            categoryMap[t.category] =
                (categoryMap[t.category] || 0) + t.amount;
        }
    });

    const ctx2 = document.getElementById("categoryChart").getContext("2d");
    categoryChart = new Chart(ctx2, {
        type: "pie",
        data: {
            labels: Object.keys(categoryMap),
            datasets: [{
                data: Object.values(categoryMap)
            }]
        }
    });
}

// Load
fetchTransactions();

document.addEventListener("DOMContentLoaded", () => {

    fetchTransactions();

    const roleSelect = document.getElementById("role");

    roleSelect.addEventListener("change", (e) => {
        currentRole = e.target.value;

        document.getElementById("adminControls").style.display =
            currentRole === "admin" ? "block" : "none";

        renderTransactions();
    });

});