const express = require("express");
const upload = require("../middlewares/multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadRouter = express.Router();

uploadRouter.post(
	"/upload/profile",
	upload.single("image"),
	async (req, res) => {
		try {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "user_profile_realMate",
			});

			fs.unlinkSync(req.file.path);

			res.status(200).json({
				public_id: result.public_id,
				url: result.secure_url,
			});
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

uploadRouter.post("/upload/blog", upload.single("image"), async (req, res) => {
	try {
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: "blog_images",
		});
		fs.unlinkSync(req.file.path);

		res.status(200).json({
			public_id: result.public_id,
			url: result.secure_url,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = uploadRouter;
