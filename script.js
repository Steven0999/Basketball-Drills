let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];
let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];
let goals = {
  calories: parseInt(localStorage.getItem('goalCalories')) || 0,
  protein: parseInt(localStorage.getItem('goalProtein')) || 0,
  weight: parseInt(localStorage.getItem('userWeight')) || 0
};

function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');

  if (tabId === 'databaseTab') searchDatabase();
  if (tabId === 'historyTab') loadHistoryView();
}

function searchFood() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';

  const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(input));

  if (matches.length) {
    matches.forEach(food => {
      const div = document.createElement('div');
      div.textContent = food.name;
      div.onclick = () => {
        document.getElementById('searchInput').value = food.name;
        resultsDiv.innerHTML = '';
      };
      resultsDiv.appendChild(div);
    });
  } else if (input.length > 2) {
    const div = document.createElement('div');
    div.textContent = `Food not found. Click to create "${input}"`;
    div.onclick = () => {
      document.getElementById('newFoodName').value = input;
      switchTab({ target: document.querySelectorAll('.tab-btn')[1] }, 'createTab');
    };
    resultsDiv.appendChild(div);
  }
}

function toggleCustomWeight() {
  const type = document.getElementById('servingType').value;
  document.getElementById('customWeight').style.display = type === 'custom' ? 'inline-block' : 'none';
}

function addEntry() {
  const name = document.getElementById('searchInput').value.trim();
  const qty = parseInt(document.getElementById('quantity').value);
  const meal = document.getElementById('mealType').value;
  const type = document.getElementById('servingType').value;
  const customWeight = parseFloat(document.getElementById('customWeight').value);

  const food = foodDatabase.find(f => f.name.toLowerCase() === name.toLowerCase());
  if (!food || isNaN(qty)) return alert('Please select a valid food and quantity.');

  let cal = food.calories;
  let pro = food.protein;

  if (type === 'custom') {
    if (isNaN(customWeight)) return alert("Enter valid weight");
    cal = (cal / 100) * customWeight;
    pro = (pro / 100) * customWeight;
  }

  foodLog.push({ name: food.name, calories: cal, protein: pro, qty, meal });
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();

  document.getElementById('quantity').value = 1;
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

function updateTable() {
  const logBody = document.getElementById('logBody');
  logBody.innerHTML = '';

  const addedMeals = new Set();
  let totalCal = 0, totalPro = 0;
  const mealTotals = {};

  foodLog.forEach((item, index) => {
    if (!addedMeals.has(item.meal)) {
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="6" class="meal-header">${item.meal}</td>`;
      logBody.appendChild(headerRow);
      addedMeals.add(item.meal);
      mealTotals[item.meal] = { cal: 0, pro: 0 };
    }

    const cal = item.calories * item.qty;
    const pro = item.protein * item.qty;
    mealTotals[item.meal].cal += cal;
    mealTotals[item.meal].pro += pro;
    totalCal += cal;
    totalPro += pro;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.meal}</td>
      <td>${cal.toFixed(1)}</td>
      <td>${pro.toFixed(1)}</td>
      <td>${item.qty}</td>
      <td><button onclick="removeLogEntry(${index})">X</button></td>
    `;
    logBody.appendChild(row);
  });

  Object.entries(mealTotals).forEach(([meal, data]) => {
    const row = document.createElement('tr');
    row.className = 'meal-totals';
    row.innerHTML = `
      <td colspan="2">${meal} Total</td>
      <td>${data.cal.toFixed(1)}</td>
      <td>${data.pro.toFixed(1)}</td>
      <td colspan="2"></td>
    `;
    logBody.appendChild(row);
  });

  document.getElementById('goalCalories').textContent = goals.calories;
  document.getElementById('goalProtein').textContent = goals.protein;
  document.getElementById('totalCalories').textContent = totalCal.toFixed(1);
  document.getElementById('totalProtein').textContent = totalPro.toFixed(1);
  document.getElementById('remainingCalories').textContent = Math.max(goals.calories - totalCal, 0).toFixed(1);
  document.getElementById('remainingProtein').textContent = Math.max(goals.protein - totalPro, 0).toFixed(1);
}

function removeLogEntry(index) {
  foodLog.splice(index, 1);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
}

function resetLog() {
  if (confirm('Clear your log?')) {
    foodLog = [];
    localStorage.removeItem('foodLog');
    updateTable();
  }
}

function saveDay() {
  const today = new Date().toISOString().split('T')[0];
  const calories = parseFloat(document.getElementById('totalCalories').textContent);
  const protein = parseFloat(document.getElementById('totalProtein').textContent);

  const existing = historyLog.find(h => h.date === today);
  if (existing) {
    existing.calories = calories;
    existing.protein = protein;
  } else {
    historyLog.push({ date: today, calories, protein });
  }

  localStorage.setItem('historyLog', JSON.stringify(historyLog));
  alert('Day saved!');
  loadHistoryView();
}

function addFoodAndReturn() {
  const name = document.getElementById('newFoodName').value.trim();
  const calories = parseFloat(document.getElementById('newCalories').value);
  const protein = parseFloat(document.getElementById('newProtein').value);
  if (!name || isNaN(calories) || isNaN(protein)) return alert('Please complete all fields.');

  foodDatabase.push({ name, calories, protein });
  localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
  document.getElementById('newFoodName').value = '';
  document.getElementById('newCalories').value = '';
  document.getElementById('newProtein').value = '';
  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
}

function saveGoals() {
  const calInput = parseInt(document.getElementById('goalCaloriesInput').value);
  const proInput = parseInt(document.getElementById('goalProteinInput').value);
  const weightInput = parseInt(document.getElementById('userWeight').value);

  if (!isNaN(calInput)) {
    goals.calories = calInput;
    localStorage.setItem('goalCalories', calInput);
  }
  if (!isNaN(proInput)) {
    goals.protein = proInput;
    localStorage.setItem('goalProtein', proInput);
  }
  if (!isNaN(weightInput)) {
    goals.weight = weightInput;
    localStorage.setItem('userWeight', weightInput);
  }

  alert("Goals saved!");
  updateTable();
  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
}

function searchDatabase() {
  const term = document.getElementById('dbSearch').value.toLowerCase();
  const resultDiv = document.getElementById('databaseResults');
  resultDiv.innerHTML = '';

  foodDatabase
    .filter(f => f.name.toLowerCase().includes(term))
    .forEach((food, index) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${food.name}</strong> - ${food.calories} cal, ${food.protein}g protein
        <button onclick="editFood(${index})">Edit</button>
      `;
      resultDiv.appendChild(div);
    });
}

function editFood(index) {
  const food = foodDatabase[index];
  const newName = prompt("Edit food name:", food.name);
  const newCalories = prompt("Edit calories per 100g:", food.calories);
  const newProtein = prompt("Edit protein per 100g:", food.protein);

  if (newName && !isNaN(newCalories) && !isNaN(newProtein)) {
    foodDatabase[index] = {
      name: newName,
      calories: parseFloat(newCalories),
      protein: parseFloat(newProtein)
    };
    localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
    searchDatabase();
  }
}

function switchHistoryView(view) {
  document.querySelectorAll('.history-view').forEach(div => div.style.display = 'none');
  document.getElementById(view + 'View').style.display = 'block';
}

function loadHistoryView() {
  loadDailyView();
  loadWeeklyView();
  loadMonthlyView();
}

function loadDailyView() {
  const div = document.getElementById('dailyView');
  div.innerHTML = '';
  historyLog.sort((a, b) => new Date(b.date) - new Date(a.date));
  historyLog.forEach(entry => {
    const p = document.createElement('p');
    p.textContent = `${entry.date}: ${entry.calories} cal, ${entry.protein}g protein`;
    div.appendChild(p);
  });
}

function loadWeeklyView() {
  const div = document.getElementById('weeklyView');
  div.innerHTML = '';
  const weeklyGroups = {};

  historyLog.forEach(entry => {
    const date = new Date(entry.date);
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay() + 1)).toISOString().split('T')[0];
    if (!weeklyGroups[weekStart]) weeklyGroups[weekStart] = [];
    weeklyGroups[weekStart].push(entry);
  });

  Object.entries(weeklyGroups).forEach(([weekStart, entries]) => {
    const totalCal = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalPro = entries.reduce((sum, e) => sum + e.protein, 0);
    const remaining = (goals.calories * 7) - totalCal;
    const daysLeft = 7 - entries.length;
    const avgLeft = daysLeft > 0 ? (remaining / daysLeft).toFixed(1) : 0;
    const divWeek = document.createElement('div');
    divWeek.innerHTML = `
      <h3>Week starting ${weekStart}</h3>
      <table>
        <tr><th>Date</th><th>Calories</th><th>Protein</th></tr>
        ${entries.map(e => `<tr><td>${e.date}</td><td>${e.calories}</td><td>${e.protein}</td></tr>`).join('')}
        <tr><td><strong>Weekly Total</strong></td><td>${totalCal}</td><td>${totalPro}</td></tr>
        <tr><td><strong>Remaining</strong></td><td>${remaining}</td><td></td></tr>
        <tr><td><strong>Avg/day Left</strong></td><td>${avgLeft}</td><td></td></tr>
      </table>
    `;
    div.appendChild(divWeek);
  });
}

function loadMonthlyView() {
  const div = document.getElementById('monthlyView');
  div.innerHTML = '';
  const monthlyGroups = {};

  historyLog.forEach(entry => {
    const month = entry.date.slice(0, 7);
    if (!monthlyGroups[month]) monthlyGroups[month] = [];
    monthlyGroups[month].push(entry);
  });

  Object.entries(monthlyGroups).forEach(([month, entries]) => {
    const divMonth = document.createElement('div');
    divMonth.innerHTML = `
      <h3>${month}</h3>
      <table>
        <tr><th>Date</th><th>Calories</th><th>Protein</th></tr>
        ${entries.map(e => `<tr><td>${e.date}</td><td>${e.calories}</td><td>${e.protein}</td></tr>`).join('')}
      </table>
    `;
    div.appendChild(divMonth);
  });
}

// Init
updateTable();
loadHistoryView();
