const express = require("express");
const mongoDBconnect = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

// Middleware to parse JSON request body
app.use(express.json());
app.use(cookieParser());

//User signup
app.post("/signUp", async (req, res) => {
	try {
		//validate the data
		validateSignUpData(req);

		const { firstName, lastName, emailId, password } = req.body;

		//Enrcypt the password
		const passwordHash = await bcrypt.hash(password, 10);
		console.log(passwordHash);

		const user = new User({
			firstName,
			lastName,
			emailId,
			password: passwordHash,
		});

		//saving the user
		await user.save();
		res.send("User Added Successfully");
	} catch (err) {
		res.status(400).send("Error in savibg the user:" + err.message);
	}
});

app.post("/login", async (req, res) => {
	try {
		const { emailId, password } = req.body;

		const user = await User.findOne({ emailId: emailId });
		if (!user) {
			throw new Error("Invalid Credentials");
		}
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (isValidPassword) {
			//create a JWT token
			const token = await jwt.sign({ _id: user._id }, "devTinder@Aadil@123", {
				expiresIn: "7d",
			});

			//add token to cookie
			res.cookie("token", token, {
				expires: new Date(Date.now() + 8 * 3600000),
			});

			res.send("Login Successfull!");
		} else {
			throw new Error("Invalid credentials");
		}
	} catch (err) {
		res.status(400).send("Error in savibg the user:" + err.message);
	}
});

//get prfile
app.get("/profile", userAuth, async (req, res) => {
	try {
		const user = req.user;
		res.send(user);
	} catch (err) {
		res.status(400).send("ERROR: " + err.message);
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

	const ALLOWED_UPDATES = [
		"password",
		"age",
		"gender",
		"about",
		"lastName",
		"_id",
		"skills",
	];

	try {
		const isUpdateAllowed = Object.keys(data).every((key) =>
			ALLOWED_UPDATES.includes(key)
		);
		if (!isUpdateAllowed) {
			throw new Error("Update not allowed");
		}
		if (data?.skills.length > 10) {
			throw new Error("Skills can not be more than 10");
		}
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
