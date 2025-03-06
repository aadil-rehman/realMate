const express = require("express");
const mongoDBconnect = require("./config/database");
const app = express();
const User = require("./models/user");

// Middleware to parse JSON request body
app.use(express.json());

app.post("/signUp", (req, res) => {
	const userObj = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		emailId: req.body.emailId,
		password: req.body.password,
	};

	const user = new User(userObj);

	try {
		user.save();
		res.send("User Added Successfully");
	} catch (err) {
		res.status(400).send("Error in savibg the user:" + err.message);
	}
});

mongoDBconnect()
	.then(() => {
		console.log("Database connection established");
		app.listen(3000, () => {
			console.log("Server is listening on port 3000...");
		});
	})
	.catch(() => {
		console.log("Database cannot be connected");
	});
