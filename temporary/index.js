var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const multer=require("multer")
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the MongoDB database
mongoose
  .connect(
    "mongodb+srv://krishnasairaj:3TLvpofXOtrP94NE@cluster1.katgqk9.mongodb.net/fastfood?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

var db = mongoose.connection;

// Check database connection
db.on("error", () => console.log("Error in connecting to database"));
db.once("open", () => console.log("Connected to Database"));

// Initialize blacklist array
let blacklist = [];

// Redirect to the login page
app.get("/", (req, res) => {
  // res.redirect("register/register.html");
  res.redirect('login/index.html');
});

// Handle login POST request
app.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;
    const user = await db
      .collection("creds")
      .findOne({ username: username, password: password });
    if (!user) {
      response.send(`
        <script>
            alert("Invalid Username or Password");
            window.location.href = "/login/index.html";
        </script>
    `);
    }
    const token = generateToken(user);
    // response.json({ token });
    response.redirect("/home/home.html");
  } catch (error) {
    response.status(500).send("Internal server error");
  }
});
// Handle logout request
app.post("/logout", (request, response) => {
  try {
    const token = request.headers.authorization.split(" ")[1];
    if (!token) {
      return response.status(400).send("No token provided");
    }
    blacklist.push(token); // Add token to blacklist
    // Redirect to the login page after logout
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    response.setHeader("Expires", "0"); // Proxies.
    response.redirect("/login.html");
  } catch (error) {
    console.error("Error logging out:", error);
    response.status(500).send("Error logging out");
  }
});

// Middleware to verify token
function verifyToken(request, response, next) {
  try {
    const token = request.headers.authorization.split(" ")[1];
    if (!token) {
      return response.status(403).send("No token provided");
    }
    if (blacklist.includes(token)) {
      return response.status(401).send("Token revoked. Please log in again.");
    }
    jwt.verify(token, "secret_key", (err, decoded) => {
      if (err) {
        return response.status(401).send("Invalid token");
      }
      request.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    response.status(500).send("Internal server error");
  }
}

// Protected route example
app.get("/protected", verifyToken, (request, response) => {
  response.send("Protected route accessed successfully!");
});

// Token generation function
function generateToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
    // Add any other user data you want to include in the token
  };
  const options = {
    expiresIn: "1h", // Token expiration time
    // Add other options if needed
  };
  return jwt.sign(payload, "secret_key", options);
}

const swal = require("sweetalert");
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

const menuItemSchema = new mongoose.Schema({
  item_code: String, // Add item_code field
  name: String,
  price: Number,
  veg_noveg: String,
  image_name:String,
  image:{
    data:Buffer,
    contentType:String
  }
});

// Create a model for the "menuitems" collection
const MenuItem = mongoose.model("menuitems", menuItemSchema);

//image storage
const storage=multer.memoryStorage()
const upload=multer({storage:storage})

// Validate form data middleware
function validateFormData(req, res, next) {
  const { price } = req.body;
  if (isNaN(price)) {
    return res.status(400).send("Price must be a number");
  }
  next();
}

// Endpoint to handle form submission
app.post('/add-item', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // Retrieve the count of existing items to generate the item code
    const itemCount = await MenuItem.countDocuments();
    const itemCode = 'P' + (itemCount + 1).toString().padStart(3, '0'); // Generate item code

    const newItem = new MenuItem({
      item_code: itemCode, // Set the generated item code
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
    res.send('Item added successfully!');
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).send('Internal server error');
  }
});

// Already the separate files for displaying items are generated dont delete them the problem is images are not loading thats it



app.get('/items', async (req, res) => {
  try {
    // Retrieve items from the database
    const items = await MenuItem.find();

    // Render the items along with their details in HTML
    let html = '<h2>Items</h2>';
    html += '<div style="display: flex; flex-wrap: wrap;">'; // Flex container to display items flexibly
    items.forEach((item, index) => {
      // Start a new row after every third item
      if (index % 3 === 0 && index !== 0) {
        html += '</div><div style="display: flex; flex-wrap: wrap;">';
      }
      html += `<div style="width: 30%; margin: 8px; padding: 10px; border: 2px solid #ccc; border-radius: 8px;">`; // Adjust width for three items per row
      html += `<img style="width: 370px; height: 350px; object-fit: contain; border-radius: 5px;" src="data:${item.image.contentType};base64,${item.image.data.toString('base64')}">`;
      html += `<p>Item Code: ${item.item_code}</p>`; // Display item code
      html += `<p>Name: ${item.name}</p>`;
      html += `<p>Price: ${item.price}</p>`;
      html += `<p>Veg/Non-Veg: ${item.veg_noveg}</p>`;
      html += `</div>`;
    });
    html += '</div>';

    res.send(html);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Internal server error');
  }
});


// app.get('/items', async (req, res) => {
//   try {
//     // Retrieve items from the database
//     const items = await MenuItem.find();

//     // Send JSON response with items data
//     res.json(items);
//   } catch (error) {
//     console.error('Error fetching items:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Open localhost:3000 in default browser
  exec("start http://localhost:3000");
});
