const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		blogId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "blog",
			required: true,
		},
		likeStatus: {
			type: String,
			required: true,
			enum: ["like", "unlike"],
			default: "unlike",
		},
	},
	{ timestamps: true }
);

const Likes = mongoose.model("Likes", likeSchema);
module.exports = Likes;
