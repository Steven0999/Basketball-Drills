let foodDatabase = [];
let log = [];
let calorieGoal = 0;
let proteinGoal = 0;

function switchTab(evt, tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
  updateDropdown();
  updateGoalsDisplay();
}

function updateDropdown() {
  const select = document.getElementById('foodSelect');
  select.innerHTML = '<option value="">Select Item</option>';
  foodDatabase.forEach((food, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = food.name;
    select.appendChild(option);
  });
}

function addFoodAndReturn() {
  const name = document.getElementById('newFoodName').value.trim();
  const calories = parseFloat(document.getElementById('newCalories').value);
  const protein = parseFloat(document.getElementById('newProtein').value);

  if (!name || isNaN(calories) || isNaN(protein)) {
    alert("Please enter valid food data.");
    return;
  }

  foodDatabase.push({ name, calories, protein });
  updateDropdown();
  updateFoodDatabaseTable();
  document.getElementById('newFoodName').value = '';
  document.getElementById('newCalories').value = '';
  document.getElementById('newProtein').value = '';
  switchTab({ currentTarget: document.querySelector('.tab-btn') }, 'trackerTab');
}

function updateFoodDatabaseTable() {
  const tbody = document.getElementById('foodDatabaseBody');
  tbody.innerHTML = '';
  foodDatabase.forEach((food, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td>${food.protein}</td>
      <td><button onclick="deleteFood(${index})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

function deleteFood(index) {
  foodDatabase.splice(index, 1);
  updateDropdown();
  updateFoodDatabaseTable();
}

function addEntry() {
  const index = document.getElementById('foodSelect').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  if (index === '' || isNaN(quantity) || quantity <= 0) {
    alert("Please select a food and enter a valid quantity.");
    return;
  }

  const food = foodDatabase[index];
  log.push({ ...food, quantity });
  updateLog();
}

function updateLog() {
  const tbody = document.getElementById('logBody');
  tbody.innerHTML = '';
  let totalCalories = 0;
  let totalProtein = 0;

  log.forEach((entry, index) => {
    const calories = entry.calories * entry.quantity;
    const protein = entry.protein * entry.quantity;
    totalCalories += calories;
    totalProtein += protein;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.name}</td>
      <td>${calories}</td>
      <td>${protein}</td>
      <td>${entry.quantity}</td>
      <td><button onclick="removeEntry(${index})">X</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('totalCalories').textContent = totalCalories;
  document.getElementById('totalProtein').textContent = totalProtein;

  document.getElementById('remainingCalories').textContent = calorieGoal - totalCalories;
  document.getElementById('remainingProtein').textContent = proteinGoal - totalProtein;
}

function removeEntry(index) {
  log.splice(index, 1);
  updateLog();
}

function resetLog() {
  log = [];
  updateLog();
}

function saveGoals() {
  calorieGoal = parseInt(document.getElementById('goalCaloriesInput').value) || 0;
  proteinGoal = parseInt(document.getElementById('goalProteinInput').value) || 0;
  updateGoalsDisplay();
  switchTab({ currentTarget: document.querySelectorAll('.tab-btn')[0] }, 'trackerTab');
}

function updateGoalsDisplay() {
  document.getElementById('goalCalories').textContent = calorieGoal;
  document.getElementById('goalProtein').textContent = proteinGoal;

  const totalCalories = parseInt(document.getElementById('totalCalories').textContent) || 0;
  const totalProtein = parseInt(document.getElementById('totalProtein').textContent) || 0;

  document.getElementById('remainingCalories').textContent = calorieGoal - totalCalories;
  document.getElementById('remainingProtein').textContent = proteinGoal - totalProtein;
}

function startScanner() {
  const readerElement = document.getElementById('reader');
  readerElement.style.display = 'block';
  readerElement.innerHTML = '';

  const scanner = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes("back") || device.label.toLowerCase().includes("rear")
      );
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      scanner.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        barcode => {
          scanner.stop().then(() => {
            readerElement.innerHTML = '';
            fetchFromOpenFoodFacts(barcode);
          });
        },
        error => { /* Ignore scan errors */ }
      ).catch(err => {
        console.error("Failed to start camera:", err);
        alert("Could not access camera.");
      });
    } else {
      alert("No camera found.");
    }
  }).catch(err => {
    console.error("Camera access error:", err);
    alert("Camera error.");
  });
}

function fetchFromOpenFoodFacts(barcode) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.status === 1) {
        const product = data.product;
        document.getElementById('newFoodName').value = product.product_name || '';
        document.getElementById('newCalories').value = product.nutriments['energy-kcal_100g'] || '';
        document.getElementById('newProtein').value = product.nutriments['proteins_100g'] || '';
        alert("Food data loaded from barcode!");
      } else {
        alert("Product not found.");
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      alert("API fetch failed.");
    });
}
