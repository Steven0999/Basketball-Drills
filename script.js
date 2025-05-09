let foodDatabase = [];
let foodLog = [];
let goals = { calories: 0, protein: 0 };

function switchTab(evt, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

function addFoodAndReturn() {
  const name = document.getElementById('newFoodName').value;
  const calories = parseFloat(document.getElementById('newCalories').value);
  const protein = parseFloat(document.getElementById('newProtein').value);
  if (!name || isNaN(calories) || isNaN(protein)) return;

  foodDatabase.push({ name, calories, protein });
  updateFoodSelect();
  updateDatabaseTable();
  switchTab({ currentTarget: document.querySelector('.tab-btn') }, 'trackerTab');
}

function updateFoodSelect() {
  const select = document.getElementById('foodSelect');
  select.innerHTML = '<option value="">Select Item</option>';
  foodDatabase.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

function updateDatabaseTable() {
  const body = document.getElementById('foodDatabaseBody');
  body.innerHTML = '';
  foodDatabase.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.calories}</td>
      <td>${item.protein}</td>
      <td><button onclick="deleteFood(${index})">X</button></td>
    `;
    body.appendChild(row);
  });
}

function deleteFood(index) {
  foodDatabase.splice(index, 1);
  updateFoodSelect();
  updateDatabaseTable();
}

function addEntry() {
  const foodIndex = document.getElementById('foodSelect').value;
  const quantity = parseFloat(document.getElementById('quantity').value) || 1;
  const isSnack = document.getElementById('isSnack').checked;
  if (foodIndex === "") return;

  const food = foodDatabase[foodIndex];
  const entry = {
    ...food,
    quantity,
    isSnack
  };

  foodLog.push(entry);
  renderLog();
}

function renderLog() {
  const logBody = document.getElementById('logBody');
  const snackBody = document.getElementById('snackBody');
  logBody.innerHTML = "";
  snackBody.innerHTML = "";

  let totalCals = 0, totalPro = 0;

  foodLog.forEach((item, index) => {
    const cals = item.calories * item.quantity;
    const pro = item.protein * item.quantity;
    const pct = cals > 0 ? ((pro * 4 / cals) * 100).toFixed(1) + '%' : '0%';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${cals.toFixed(1)}</td>
      <td>${pro.toFixed(1)}</td>
      <td>${pct}</td>
      <td>${item.quantity}</td>
      <td><button onclick="removeEntry(${index})">X</button></td>
    `;

    if (item.isSnack) {
      snackBody.appendChild(row);
    } else {
      totalCals += cals;
      totalPro += pro;
      logBody.appendChild(row);
    }
  });

  document.getElementById('totalCalories').textContent = totalCals.toFixed(1);
  document.getElementById('totalProtein').textContent = totalPro.toFixed(1);
  document.getElementById('goalCalories').textContent = goals.calories;
  document.getElementById('goalProtein').textContent = goals.protein;
  document.getElementById('remainingCalories').textContent = (goals.calories - totalCals).toFixed(1);
  document.getElementById('remainingProtein').textContent = (goals.protein - totalPro).toFixed(1);
}

function removeEntry(index) {
  foodLog.splice(index, 1);
  renderLog();
}

function resetLog() {
  foodLog = [];
  renderLog();
}

function saveGoals() {
  const cal = parseFloat(document.getElementById('goalCaloriesInput').value);
  const pro = parseFloat(document.getElementById('goalProteinInput').value);
  if (!isNaN(cal)) goals.calories = cal;
  if (!isNaN(pro)) goals.protein = pro;
  renderLog();
}

function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          alert(`Scanned: ${qrCodeMessage}`);
          html5QrCode.stop();
        }
      );
    }
  }).catch(err => console.error(err));
}
