const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
		},
		emailId: {
			type: String,
			required: true,
			lowercase: true,
			unique: true,
			trim: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Invalid email address: " + value);
				}
			},
		},
		password: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			min: 5,
			max: 100,
		},
		gender: {
			type: String,
			validate(value) {
				if (!["male", "female", "other"].includes(value)) {
					throw new Error("Gender data is not valid");
				}
			},
		},
		about: {
			type: String,
			default: "This is default about user",
		},
		photoUrl: {
			type: String,
			default:
				"https://www.dgvaishnavcollege.edu.in/dgvaishnav-c/uploads/2021/01/dummy-profile-pic.jpg",
			valdiate(value) {
				if (validator.isURL(value)) {
					throw new Error("Invalid photo Url: " + value);
				}
			},
		},
		skills: {
			type: [String],
		},
	},
	{ timestamps: true } //createdAt and updatedAt timing will appear automatically by using this
);

userSchema.methods.getJWT = async function () {
	const user = this;
	const token = await jwt.sign({ _id: user._id }, "devTinder@Aadil@123", {
		expiresIn: "7d",
	});
	return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
	const user = this;
	const passwordHash = user.password;
	const isValidPassword = await bcrypt.compare(
		passwordInputByUser,
		passwordHash
	);

	return isValidPassword;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
