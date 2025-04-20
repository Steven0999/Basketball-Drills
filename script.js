// ------------------ VARIABLES AND INITIAL SETUP ------------------ let foodLog = JSON.parse(localStorage.getItem('foodLog')) || []; let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || []; let historyLog = JSON.parse(localStorage.getItem('historyLog')) || [];

let goals = { calories: parseInt(localStorage.getItem('goalCalories')) || 0, protein: parseInt(localStorage.getItem('goalProtein')) || 0 };

let userWeight = parseFloat(localStorage.getItem('userWeight')) || 70;

// ------------------ TAB SWITCHING ------------------ function switchTab(event, tabId) { document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(tabId).classList.add('active'); event.target.classList.add('active'); if (tabId === 'historyTab') { populateHistory(); } }

// ------------------ FOOD SEARCH ------------------ function searchFood() { const input = document.getElementById('searchInput').value.toLowerCase(); const resultsDiv = document.getElementById('searchResults'); resultsDiv.innerHTML = '';

const matches = foodDatabase.filter(f => f.name.toLowerCase().includes(input));

if (matches.length) { matches.forEach(food => { const div = document.createElement('div'); div.textContent = food.name; div.onclick = () => { document.getElementById('searchInput').value = food.name; resultsDiv.innerHTML = ''; }; resultsDiv.appendChild(div); }); } else if (input.length > 2) { const div = document.createElement('div'); div.textContent = Food not found. Click to create "${input}"; div.onclick = () => { document.getElementById('newFoodName').value = input; switchTab({ target: document.querySelector('[data-tab="createTab"]') }, 'createTab'); }; resultsDiv.appendChild(div); } }

// ------------------ ADD ENTRY ------------------ function addEntry() { const name = document.getElementById('searchInput').value.trim(); const qty = parseInt(document.getElementById('quantity').value); const meal = document.getElementById('mealType').value; const type = document.getElementById('servingType').value; const customWeight = parseFloat(document.getElementById('customWeight').value);

const food = foodDatabase.find(f => f.name.toLowerCase() === name.toLowerCase());

if (!food || isNaN(qty)) { alert('Please select a valid food and quantity.'); return; }

let cal = food.calories; let pro = food.protein;

if (type === 'custom') { if (isNaN(customWeight)) return alert("Enter valid weight"); cal = (cal / 100) * customWeight; pro = (pro / 100) * customWeight; }

foodLog.push({ name: food.name, calories: cal, protein: pro, qty, meal }); localStorage.setItem('foodLog', JSON.stringify(foodLog)); updateTable();

document.getElementById('quantity').value = 1; document.getElementById('searchInput').value = ''; document.getElementById('searchResults').innerHTML = ''; }

// ------------------ UPDATE TABLE ------------------ function updateTable() { const logBody = document.getElementById('logBody'); logBody.innerHTML = '';

const meals = ['Breakfast', 'Lunch', 'Dinner']; let totalCal = 0; let totalPro = 0;

meals.forEach(meal => { const mealItems = foodLog.filter(item => item.meal === meal); if (mealItems.length) { const headerRow = document.createElement('tr'); headerRow.innerHTML = <td colspan="6" class="meal-header">${meal}</td>; logBody.appendChild(headerRow);

let mealCal = 0;
  let mealPro = 0;

  mealItems.forEach((item, index) => {
    const cal = item.calories * item.qty;
    const pro = item.protein * item.qty;
    mealCal += cal;
    mealPro += pro;
    totalCal += cal;
    totalPro += pro;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.meal}</td>
      <td>${cal.toFixed(1)}</td>
      <td>${pro.toFixed(1)}</td>
      <td>${item.qty}</td>
      <td><button onclick="removeLogEntry(${foodLog.indexOf(item)})">X</button></td>
    `;
    logBody.appendChild(row);
  });

  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td colspan="2"><strong>${meal} Totals:</strong></td>
    <td><strong>${mealCal.toFixed(1)}</strong></td>
    <td><strong>${mealPro.toFixed(1)}</strong></td>
    <td colspan="2"></td>
  `;
  logBody.appendChild(totalRow);
}

});

document.getElementById('goalCalories').textContent = goals.calories; document.getElementById('goalProtein').textContent = goals.protein; document.getElementById('totalCalories').textContent = totalCal.toFixed(1); document.getElementById('totalProtein').textContent = totalPro.toFixed(1); document.getElementById('remainingCalories').textContent = Math.max(goals.calories - totalCal, 0).toFixed(1); document.getElementById('remainingProtein').textContent = Math.max(goals.protein - totalPro, 0).toFixed(1); }

function removeLogEntry(index) { foodLog.splice(index, 1); localStorage.setItem('foodLog', JSON.stringify(foodLog)); updateTable(); }

function resetLog() { if (confirm('Clear your log?')) { foodLog = []; localStorage.removeItem('foodLog'); updateTable(); } }

function saveGoals() { const calInput = parseInt(document.getElementById('goalCaloriesInput').value); const proInput = parseInt(document.getElementById('goalProteinInput').value); const weightInput = parseFloat(document.getElementById('userWeightInput').value);

if (!isNaN(calInput)) { goals.calories = calInput; localStorage.setItem('goalCalories', calInput); } if (!isNaN(proInput)) { goals.protein = proInput; localStorage.setItem('goalProtein', proInput); } if (!isNaN(weightInput)) { userWeight = weightInput; localStorage.setItem('userWeight', weightInput); }

alert("Goals and weight saved!"); updateTable(); switchTab({ target: document.querySelector('.tab-btn[data-tab="trackerTab"]') }, 'trackerTab'); }

// ------------------ SAVE DAY TO HISTORY ------------------ function saveDay() { const today = new Date().toISOString().split('T')[0]; const totalCalories = parseFloat(document.getElementById('totalCalories').textContent); const totalProtein = parseFloat(document.getElementById('totalProtein').textContent);

historyLog = historyLog.filter(entry => entry.date !== today); historyLog.push({ date: today, calories: totalCalories, protein: totalProtein }); localStorage.setItem('historyLog', JSON.stringify(historyLog)); alert("Day saved to history!"); }

// ------------------ POPULATE HISTORY ------------------ function populateHistory() { const historyTable = document.getElementById('historyTable'); historyTable.innerHTML = '';

const grouped = {};

historyLog.forEach(entry => { const date = new Date(entry.date); const weekStart = new Date(date); weekStart.setDate(date.getDate() - date.getDay()); // Monday const weekKey = weekStart.toISOString().split('T')[0];

if (!grouped[weekKey]) grouped[weekKey] = [];
grouped[weekKey].push(entry);

});

for (const week in grouped) { const weekEntries = grouped[week]; let totalCal = 0, totalPro = 0;

historyTable.innerHTML += `<tr><th colspan="4">Week starting ${week}</th></tr>`;
weekEntries.forEach(entry => {
  totalCal += entry.calories;
  totalPro += entry.protein;
  historyTable.innerHTML += `
    <tr>
      <td>${entry.date}</td>
      <td>${entry.calories.toFixed(1)}</td>
      <td>${entry.protein.toFixed(1)}</td>
      <td>${(entry.protein / userWeight).toFixed(2)} g/kg</td>
    </tr>
  `;
});

const daysLeft = 7 - weekEntries.length;
const remainingCalories = (goals.calories * 7) - totalCal;
const avgRemaining = daysLeft > 0 ? (remainingCalories / daysLeft) : 0;

historyTable.innerHTML += `
  <tr class="weekly-summary">
    <td><strong>Weekly Total</strong></td>
    <td>${totalCal.toFixed(1)}</td>
    <td>${totalPro.toFixed(1)}</td>
    <td>${avgRemaining.toFixed(1)} cal/day left</td>
  </tr>
`;

} }

// ------------------ INIT ------------------ updateTable();

