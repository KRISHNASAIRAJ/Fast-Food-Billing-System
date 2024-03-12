var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var jwt = require("jsonwebtoken");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://krishnasairaj:3TLvpofXOtrP94NE@cluster1.katgqk9.mongodb.net/fastfood?retryWrites=true&w=majority').then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

var db = mongoose.connection;

// Check database connection
db.on('error', () => console.log("Error in connecting to database"));
db.once('open', () => console.log("Connected to Database"));

// Initialize blacklist array
let blacklist = [];

// Redirect to the login page
app.get("/", (req, res) => {
    // res.redirect('register/register.html');
    res.redirect('admin/additem.html');
});

// Handle login POST request
app.post("/login", async (request, response) => {
    try {
        const { username, password } = request.body;
        const user = await db.collection('creds').findOne({ username: username, password: password });
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
        response.redirect('/home/home.html');
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
        expiresIn: '1h', // Token expiration time
        // Add other options if needed
    };
    return jwt.sign(payload, "secret_key", options);
}

const swal = require('sweetalert');
app.post("/register", async (request, response) => {
    try {
        const { username, name, email, password } = request.body;

        // Check if the user already exists
        const existingUser = await db.collection('creds').findOne({ email: email });
        if (existingUser) {
            return response.send("User already exists!");
        }

        // Create a new user
        await db.collection('creds').insertOne({
            username: username,
            name: name,
            email: email,
            password: password
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

// Function to handle form submission
function submitForm() {
    // Get form data
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const veg_noveg = document.getElementById('veg_noveg').value;

    // Construct the request body
    const formData = {
        name: name,
        price: price,
        veg_noveg: veg_noveg
    };

    // Send form data to the server
    fetch('/additem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            // Form submitted successfully
            alert("Form submitted successfully!");
            window.location.href = "/admin/additem.html";
        } else {
            // Error handling
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Form submission failed. Please try again.');
    });
}


function sendOTP() {
	const email = document.getElementById('email');
	const otpverify = document.getElementsByClassName('otpverify')[0];

	let otp_val = Math.floor(Math.random() * 10000);

	let emailbody = `<h2>Your OTP is </h2>${otp_val}`;
	Email.send({
    SecureToken : "01734aa4-4726-4c20-9b11-35fef074353b",
    // 3BC857D25151C5F76A2EBC679447C9CC370B
    To : email.value,
    From : "krishnasairaj.ponneboina@gmail.com",
    Subject : "Email OTP using JavaScript",
    Body : emailbody,
}).then(

	message => {
		if (message === "OK") {
			alert("OTP sent to your email " + email.value);

			otpverify.style.display = "flex";
			const otp_inp = document.getElementById('otp_inp');
			const otp_btn = document.getElementById('otp-btn');

			otp_btn.addEventListener('click', () => {
				if (otp_inp.value == otp_val) {
					alert("Email address verified...");
				}
				else {
					alert("Invalid OTP");
				}
			})
		}
	}
);
}



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});