const express = require("express");
const Blog = require("../models/blog");
const { userAuth } = require("../middlewares/auth");
const Likes = require("../models/likes");
const Comments = require("../models/comments");

const blogRouter = express.Router();

blogRouter.post("/create", userAuth, async (req, res) => {
	try {
		const { blogTitle, blogDescription, blogImage } = req.body;

		const blog = new Blog({
			blogTitle,
			blogDescription,
			blogImage:
				blogImage.url === ""
					? {
							...blogImage,
							url: "https://i0.wp.com/thebittersweetlife.com/wp-content/uploads/2018/04/blog-2.jpg?fit=1918%2C1080&ssl=1",
					  }
					: blogImage,
			authorId: req.user._id,
		});

		await blog.save();

		res.json({ message: "Blog created successfully!", data: blog });
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

blogRouter.get("/view/:blogId", userAuth, async (req, res) => {
	try {
		const blogId = req.params.blogId;
		const blog = await Blog.findById(blogId).populate(
			"authorId",
			"firstName lastName"
		);

		res.json({ message: "Blog fecthed successfully!", data: blog });
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

blogRouter.get("/list", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;
		const blogs = await Blog.find({ authorId: loggedInUser._id }).populate(
			"authorId",
			"firstName lastName"
		);

		res.json({ message: "Blogs fecthed successfully!", data: blogs });
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

blogRouter.get("/feed", userAuth, async (req, res) => {
	try {
		const loggedInUser = req.user;

		const blogs = await Blog.find({
			authorId: { $ne: loggedInUser._id },
		}).populate("authorId", "firstName lastName");

		// Fetch likes count for each blog in parallel
		const blogsWithLikes = await Promise.all(
			blogs.map(async (blog) => {
				const numberOfLikes = await Likes.countDocuments({
					blogId: blog._id,
					likeStatus: "like",
				});

				return {
					...blog.toObject(), // Convert Mongoose Document to plain JS object
					numberOfLikes,
				};
			})
		);

		res.json({ message: "Blogs fecthed successfully!", data: blogsWithLikes });
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

blogRouter.patch("/edit/:blogId", userAuth, async (req, res) => {
	try {
		const blogId = req.params.blogId;

		const blog = await Blog.findById(blogId);

		if (!blog) {
			throw new Error("Blog not present");
		}

		Object.keys(req.body).forEach((key) => (blog[key] = req.body[key]));

		await blog.save();

		res.json({ message: "Blog updated successfully!", blog });
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

blogRouter.delete("/delete/:id", userAuth, async (req, res) => {
	try {
		const blogId = req.params.id;
		const loggedInUser = req.user;
		const blog = await Blog.findById(blogId);

		if (!blog) {
			return res.status(404).json({ error: "Blog not found" });
		}
		if (blog.authorId.toString() !== loggedInUser._id.toString()) {
			return res
				.status(403)
				.json({ error: "Unaithorized to delete this blog" });
		}
		// Delete all likes associated with the blog
		await Likes.deleteMany({ blogId: blogId });

		// Delete all comments associated with the blog
		await Comments.deleteMany({ blogId: blogId });

		await Blog.findByIdAndDelete(blogId);
		res.json({ status: 1, message: "Blog deleted successfully!" });
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

module.exports = blogRouter;
