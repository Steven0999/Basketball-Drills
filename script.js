let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];
let foodDatabase = JSON.parse(localStorage.getItem('foodDatabase')) || [];
let savedDays = JSON.parse(localStorage.getItem('savedDays')) || {};

let goals = {
  calories: parseInt(localStorage.getItem('goalCalories')) || 0,
  protein: parseInt(localStorage.getItem('goalProtein')) || 0,
  weight: parseFloat(localStorage.getItem('bodyWeight')) || 0
};

function switchTab(event, tabId) {
  const allTabs = document.querySelectorAll('.tab-content');
  const allButtons = document.querySelectorAll('.tab-btn');

  allTabs.forEach(tab => tab.classList.remove('active'));
  allButtons.forEach(btn => btn.classList.remove('active'));

  const selectedTab = document.getElementById(tabId);
  const clickedButton = event?.target;

  if (selectedTab) selectedTab.classList.add('active');
  if (clickedButton) clickedButton.classList.add('active');

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

  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  meals.forEach(meal => {
    const items = foodLog.filter(item => item.meal === meal);
    if (!items.length) return;

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<td colspan="6" class="meal-header">${meal}</td>`;
    logBody.appendChild(headerRow);

    let mealCalories = 0;
    let mealProtein = 0;

    items.forEach((item, index) => {
      const cal = item.calories * item.qty;
      const pro = item.protein * item.qty;

      mealCalories += cal;
      mealProtein += pro;

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

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `<td colspan="2"><strong>${meal} Total</strong></td>
      <td><strong>${mealCalories.toFixed(1)}</strong></td>
      <td><strong>${mealProtein.toFixed(1)}</strong></td><td colspan="2"></td>`;
    logBody.appendChild(totalRow);
  });

  const totalCal = foodLog.reduce((sum, item) => sum + item.calories * item.qty, 0);
  const totalPro = foodLog.reduce((sum, item) => sum + item.protein * item.qty, 0);

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
  const weight = parseFloat(document.getElementById('bodyWeight').value);

  if (!isNaN(calInput)) {
    goals.calories = calInput;
    localStorage.setItem('goalCalories', calInput);
  }
  if (!isNaN(proInput)) {
    goals.protein = proInput;
    localStorage.setItem('goalProtein', proInput);
  }
  if (!isNaN(weight)) {
    goals.weight = weight;
    localStorage.setItem('bodyWeight', weight);
  }

  alert("Goals saved!");
  updateTable();
  switchTab({ target: document.querySelector('.tab-btn') }, 'trackerTab');
}

// Add any history or database features if needed...

// Initialize
updateTable();
