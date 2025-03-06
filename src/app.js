const express = require("express");
const mongoDBconnect = require("./config/database");
const app = express();
const User = require("./models/user");

// Middleware to parse JSON request body
app.use(express.json());

//User signup
app.post("/signUp", (req, res) => {
	const userObj = req.body;
	const user = new User(userObj);

	try {
		user.save();
		res.send("User Added Successfully");
	} catch (err) {
		res.status(400).send("Error in savibg the user:" + err.message);
	}
});

//get user by mail
app.get("/user", async (req, res) => {
	const userEmail = req.body.emailId;
	try {
		const user = await User.findOne({ emailId: userEmail });

		if (!user) {
			res.send("User not found");
		} else {
			res.send(user);
		}
	} catch (err) {
		res.status(400).send("Something went wrong");
	}
});

//Feed api - get All teh users
app.get("/feed", async (req, res) => {
	try {
		const users = await User.find({});
		res.send(users);
	} catch (err) {
		res.status(400).send("Something went wrong");
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
