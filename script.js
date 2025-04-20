let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];
let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];

let goals = {
  calories: parseInt(localStorage.getItem('goalCalories')) || 0,
  protein: parseInt(localStorage.getItem('goalProtein')) || 0,
  weight: parseFloat(localStorage.getItem('userWeight')) || 70
};

function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
  if (tabId === 'databaseTab') populateDatabaseTable();
  if (tabId === 'historyTab') changeHistoryView('daily');
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

  if (!food || isNaN(qty)) {
    alert('Please select a valid food and quantity.');
    return;
  }

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
  const mealTotals = {};

  foodLog.forEach((item, index) => {
    if (!addedMeals.has(item.meal)) {
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="6" class="meal-header">${item.meal}</td>`;
      logBody.appendChild(headerRow);
      mealTotals[item.meal] = { cal: 0, pro: 0 };
      addedMeals.add(item.meal);
    }

    const row = document.createElement('tr');
    const cal = item.calories * item.qty;
    const pro = item.protein * item.qty;

    mealTotals[item.meal].cal += cal;
    mealTotals[item.meal].pro += pro;

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

  // Insert totals
  for (const meal in mealTotals) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="2"><strong>${meal} Total</strong></td>
      <td><strong>${mealTotals[meal].cal.toFixed(1)}</strong></td>
      <td><strong>${mealTotals[meal].pro.toFixed(1)}</strong></td>
      <td colspan="2"></td>
    `;
    logBody.appendChild(row);
  }

  const totalCal = Object.values(mealTotals).reduce((sum, m) => sum + m.cal, 0);
  const totalPro = Object.values(mealTotals).reduce((sum, m) => sum + m.pro, 0);

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

function addFoodAndReturn() {
  const name = document.getElementById('newFoodName').value.trim();
  const calories = parseFloat(document.getElementById('newCalories').value);
  const protein = parseFloat(document.getElementById('newProtein').value);

  if (!name || isNaN(calories) || isNaN(protein)) {
    alert('Please complete all fields.');
    return;
  }

  foodDatabase.push({ name, calories, protein });
  localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));

  document.getElementById('newFoodName').value = '';
  document.getElementById('newCalories').value = '';
  document.getElementById('newProtein').value = '';

  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
}

function searchDatabase(query) {
  const tbody = document.getElementById('foodDatabaseBody');
  tbody.innerHTML = '';
  const results = foodDatabase.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  if (!results.length) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4">No food found. Add it using "Add Food" tab.</td>`;
    tbody.appendChild(row);
    return;
  }
  results.forEach((f, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${f.name}</td>
      <td>${f.calories}</td>
      <td>${f.protein}</td>
      <td><button onclick="editDatabaseItem(${i})">Edit</button></td>
    `;
    tbody.appendChild(row);
  });
}

function editDatabaseItem(index) {
  const item = foodDatabase[index];
  const name = prompt("Edit name:", item.name);
  const calories = prompt("Edit calories:", item.calories);
  const protein = prompt("Edit protein:", item.protein);
  if (name && !isNaN(calories) && !isNaN(protein)) {
    foodDatabase[index] = { name, calories: parseFloat(calories), protein: parseFloat(protein) };
    localStorage.setItem('foodDatabase', JSON.stringify(foodDatabase));
    searchDatabase('');
  }
}

function populateDatabaseTable() {
  searchDatabase('');
}

function saveGoals() {
  const calInput = parseInt(document.getElementById('goalCaloriesInput').value);
  const proInput = parseInt(document.getElementById('goalProteinInput').value);
  const weightInput = parseFloat(document.getElementById('userWeightInput').value);

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

function saveToday() {
  const date = new Date().toISOString().split('T')[0];
  const totalCalories = parseFloat(document.getElementById('totalCalories').textContent);
  const totalProtein = parseFloat(document.getElementById('totalProtein').textContent);
  const entry = { date, calories: totalCalories, protein: totalProtein };
  const existing = historyLog.find(e => e.date === date);
  if (existing) Object.assign(existing, entry);
  else historyLog.push(entry);
  localStorage.setItem('historyLog', JSON.stringify(historyLog));
  alert("Day saved!");
}

function changeHistoryView(view) {
  const container = document.getElementById('historyView');
  container.innerHTML = '';
  const weight = goals.weight || 1;

  if (view === 'daily') {
    historyLog.forEach(log => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${log.date}</strong>: ${log.calories} cal, ${log.protein}g protein`;
      container.appendChild(div);
    });
  } else if (view === 'weekly') {
    const weekData = {};
    historyLog.forEach(log => {
      const week = new Date(log.date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
      weekData[week] = weekData[week] || { calories: 0, protein: 0, days: 0 };
      weekData[week].calories += log.calories;
      weekData[week].protein += log.protein;
      weekData[week].days++;
    });

    for (let w in weekData) {
      const avgCal = (weekData[w].calories / weekData[w].days).toFixed(1);
      const avgPro = (weekData[w].protein / weekData[w].days).toFixed(1);
      const calPerKg = (weekData[w].calories / weight).toFixed(1);
      const div = document.createElement('div');
      div.innerHTML = `<strong>${w}</strong><br>Avg Cal: ${avgCal}, Avg Pro: ${avgPro}, Cal/kg: ${calPerKg}`;
      container.appendChild(div);
    }
  } else if (view === 'monthly') {
    const months = {};
    historyLog.forEach(log => {
      const month = log.date.slice(0, 7); // yyyy-mm
      months[month] = months[month] || [];
      months[month].push(log);
    });

    for (const m in months) {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${m}</strong><br>`;
      months[m].forEach(log => {
        div.innerHTML += `${log.date}: ${log.calories} cal, ${log.protein}g<br>`;
      });
      container.appendChild(div);
    }
  }
}

// Barcode scanning
function startScanner() {
  const scanner = new Html5Qrcode("reader");
  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      alert(`Scanned: ${decodedText}`);
      scanner.stop();
    },
    (error) => {}
  ).catch(err => alert("Scan error: " + err));
}

// Init
updateTable();
