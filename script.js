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
  document.getElementById("totalProtein").textContent = totalPro;
  document.getElementById("goalCalories").textContent = goals.calories;
  document.getElementById("goalProtein").textContent = goals.protein;
  document.getElementById("remainingCalories").textContent = goals.calories - totalCals;
  document.getElementById("remainingProtein").textContent = goals.protein - totalPro;
}

function removeLog(index) {
  log.splice(index, 1);
  localStorage.setItem("log", JSON.stringify(log));
  updateLog();
}

function resetLog() {
  if (confirm("Clear the entire log?")) {
    log = [];
    localStorage.removeItem("log");
    updateLog();
  }
}

// Food Creation
function showServingPopup() {
  document.getElementById("servingPopup").style.display = "flex";
}

function submitFood(mode) {
  const name = document.getElementById("newFoodName").value.trim();
  let cals = parseFloat(document.getElementById("newCalories").value);
  let prot = parseFloat(document.getElementById("newProtein").value);
  if (mode === "custom") {
    const g = parseFloat(document.getElementById("customAmount").value) || 100;
    cals = (cals * g) / 100;
    prot = (prot * g) / 100;
  } else if (mode === "100g") {
    cals = cals;
    prot = prot;
  }
  foodDB.push({ name, calories: cals, protein: prot });
  localStorage.setItem("foodDB", JSON.stringify(foodDB));
  updateFoodDatabase();
  document.getElementById("servingPopup").style.display = "none";
}

function updateFoodDatabase() {
  const body = document.getElementById("foodDatabaseBody");
  body.innerHTML = "";
  foodDB.forEach((food, i) => {
    body.innerHTML += `<tr>
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td><button onclick="deleteFood(${i})">X</button></td>
    </tr>`;
  });
}

function deleteFood(index) {
  foodDB.splice(index, 1);
  localStorage.setItem("foodDB", JSON.stringify(foodDB));
  updateFoodDatabase();
}

// Goals
function saveGoals() {
  goals.calories = parseInt(document.getElementById("goalCaloriesInput").value) || 0;
  goals.protein = parseInt(document.getElementById("goalProteinInput").value) || 0;
  localStorage.setItem("goals", JSON.stringify(goals));
  updateGoalsDisplay();
}

function updateGoalsDisplay() {
  document.getElementById("goalCalories").textContent = goals.calories;
  document.getElementById("goalProtein").textContent = goals.protein;
}

// Barcode
function startScanner() {
  const qr = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices => {
    const backCam = devices.find(cam => cam.label.toLowerCase().includes("back")) || devices[0];
    qr.start({ deviceId: { exact: backCam.id } }, { fps: 10, qrbox: 250 },
      barcode => {
        alert("Scanned barcode: " + barcode);
        qr.stop();
      });
  });
}
