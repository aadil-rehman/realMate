const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/Chat");

const chatRouter = express.Router();

chatRouter.get("/:targetUserId", userAuth, async (req, res) => {
	const userId = req.user._id;

	const targetUserId = req.params.targetUserId;

	try {
		let chat = await Chat.findOne({
			participants: { $all: [userId, targetUserId] },
		}).populate({
			path: "messages.senderId",
			select: "firstName lastName profileImage",
		});

		if (!chat) {
			chat = new Chat({ participants: [userId, targetUserId], messages: [] });

			await chat.save();
		}

		res.json({ data: chat });
	} catch (err) {
		res.status(400).json({ ERROR: err.message });
	}
});

module.exports = chatRouter;
