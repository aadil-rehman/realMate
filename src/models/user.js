const mongoose = require("mongoose");

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
		},
		password: {
			type: String,
			required: true,
		},
		age: {
			type: String,
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
	},
	{ timestamps: true } //createdAt and updatedAt timing will appear automatically by using this
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
