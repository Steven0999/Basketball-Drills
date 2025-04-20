// Initialize food log, food database, and goals
let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];

let goals = {
  calories: parseInt(localStorage.getItem('goalCalories')) || 0,
  protein: parseInt(localStorage.getItem('goalProtein')) || 0
};

let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];
let userWeight = parseFloat(localStorage.getItem('userWeight')) || 70; // Default weight is 70kg if not set

// Switch between tabs
function switchTab(event, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

// Search food in the food database
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

// Toggle custom weight input
function toggleCustomWeight() {
  const type = document.getElementById('servingType').value;
  document.getElementById('customWeight').style.display = type === 'custom' ? 'inline-block' : 'none';
}

// Add food entry to the log
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

// Update the food log table
function updateTable() {
  const logBody = document.getElementById('logBody');
  logBody.innerHTML = '';

  const addedMeals = new Set();
  let totalCal = 0;
  let totalPro = 0;

  foodLog.forEach((item, index) => {
    if (!addedMeals.has(item.meal)) {
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<td colspan="6" class="meal-header">${item.meal}</td>`;
      logBody.appendChild(headerRow);
      addedMeals.add(item.meal);
    }

    const row = document.createElement('tr');
    const cal = item.calories * item.qty;
    const pro = item.protein * item.qty;

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
  });

  document.getElementById('goalCalories').textContent = goals.calories;
  document.getElementById('goalProtein').textContent = goals.protein;
  document.getElementById('totalCalories').textContent = totalCal.toFixed(1);
  document.getElementById('totalProtein').textContent = totalPro.toFixed(1);
  document.getElementById('remainingCalories').textContent = Math.max(goals.calories - totalCal, 0).toFixed(1);
  document.getElementById('remainingProtein').textContent = Math.max(goals.protein - totalPro, 0).toFixed(1);
}

// Remove a food entry from the log
function removeLogEntry(index) {
  foodLog.splice(index, 1);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateTable();
}

// Reset the food log
function resetLog() {
  if (confirm('Clear your log?')) {
    foodLog = [];
    localStorage.removeItem('foodLog');
    updateTable();
  }
}

// Add a new food item to the food database
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

// Save daily calories and protein data
function saveDaySummary() {
  const today = new Date().toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format
  const totalCalories = parseFloat(document.getElementById('totalCalories').textContent);
  const totalProtein = parseFloat(document.getElementById('totalProtein').textContent);

  // Ensure that there's a total for the day to save
  if (isNaN(totalCalories) || isNaN(totalProtein)) {
    alert('Total calories and protein values are missing. Please check your data.');
    return;
  }

  // Create a new entry for the day's log
  const daySummary = { date: today, calories: totalCalories, protein: totalProtein };

  // Check if the entry for today already exists and update or add it
  const existingEntryIndex = historyLog.findIndex(entry => entry.date === today);
  if (existingEntryIndex !== -1) {
    // If entry for today exists, update it
    historyLog[existingEntryIndex] = daySummary;
  } else {
    // If no entry for today, add it
    historyLog.push(daySummary);
  }

  // Save the updated history to localStorage
  localStorage.setItem('historyLog', JSON.stringify(historyLog));

  // Alert user that the data is saved
  alert("Day saved to history!");

  // Update the history view to reflect the saved data
  updateHistoryView('daily');
}

// Update history view for daily, weekly, or monthly
function updateHistoryView(viewType) {
  const container = document.getElementById('historyView');
  container.innerHTML = '';

  const sorted = [...historyLog].sort((a, b) => new Date(b.date) - new Date(a.date));  // Sort by date

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

// Get the start of the week from a date
function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const diff = date.getDate() - date.getDay();
  const start = new Date(date.setDate(diff));
  return start.toISOString().split('T')[0];
}

// Init
updateTable();
