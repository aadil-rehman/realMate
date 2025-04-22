const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validations");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cloudinary = require("../config/cloudinary");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res) => {
	try {
		const user = req.user;
		res.send(user);
	} catch (err) {
		res.status(400).send("ERROR: " + err.message);
	}
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
	try {
		if (!validateEditProfileData(req)) {
			throw new Error("Invalid edit request");
		}

		const loggedinUser = req.user;

		if (
			req.body.profileImage &&
			req.body.profileImage.public_id &&
			loggedinUser.profileImage?.public_id &&
			loggedinUser.profileImage.public_id !== req.body.profileImage.public_id
		) {
			// Delete the previous image from Cloudinary
			await cloudinary.uploader.destroy(loggedinUser.profileImage.public_id);
		}
		Object.keys(req.body).forEach((key) => (loggedinUser[key] = req.body[key]));

		await loggedinUser.save();

		res.json({
			message: `${loggedinUser.firstName}, your profile updated successfully.`,
			data: loggedinUser,
		});
	} catch (err) {
		res.status(400).send("ERROR: " + err.message);
	}
});

profileRouter.patch("/password", userAuth, async (req, res) => {
	try {
		//validate curr passwod
		const { currentPassword, newPassword } = req.body;
		const loggedinUser = req.user;
		const isCurrValidPassword = await bcrypt.compare(
			currentPassword,
			loggedinUser.password
		);
		if (!isCurrValidPassword) {
			throw new Error("Current Password is not valid.");
		}

		//check if new pwd is strong
		const isNewPasswordStrong = validator.isStrongPassword(newPassword);
		if (!isNewPasswordStrong) {
			throw new Error("Please enter the strong password");
		}

		//update the pwd
		const passwordHash = await bcrypt.hash(newPassword, 10);
		loggedinUser.password = passwordHash;
		await loggedinUser.save();

		res.json({ message: "Password updated successfully" });
	} catch (err) {
		res.status(400).json({ ERROR: `${err.message}` });
	}
});

module.exports = profileRouter;
