const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
	{
		blogTitle: {
			type: String,
			required: true,
			maxLength: 100,
		},
		blogDescription: {
			type: String,
			required: true,
			maxLength: 2000,
		},
		blogImage: {
			public_id: String,
			url: {
				type: String,
				default:
					"https://th.bing.com/th/id/OIP.E13JkGWNBoKw9e1-WatrCgHaD_?rs=1&pid=ImgDetMain",
			},
		},
		authorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
