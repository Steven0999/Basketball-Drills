// Global variables
let foodDB = JSON.parse(localStorage.getItem("foodDB")) || [];
let foodLog = JSON.parse(localStorage.getItem("foodLog")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || { calories: 0, protein: 0 };

function switchTab(event, tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.currentTarget.classList.add("active");
  renderFoodDatabase();
  updateFoodSelect();
  renderTracker();
}

function addFoodAndReturn() {
  const name = document.getElementById("newFoodName").value;
  const calories = parseFloat(document.getElementById("newCalories").value);
  const protein = parseFloat(document.getElementById("newProtein").value);
  const barcode = document.getElementById("barcode").value;
  if (name && !isNaN(calories) && !isNaN(protein)) {
    foodDB.push({ name, calories, protein, barcode });
    localStorage.setItem("foodDB", JSON.stringify(foodDB));
    switchTab({ currentTarget: document.querySelector(".tab-btn:first-child") }, "trackerTab");
  }
}

function updateFoodSelect() {
  const select = document.getElementById("foodSelect");
  select.innerHTML = '<option value="">Select Item</option>';
  foodDB.forEach((food, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = food.name;
    select.appendChild(opt);
  });
}

function filterFoodSelect() {
  const input = document.getElementById("foodSearch").value.toLowerCase();
  const select = document.getElementById("foodSelect");
  Array.from(select.options).forEach(option => {
    option.style.display = option.text.toLowerCase().includes(input) ? "" : "none";
  });
}

function addEntry() {
  const idx = document.getElementById("foodSelect").value;
  const qty = parseFloat(document.getElementById("quantity").value);
  const meal = document.getElementById("mealType").value;
  if (idx === "" || isNaN(qty) || qty <= 0) return;
  const food = foodDB[idx];
  foodLog.push({ ...food, qty, meal });
  localStorage.setItem("foodLog", JSON.stringify(foodLog));
  renderTracker();
}

function renderTracker() {
  const container = document.getElementById("mealTables");
  container.innerHTML = "";
  const meals = ["breakfast", "lunch", "dinner", "snack"];
  let totalCals = 0, totalProt = 0;

  meals.forEach(meal => {
    const mealEntries = foodLog.filter(f => f.meal === meal);
    if (mealEntries.length) {
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = `<tr><th colspan='6'>${meal.toUpperCase()}</th></tr><tr><th>Food</th><th>Calories</th><th>Protein</th><th>Qty</th><th>% Protein</th><th>X</th></tr>`;
      table.appendChild(thead);
      const tbody = document.createElement("tbody");

      mealEntries.forEach((f, i) => {
        const cals = f.calories * f.qty;
        const prot = f.protein * f.qty;
        totalCals += cals;
        totalProt += prot;
        const perc = ((prot * 4) / cals * 100).toFixed(1);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${f.name}</td>
          <td>${cals}</td>
          <td>${prot}</td>
          <td>${f.qty}</td>
          <td>${perc}%</td>
          <td><button onclick="removeLog(${i})">X</button></td>
        `;
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      container.appendChild(table);
    }
  });

  const goalCals = goals.calories || 0;
  const goalProt = goals.protein || 0;
  const remainingCals = goalCals - totalCals;
  const remainingProt = goalProt - totalProt;

  container.innerHTML += `
    <table>
      <tfoot>
        <tr><td><strong>Goal</strong></td><td>${goalCals}</td><td>${goalProt}</td><td colspan="3"></td></tr>
        <tr><td><strong>Total</strong></td><td>${totalCals}</td><td>${totalProt}</td><td colspan="3"></td></tr>
        <tr><td><strong>Remaining</strong></td><td>${remainingCals}</td><td>${remainingProt}</td><td colspan="3"></td></tr>
      </tfoot>
    </table>
  `;
}

function resetLog() {
  foodLog = [];
  localStorage.setItem("foodLog", JSON.stringify(foodLog));
  renderTracker();
}

function removeLog(index) {
  foodLog.splice(index, 1);
  localStorage.setItem("foodLog", JSON.stringify(foodLog));
  renderTracker();
}

function renderFoodDatabase() {
  const tbody = document.getElementById("foodDatabaseBody");
  tbody.innerHTML = "";
  foodDB.forEach((f, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${f.name}</td>
      <td>${f.calories}</td>
      <td>${f.protein}</td>
      <td>${f.barcode || "-"}</td>
      <td><button onclick="deleteFood(${i})">X</button></td>
    `;
    tbody.appendChild(row);
  });
}

function deleteFood(index) {
  foodDB.splice(index, 1);
  localStorage.setItem("foodDB", JSON.stringify(foodDB));
  renderFoodDatabase();
  updateFoodSelect();
}

function saveGoals() {
  const cal = parseFloat(document.getElementById("goalCaloriesInput").value);
  const prot = parseFloat(document.getElementById("goalProteinInput").value);
  if (!isNaN(cal) && !isNaN(prot)) {
    goals = { calories: cal, protein: prot };
    localStorage.setItem("goals", JSON.stringify(goals));
    alert("Goals saved!");
    renderTracker();
  }
}

function startScanner() {
  const reader = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices => {
    const backCam = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];
    reader.start(
      backCam.id,
      { fps: 10, qrbox: 250 },
      barcode => {
        document.getElementById("barcode").value = barcode;
        reader.stop();
        document.getElementById("reader").innerHTML = "";
        alert("Barcode scanned: " + barcode);
      }
    );
  });
}

// Initial load
updateFoodSelect();
renderTracker();
