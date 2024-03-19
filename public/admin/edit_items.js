document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch item details and populate the form
    async function fetchItemDetails(itemId) {
      try {
        const response = await fetch(`/items/${itemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }
        const item = await response.json();
        populateForm(item);
      } catch (error) {
        console.error('Error fetching item details:', error);
      }
    }
  
    // Function to populate the form fields with item details
    function populateForm(item) {
      document.getElementById('name').value = item.name;
      document.getElementById('price').value = item.price;
      document.getElementById('veg_noveg').value = item.veg_noveg;
      // You may need to handle image display separately depending on your setup
    }
  
    // Get item ID from URL or wherever it's stored
    const itemId = 'PUT_ITEM_ID_HERE'; // Replace with actual item ID
  
    // Call the function to fetch item details and populate the form
    fetchItemDetails(itemId);
  
    // Handle form submission
    document.getElementById('edit-item-form').addEventListener('submit', async function(event) {
      event.preventDefault(); // Prevent default form submission
  
      const formData = new FormData(this); // Get form data
      try {
        const response = await fetch(`/update-item/${itemId}`, {
          method: 'PUT', // or 'PATCH' depending on your server configuration
          body: formData
        });
        if (!response.ok) {
          throw new Error('Failed to update item');
        }
        alert('Item updated successfully');
        // Optionally, redirect or perform any other action after successful update
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item');
      }
    });
  });
  