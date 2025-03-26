const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validations");

const authRouter = express.Router();

authRouter.post("/signUp", async (req, res) => {
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

authRouter.post("/login", async (req, res) => {
	try {
		const { emailId, password } = req.body;

		const user = await User.findOne({ emailId: emailId });
		if (!user) {
			throw new Error("Invalid Credentials");
		}
		const isValidPassword = await user.validatePassword(password);
		if (isValidPassword) {
			//create a JWT token
			const token = await user.getJWT();

			//add token to cookie
			res.cookie("token", token, {
				expires: new Date(Date.now() + 8 * 3600000),
			});

			res.json({ message: "Login Successfull!", data: user });
		} else {
			throw new Error("Invalid credentials");
		}
	} catch (err) {
		res.status(400).send("Error in savibg the user:" + err.message);
	}
});

authRouter.post("/logout", async (req, res) => {
	res
		.cookie("token", null, {
			expires: new Date(Date.now()),
		})
		.send("Logout successfull!");
});

module.exports = authRouter;
