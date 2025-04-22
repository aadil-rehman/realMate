const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Blog = require("../models/blog");
const Likes = require("../models/likes");

const likesRouter = express.Router();

likesRouter.post("/create/:blogId", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;
		const fromUserId = loggedInUser._id;
		const blogId = req.params.blogId;

		const blog = await Blog.findById(blogId);
		if (!blog) {
			return res.status(404).json({ message: "Blog not found" });
		}

		const toUserId = blog.authorId;

		const like = await Likes.findOne({
			blogId: blogId,
			fromUserId: loggedInUser._id,
		});
		if (like) {
			like.likeStatus = like.likeStatus === "like" ? "unlike" : "like";
			await like.save();
			return res
				.status(200)
				.json({ message: "Like status updated", data: like });
		} else {
			const like = new Likes({
				fromUserId,
				toUserId,
				blogId,
				likeStatus: "like",
			});
			await like.save();
			return res
				.status(200)
				.json({ message: "Like status updated", data: like });
		}
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

likesRouter.get("/view/:blogId", userAuth, async (req, res) => {
	try {
		const blogId = req.params.blogId;
		const likes = await Likes.find({
			blogId: blogId,
			likeStatus: "like",
		})
			.select("fromUserId")
			.populate("fromUserId", "firstName lastName");
		const numberOfLikes = likes ? likes.length : 0;

		const loggedInUser = req.user;

		const like = await Likes.findOne({
			blogId: blogId,
			fromUserId: loggedInUser._id,
		});
		res.json({
			message: "Likes fetched successfully!",
			numberOfLikes: numberOfLikes,
			likes: likes,
			currlikeObj: like,
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

module.exports = likesRouter;
