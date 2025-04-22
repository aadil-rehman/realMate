const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Blog = require("../models/blog");
const Comments = require("../models/comments");

const commentsRouter = express.Router();

commentsRouter.post("/create/:blogId", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;
		const fromUserId = loggedInUser._id;
		const blogId = req.params.blogId;

		const blog = await Blog.findById(blogId);
		if (!blog) {
			throw new Error("Blog does not exist!");
		}
		const toUserId = blog.authorId;

		const message = req.body.message;

		const comment = new Comments({
			fromUserId,
			toUserId,
			blogId,
			message,
		});

		await comment.save();
		res.json({ message: "Comment added successfully!", comment });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

commentsRouter.get("/view/:blogId", userAuth, async (req, res) => {
	try {
		const blogId = req.params.blogId;

		const comments = await Comments.find({ blogId: blogId }).populate(
			"fromUserId",
			"profileImage firstName lastName"
		);

		res.json({ message: "Comment fetched successfully!", data: comments });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

module.exports = commentsRouter;
