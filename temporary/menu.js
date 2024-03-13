window.onload = async function() {
    try {
      const response = await fetch('/items');
      const items = await response.json();
      
      const menuContainer = document.getElementById('menu-container');
      items.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('menu-item');
        
        const name = document.createElement('p');
        name.textContent = `Name: ${item.name}`;
        
        const price = document.createElement('p');
        price.textContent = `Price: ${item.price}`;
        
        const vegNonVeg = document.createElement('p');
        vegNonVeg.textContent = `Veg/Non-Veg: ${item.veg_noveg}`;
        
        const image = document.createElement('img');
        image.src = `data:${item.image.contentType};base64,${item.image.data}`;
        
        div.appendChild(name);
        div.appendChild(price);
        div.appendChild(vegNonVeg);
        div.appendChild(image);
        
        menuContainer.appendChild(div);
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Error fetching menu items. Please try again later.');
    }
};
