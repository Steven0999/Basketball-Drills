// App State
let foodDatabase = [];
let log = [];
let calorieGoal = 0;
let proteinGoal = 0;

// Initialization
window.onload = () => {
  loadFromLocalStorage();
  renderFoodDatabase();
  renderLog();
  renderGoals();
  renderSearchList();
};

// Tabs
function switchTab(evt, tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

// Load/Save
function saveToLocalStorage() {
  localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase));
  localStorage.setItem("log", JSON.stringify(log));
  localStorage.setItem("calorieGoal", calorieGoal);
  localStorage.setItem("proteinGoal", proteinGoal);
}

function loadFromLocalStorage() {
  const db = localStorage.getItem("foodDatabase");
  const l = localStorage.getItem("log");
  calorieGoal = parseInt(localStorage.getItem("calorieGoal")) || 0;
  proteinGoal = parseInt(localStorage.getItem("proteinGoal")) || 0;
  if (db) foodDatabase = JSON.parse(db);
  if (l) log = JSON.parse(l);
}

// Food Management
function addFoodAndReturn() {
  const name = document.getElementById("newFoodName").value.trim();
  const calories = parseInt(document.getElementById("newCalories").value);
  const protein = parseInt(document.getElementById("newProtein").value);
  if (!name || isNaN(calories) || isNaN(protein)) return;
  foodDatabase.push({ name, calories, protein });
  saveToLocalStorage();
  renderFoodDatabase();
  renderSearchList();
  switchTab({ currentTarget: document.querySelector('[onclick*="trackerTab"]') }, 'trackerTab');
}

function deleteFood(index) {
  foodDatabase.splice(index, 1);
  saveToLocalStorage();
  renderFoodDatabase();
  renderSearchList();
}

function renderFoodDatabase() {
  const tbody = document.getElementById("foodDatabaseBody");
  tbody.innerHTML = "";
  foodDatabase.forEach((food, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td><button onclick="deleteFood(${index})">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Log
function addEntry() {
  const selectedFood = document.getElementById("searchInput").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const type = document.getElementById("mealType").value;

  if (!selectedFood || isNaN(quantity)) return;

  const foodItem = foodDatabase.find(f => f.name.toLowerCase() === selectedFood.toLowerCase());
  if (!foodItem) return;

  log.push({ ...foodItem, quantity, type });
  saveToLocalStorage();
  renderLog();
}

function removeEntry(index) {
  log.splice(index, 1);
  saveToLocalStorage();
  renderLog();
}

function resetLog() {
  log = [];
  saveToLocalStorage();
  renderLog();
}

function renderLog() {
  const tbody = document.getElementById("logBody");
  tbody.innerHTML = "";

  let totalCalories = 0;
  let totalProtein = 0;

  log.forEach((entry, index) => {
    const calories = entry.calories * entry.quantity;
    const protein = entry.protein * entry.quantity;
    const proteinPercentage = ((protein * 4) / calories * 100).toFixed(1);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.name}</td>
      <td>${calories}</td>
      <td>${protein}</td>
      <td>${entry.quantity}</td>
      <td>${entry.type}</td>
      <td>${proteinPercentage}%</td>
      <td><button onclick="removeEntry(${index})">X</button></td>
    `;
    tbody.appendChild(tr);
    totalCalories += calories;
    totalProtein += protein;
  });

  document.getElementById("totalCalories").textContent = totalCalories;
  document.getElementById("totalProtein").textContent = totalProtein;
  document.getElementById("goalCalories").textContent = calorieGoal;
  document.getElementById("goalProtein").textContent = proteinGoal;
  document.getElementById("remainingCalories").textContent = calorieGoal - totalCalories;
  document.getElementById("remainingProtein").textContent = proteinGoal - totalProtein;
}

// Goals
function saveGoals() {
  calorieGoal = parseInt(document.getElementById("goalCaloriesInput").value) || 0;
  proteinGoal = parseInt(document.getElementById("goalProteinInput").value) || 0;
  saveToLocalStorage();
  renderGoals();
  renderLog();
}

function renderGoals() {
  document.getElementById("goalCaloriesInput").value = calorieGoal;
  document.getElementById("goalProteinInput").value = proteinGoal;
}

// Barcode Scanner
let html5QrcodeScanner;
function startScanner() {
  const reader = document.getElementById("reader");
  reader.innerHTML = "";
  const scanner = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        barcode => handleBarcode(barcode, scanner),
        err => console.warn(err)
      );
    }
  });
}

function handleBarcode(barcode, scanner) {
  scanner.stop();
  fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then(res => res.json())
    .then(data => {
      const product = data.product;
      if (!product || !product.nutriments) return;
      const name = product.product_name;
      const calories = Math.round(product.nutriments["energy-kcal_100g"] || 0);
      const protein = Math.round(product.nutriments["proteins_100g"] || 0);
      document.getElementById("newFoodName").value = name;
      document.getElementById("newCalories").value = calories;
      document.getElementById("newProtein").value = protein;
      alert("Product details loaded. Choose portion type.");
    });
}

// Search Food
function renderSearchList() {
  const input = document.getElementById("searchInput");
  input.addEventListener("input", function () {
    const list = document.getElementById("searchResults");
    list.innerHTML = "";
    const value = this.value.toLowerCase();
    foodDatabase
      .filter(f => f.name.toLowerCase().includes(value))
      .forEach(f => {
        const option = document.createElement("option");
        option.value = f.name;
        list.appendChild(option);
      });
  });
}
