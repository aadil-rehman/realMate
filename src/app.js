const express = require("express");
const mongoDBconnect = require("./config/database");
const app = express();
const User = require("./models/user");

// Middleware to parse JSON request body
app.use(express.json());

//User signup
app.post("/signUp", async (req, res) => {
	const userObj = req.body;
	const user = new User(userObj);

	try {
		await user.save();
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

//delet user
app.delete("/user", async (req, res) => {
	const userEmail = req.body.emailId;
	try {
		const user = await User.findOneAndDelete({ emailId: userEmail });
		res.send(
			`User ${user.firstName + " " + user.lastName} deleted successfully.`
		);
	} catch (err) {
		res.status(400).send("Something went wrong");
	}
});

//partial update
app.patch("/user", async (req, res) => {
	const userId = req.body._id;
	const data = req.body;

	if (!userId) {
		return res.status(400).send("User ID is required.");
	}
	try {
		const user = await User.findByIdAndUpdate(userId, data, {
			new: true,
			runValidators: true, //to run the validators applied in schemas in each patch update
		});

		res.send(`User Updated successfully.`);
	} catch (err) {
		res.status(400).send("Update Failed:" + err.message);
	}
});

//Fully update
app.put("/user", async (req, res) => {
	const userEmail = req.body.emailId;
	const data = req.body;

	if (!userEmail) {
		return res.status(400).send("User email is required.");
	}
	try {
		const user = await User.findOneAndReplace({ emailId: userEmail }, data, {
			new: true,
		});

		res.send(`User Updated successfully.`);
	} catch (err) {
		res.status(400).send("Update Failed:" + err.message);
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
