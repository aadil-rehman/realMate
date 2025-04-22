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
			required: true,
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
		profileImage: {
			public_id: {
				type: String,
			},
			url: {
				type: String,
				default:
					"https://www.inklar.com/wp-content/uploads/2020/05/dummy_user-370x300-1.png",
				validate(value) {
					if (!validator.isURL(value)) {
						throw new Error("Invalid photo URL: " + value);
					}
				},
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
	const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
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
