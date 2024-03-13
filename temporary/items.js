window.onload = async function() {
    try {
      const response = await fetch('/items');
      const items = await response.json();
      
      const itemsContainer = document.getElementById('items-container');
      
      items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        
        const namePara = document.createElement('p');
        namePara.textContent = `Name: ${item.name}`;
        
        const pricePara = document.createElement('p');
        pricePara.textContent = `Price: ${item.price}`;
        
        const vegNonvegPara = document.createElement('p');
        vegNonvegPara.textContent = `Veg/Non-Veg: ${item.veg_noveg}`;
        
        const image = document.createElement('img');
        image.src = `data:${item.image.contentType};base64,${item.image.data}`;
        
        itemDiv.appendChild(namePara);
        itemDiv.appendChild(pricePara);
        itemDiv.appendChild(vegNonvegPara);
        itemDiv.appendChild(image);
        
        itemsContainer.appendChild(itemDiv);
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Error fetching items. Please try again later.');
    }
  };
  