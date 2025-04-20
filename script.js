let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];
let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];

let goals = {
  calories: parseInt(localStorage.getItem('goalCalories')) || 0,
  protein: parseInt(localStorage.getItem('goalProtein')) || 0
};

let userWeight = parseFloat(localStorage.getItem('userWeight')) || 0;

function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');

  if (tabId === 'historyTab') {
    updateHistoryView('daily');
  }
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

  foodLog.push({ name: food.name, calories: cal, protein: pro, qty, meal, date: new Date().toISOString().split('T')[0] });
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
  document.getElementById('quantity').value = 1;
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

function updateTable() {
  const logBody = document.getElementById('logBody');
  if (!logBody) return;

  logBody.innerHTML = '';
  const addedMeals = new Set();
  let totalCal = 0;
  let totalPro = 0;
  const mealTotals = {};

  foodLog.forEach((item, index) => {
    if (!addedMeals.has(item.meal)) {
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="6" class="meal-header">${item.meal}</td>`;
      logBody.appendChild(headerRow);
      addedMeals.add(item.meal);
      mealTotals[item.meal] = { calories: 0, protein: 0 };
    }

    const cal = item.calories * item.qty;
    const pro = item.protein * item.qty;

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

    totalCal += cal;
    totalPro += pro;

    mealTotals[item.meal].calories += cal;
    mealTotals[item.meal].protein += pro;
  });

  // Add subtotals per meal
  for (let meal of Object.keys(mealTotals)) {
    const totalRow = document.createElement('tr');
    totalRow.className = 'meal-total';
    totalRow.innerHTML = `
      <td colspan="2">${meal} Total</td>
      <td>${mealTotals[meal].calories.toFixed(1)}</td>
      <td>${mealTotals[meal].protein.toFixed(1)}</td>
      <td colspan="2"></td>
    `;
    logBody.appendChild(totalRow);
  }

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

  switchTab({ target: document.querySelector('.tab-btn[data-tab="trackerTab"]') }, 'trackerTab');
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
    userWeight = weightInput;
    localStorage.setItem('userWeight', weightInput);
  }

  alert("Goals and weight saved!");
  updateTable();
  switchTab({ target: document.querySelector('.tab-btn[data-tab="trackerTab"]') }, 'trackerTab');
}

function saveDaySummary() {
  const today = new Date().toISOString().split('T')[0];
  const totalCalories = parseFloat(document.getElementById('totalCalories').textContent);
  const totalProtein = parseFloat(document.getElementById('totalProtein').textContent);

  historyLog = historyLog.filter(entry => entry.date !== today);
  historyLog.push({ date: today, calories: totalCalories, protein: totalProtein });

  localStorage.setItem('historyLog', JSON.stringify(historyLog));
  alert("Day saved to history!");
}

function updateHistoryView(viewType) {
  const container = document.getElementById('historyView');
  container.innerHTML = '';

  const sorted = [...historyLog].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (viewType === 'daily') {
    sorted.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'history-entry';
      div.innerHTML = `<strong>${entry.date}</strong>: ${entry.calories} cal, ${entry.protein} g protein`;
      container.appendChild(div);
    });
  } else if (viewType === 'weekly') {
    const weekly = {};

    sorted.forEach(entry => {
      const week = getWeekStart(entry.date);
      if (!weekly[week]) weekly[week] = [];
      weekly[week].push(entry);
    });

    for (let week in weekly) {
      const weekEntries = weekly[week];
      const totalCals = weekEntries.reduce((sum, e) => sum + e.calories, 0);
      const totalProt = weekEntries.reduce((sum, e) => sum + e.protein, 0);
      const avgPerKg = userWeight ? {
        cal: (totalCals / userWeight).toFixed(1),
        pro: (totalProt / userWeight).toFixed(1)
      } : { cal: "N/A", pro: "N/A" };

      const div = document.createElement('div');
      div.className = 'history-entry';
      div.innerHTML = `
        <strong>Week of ${week}</strong><br>
        Total: ${totalCals} cal, ${totalProt} g protein<br>
        Per kg (Weight: ${userWeight || "?"}kg): ${avgPerKg.cal} cal/kg, ${avgPerKg.pro} g/kg
      `;
      container.appendChild(div);
    }
  } else if (viewType === 'monthly') {
    const calendar = document.createElement('div');
    calendar.className = 'calendar';

    sorted.forEach(entry => {
      const box = document.createElement('div');
      box.className = 'calendar-day';
      box.innerHTML = `<strong>${entry.date}</strong><br>${entry.calories} cal<br>${entry.protein} g`;
      calendar.appendChild(box);
    });

    container.appendChild(calendar);
  }
}

function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const diff = date.getDate() - date.getDay();
  const start = new Date(date.setDate(diff));
  return start.toISOString().split('T')[0];
}

function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (decodedText) => {
      html5QrCode.stop();
      fetchFoodFromBarcode(decodedText);
    }
  );
}

async function fetchFoodFromBarcode(barcode) {
  const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  const data = await response.json();

  if (data.status === 1) {
    const product = data.product;
    document.getElementById('newFoodName').value = product.product_name || '';
    document.getElementById('newCalories').value = product.nutriments["energy-kcal_100g"] || '';
    document.getElementById('newProtein').value = product.nutriments.proteins_100g || '';
    switchTab({ target: document.querySelector('.tab-btn[data-tab="createTab"]') }, 'createTab');
  } else {
    alert("Food not found. Please enter manually.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateTable();
});
