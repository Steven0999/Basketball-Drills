// script.js
let foodDB = JSON.parse(localStorage.getItem("foodDB")) || [];
let log = JSON.parse(localStorage.getItem("log")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || { calories: 0, protein: 0 };
let selectedFood = null;

document.addEventListener("DOMContentLoaded", () => {
  switchTab(null, "trackerTab");
  updateFoodDatabase();
  updateLog();
  updateGoalsDisplay();
});

// Tabs
function switchTab(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  if (evt) evt.currentTarget.classList.add("active");
}

// Food Search
function filterFoods() {
  const query = document.getElementById("foodSearch").value.toLowerCase();
  const results = foodDB.filter(f => f.name.toLowerCase().includes(query));
  const container = document.getElementById("foodResults");
  container.innerHTML = "";
  results.forEach(food => {
    const div = document.createElement("div");
    div.textContent = food.name;
    div.onclick = () => selectedFood = food;
    container.appendChild(div);
  });
}

// Add Entry
function addSelectedFood() {
  const qty = parseFloat(document.getElementById("quantity").value) || 1;
  const meal = document.getElementById("mealType").value;
  if (!selectedFood) return alert("Select a food");
  const cal = selectedFood.calories * qty;
  const pro = selectedFood.protein * qty;
  const percent = ((pro * 4) / cal * 100).toFixed(1);

  log.push({ ...selectedFood, qty, meal, percent });
  localStorage.setItem("log", JSON.stringify(log));
  updateLog();
  selectedFood = null;
  document.getElementById("foodSearch").value = "";
  document.getElementById("foodResults").innerHTML = "";
}

// Log display
function updateLog() {
  const tbody = document.getElementById("logBody");
  tbody.innerHTML = "";
  let totalCals = 0, totalPro = 0;

  log.forEach((item, i) => {
    totalCals += item.calories * item.qty;
    totalPro += item.protein * item.qty;
    const row = `<tr>
      <td>${item.name}</td>
      <td>${item.calories * item.qty}</td>
      <td>${item.protein * item.qty}</td>
      <td>${item.qty}</td>
      <td>${item.meal}</td>
      <td>${item.percent}%</td>
      <td><button onclick="removeLog(${i})">X</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById("totalCalories").textContent = totalCals;
  document.getElementBy0
