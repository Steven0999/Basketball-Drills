let foodDatabase = JSON.parse(localStorage.getItem("foodDatabase")) || [];
let log = JSON.parse(localStorage.getItem("log")) || [];
let goals = JSON.parse(localStorage.getItem("goals")) || { calories: 0, protein: 0 };

function switchTab(evt, tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  evt.currentTarget.classList.add('active');
  updateLog();
  updateGoals();
  showHistory();
}

function toggleCustomWeight() {
  document.getElementById("customWeight").style.display = 
    document.getElementById("servingType").value === "custom" ? "inline" : "none";
}

function searchFood() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const results = foodDatabase.filter(f => f.name.toLowerCase().includes(query));
  const container = document.getElementById("searchResults");
  container.innerHTML = "";
  results.forEach(food => {
    const div = document.createElement("div");
    div.textContent = `${food.name} (${food.calories} cal, ${food.protein}g protein)`;
    div.onclick = () => document.getElementById("searchInput").value = food.name;
    container.appendChild(div);
  });
  if (!results.length && query.length > 2) {
    const div = document.createElement("div");
    div.textContent = `Food not found. Click to create "${query}"`;
    div.onclick = () => {
      document.getElementById("newFoodName").value = query;
      switchTab({ currentTarget: document.querySelector('[data-tab="createTab"]') }, "createTab");
    };
    container.appendChild(div);
  }
}

function addEntry() {
  const name = document.getElementById("searchInput").value;
  const meal = document.getElementById("mealType").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const useCustom = document.getElementById("servingType").value === "custom";
  const weight = useCustom ? parseFloat(document.getElementById("customWeight").value) : 100;
  const food = foodDatabase.find(f => f.name === name);
  if (!food || isNaN(quantity) || isNaN(weight)) return;

  const cal = (food.calories * (weight / 100)) * quantity;
  const pro = (food.protein * (weight / 100)) * quantity;

  log.push({ name, meal, cal, pro, quantity });
  localStorage.setItem("log", JSON.stringify(log));
  updateLog();
}

function updateLog() {
  const tbody = document.getElementById("logBody");
  tbody.innerHTML = "";
  let totalCalories = 0, totalProtein = 0;

  log.forEach((entry, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${entry.name}</td><td>${entry.meal}</td><td>${entry.cal.toFixed(1)}</td><td>${entry.pro.toFixed(1)}</td><td>${entry.quantity}</td><td><button onclick="deleteEntry(${i})">X</button></td>`;
    tbody.appendChild(tr);
    totalCalories += entry.cal;
    totalProtein += entry.pro;
  });

  document.getElementById("totalCalories").textContent = totalCalories.toFixed(1);
  document.getElementById("totalProtein").textContent = totalProtein.toFixed(1);
  document.getElementById("goalCalories").textContent = goals.calories;
  document.getElementById("goalProtein").textContent = goals.protein;
  document.getElementById("remainingCalories").textContent = (goals.calories - totalCalories).toFixed(1);
  document.getElementById("remainingProtein").textContent = (goals.protein - totalProtein).toFixed(1);
}

function deleteEntry(index) {
  log.splice(index, 1);
  localStorage.setItem("log", JSON.stringify(log));
  updateLog();
}

function resetLog() {
  log = [];
  localStorage.setItem("log", JSON.stringify(log));
  updateLog();
}

function saveGoals() {
  goals = {
    calories: parseFloat(document.getElementById("goalCaloriesInput").value),
    protein: parseFloat(document.getElementById("goalProteinInput").value)
  };
  localStorage.setItem("goals", JSON.stringify(goals));
  updateGoals();
}

function updateGoals() {
  document.getElementById("goalCaloriesInput").value = goals.calories;
  document.getElementById("goalProteinInput").value = goals.protein;
  document.getElementById("goalCalories").textContent = goals.calories;
  document.getElementById("goalProtein").textContent = goals.protein;
  document.getElementById("remainingCalories").textContent = (goals.calories - parseFloat(document.getElementById("totalCalories").textContent || 0)).toFixed(1);
  document.getElementById("remainingProtein").textContent = (goals.protein - parseFloat(document.getElementById("totalProtein").textContent || 0)).toFixed(1);
}

function addFoodAndReturn() {
  const name = document.getElementById("newFoodName").value;
  const calories = parseFloat(document.getElementById("newCalories").value);
  const protein = parseFloat(document.getElementById("newProtein").value);
  if (!name || isNaN(calories) || isNaN(protein)) return;
  foodDatabase.push({ name, calories, protein });
  localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase));
  document.getElementById("newFoodName").value = "";
  document.getElementById("newCalories").value = "";
  document.getElementById("newProtein").value = "";
  switchTab({ currentTarget: document.querySelector(".tab-btn") }, "trackerTab");
}

function searchDatabase() {
  const query = document.getElementById("dbSearch").value.toLowerCase();
  const container = document.getElementById("databaseResults");
  container.innerHTML = "";
  foodDatabase.filter(f => f.name.toLowerCase().includes(query)).forEach(f => {
    const div = document.createElement("div");
    div.textContent = `${f.name} (${f.calories} cal, ${f.protein}g protein)`;
    container.appendChild(div);
  });
}

function saveDay() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const date = new Date().toISOString().split("T")[0];
  const totalCalories = parseFloat(document.getElementById("totalCalories").textContent);
  const totalProtein = parseFloat(document.getElementById("totalProtein").textContent);
  history.push({ date, calories: totalCalories, protein: totalProtein });
  localStorage.setItem("history", JSON.stringify(history));
  showHistory();
  alert("Day saved!");
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const daily = document.getElementById("dailyView");
  const weekly = document.getElementById("weeklyView");
  const monthly = document.getElementById("monthlyView");

  daily.innerHTML = "<table><tr><th>Date</th><th>Calories</th><th>Protein</th></tr>" +
    history.map(day => `<tr><td>${day.date}</td><td>${day.calories.toFixed(1)}</td><td>${day.protein.toFixed(1)}</td></tr>`).join("") + "</table>";

  const weeklyMap = {};

  history.forEach(entry => {
    const date = new Date(entry.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const weekKey = monday.toISOString().split("T")[0];

    if (!weeklyMap[weekKey]) {
      weeklyMap[weekKey] = { Monday: null, Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null };
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];
    weeklyMap[weekKey][dayName] = entry;
  });

  const weeklyGoal = goals.calories * 7;

  weekly.innerHTML = "<table><tr><th>Week Starting</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th><th>Sunday</th><th>Total</th><th>Remaining Daily Avg</th></tr>" +
    Object.entries(weeklyMap).map(([weekStart, days]) => {
      let totalCal = 0, totalPro = 0, daysCounted = 0;
      const row = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
        const entry = days[day];
        if (entry) {
          totalCal += entry.calories;
          totalPro += entry.protein;
          daysCounted++;
          return `<td>${entry.calories.toFixed(1)} cal<br>${entry.protein.toFixed(1)}g</td>`;
        } else {
          return "<td>-</td>";
        }
      }).join("");

      const remaining = daysCounted < 7 ? ((weeklyGoal - totalCal) / (7 - daysCounted)).toFixed(1) : "0.0";
      return `<tr><td>${weekStart}</td>${row}<td>${totalCal.toFixed(1)}<br>${totalPro.toFixed(1)}g</td><td>${remaining}</td></tr>`;
    }).join("") + "</table>";

  monthly.innerHTML = '<p>Monthly summary coming soon</p>';
}

function switchHistoryView(view) {
  document.querySelectorAll('.history-view').forEach(v => v.classList.remove('active'));
  document.getElementById(view + 'View').classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
  updateLog();
  updateGoals();
  showHistory();
});
