// displayItems.js

// Function to fetch and display items
async function displayItems() {
  try {
    // Fetch items data from the server
    const response = await fetch("/items");
    const items = await response.json();

    // Display items in the item-container div
    const itemContainer = document.getElementById("item-container");
    itemContainer.innerHTML = ''; // Clear previous content

    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('item');

      // Create img element
      const img = document.createElement('img');
      img.alt = item.name;

      // Set src attribute using Blob and URL.createObjectURL
      const blob = new Blob([item.image.data], { type: item.image.contentType });
      const imageUrl = URL.createObjectURL(blob);
      img.src = imageUrl;

      img.classList.add('item-image');

      const itemName = document.createElement('p');
      itemName.textContent = `Name: ${item.name}`;

      const itemPrice = document.createElement('p');
      itemPrice.textContent = `Price: ${item.price}`;

      const itemVegNonVeg = document.createElement('p');
      itemVegNonVeg.textContent = `Veg/Non-Veg: ${item.veg_noveg}`;

      itemDiv.appendChild(img);
      itemDiv.appendChild(itemName);
      itemDiv.appendChild(itemPrice);
      itemDiv.appendChild(itemVegNonVeg);

      itemContainer.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

// Call the function when the page loads
window.onload = displayItems;
