const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { exec } = require("child_process");
const multer = require("multer");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the MongoDB database
mongoose
  .connect(
    "mongodb+srv://krishnasairaj:3TLvpofXOtrP94NE@cluster1.katgqk9.mongodb.net/fastfood?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const db = mongoose.connection;
db.on("error", () => console.log("Error in connecting to database"));
db.once("open", () => console.log("Connected to Database"));

// Redirect to the login page
app.get("/", (req, res) => {
  // res.redirect('register/register.html');
  res.redirect('register/register.html');
});

app.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;
    const user = await db
      .collection("creds")
      .findOne({ username: username });

    if (!user) {
      response.send(`
        <script>
          alert("Invalid Username or Password");
          window.location.href = "/login/index.html";
        </script>
      `);
    } else {
      // Check if the user is admin
      if (username === "admin" && user.password === password) {
        // Redirect to admin.html if user is admin
        response.redirect("/admin/home/home.html");
        // response.redirect("/home/home.html");
      } else if (user.password === password) {
        // Redirect to home.html for regular users
        response.redirect("/error/404.html");
      } else {
        // Invalid password
        response.send(`
          <script>
            alert("Invalid Username or Password");
            window.location.href = "/login/index.html";
          </script>
        `);
      }
    }
  } catch (error) {
    response.status(500).send("Internal server error");
  }
});


// Registration route
app.post("/register", async (request, response) => {
  try {
    const { username, name, email, password } = request.body;

    // Check if the user already exists
    const existingUser = await db.collection("creds").findOne({ email: email });
    if (existingUser) {
      return response.send("User already exists!");
    }

    // Create a new user
    await db.collection("creds").insertOne({
      username: username,
      name: name,
      email: email,
      password: password,
    });

    // Send success response for registration
    response.send(`
        <script>
            alert("Registration successful. Please login to continue.");
            window.location.href = "/login/index.html";
        </script>
    `);
  } catch (error) {
    response.send("Registration failed");
  }
});

// Define the schema for menu items
const menuItemSchema = new mongoose.Schema({
  item_code: String,
  name: String,
  price: Number,
  veg_noveg: String,
  image_name: String,
  image: {
    data: Buffer,
    contentType: String
  }
});

// Create a model for the "menuitems" collection
const MenuItem = mongoose.model("menuitems", menuItemSchema);

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle form submission for adding items
app.post('/add-item', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const itemCount = await MenuItem.countDocuments();
    const itemCode = 'P' + (itemCount + 1).toString().padStart(3, '0');

    const newItem = new MenuItem({
      item_code: itemCode,
      name: req.body.name,
      price: req.body.price,
      veg_noveg: req.body.veg_noveg,
      image_name: req.file.originalname,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await newItem.save();
    
    // Generate a popup message on the page
    const popupMessage = `
      <script>
        alert('Item added successfully!');
        window.location.href = '/admin/additem.html'; // Redirect to the home page
      </script>
    `;
    res.send(popupMessage);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).send('Internal server error');
  }
});
app.get('/items', async (req, res) => {
  try {
    // Retrieve items from the database
    const items = await MenuItem.find();

    // Render the items along with their details and buttons in HTML
    let html = '<h2>Items</h2>';
    html += '<div style="display: flex; flex-wrap: wrap;">'; // Flex container to display items flexibly
    items.forEach((item, index) => {
      // Start a new row after every third item
      if (index % 3 === 0 && index !== 0) {
        html += '</div><div style="display: flex; flex-wrap: wrap;">';
      }
      html += `<div style="width: 30%; margin: 8px; padding: 10px; border: 2px solid #ccc; border-radius: 8px;">`; // Adjust width for three items per row
      html += `<img style="width: 370px; height: 350px; object-fit: contain; border-radius: 5px;" src="data:${item.image.contentType};base64,${item.image.data.toString('base64')}">`;
      html += `<p>Item ID: ${item.item_code}</p>`; // Display item ID
      html += `<p>Name: ${item.name}</p>`;
      html += `<p>Price: ${item.price}</p>`;
      html += `<p>Veg/Non-Veg: ${item.veg_noveg}</p>`;
      // Add edit and delete buttons
      html += `<button onclick="editItem('${item._id}')">Edit</button>`;
      html += `<button onclick="confirmDelete('${item._id}')">Delete</button>`; // Call confirmDelete function with item ID
      html += `</div>`;
    });
    html += '</div>';

    // JavaScript function for confirming delete
    html += `
      <script>
        function confirmDelete(itemId) {
          if (confirm('Are you sure you want to delete this item?')) {
            deleteItem(itemId);
          }
        }

        async function deleteItem(itemId) {
          try {
            const response = await fetch('/items/' + itemId, {
              method: 'DELETE'
            });
            if (response.ok) {
              alert('Item deleted successfully');
              location.reload(); // Refresh the page after deletion
            } else {
              throw new Error('Failed to delete item');
            }
          } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item');
          }
        }
      </script>
    `;

    // Send the HTML response
    res.send(html);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
});

// Endpoint to handle item deletion
app.delete('/items/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Find the item by its ID and delete it from the database
    await MenuItem.findByIdAndDelete(itemId);
    
    // Send a success response with status code 204 (No Content)
    res.sendStatus(204);
  } catch (error) {
    // If an error occurs, log it and send a 500 (Internal Server Error) response
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  exec("start http://localhost:3000");
});
