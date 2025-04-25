const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/Chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
	const userId = req.user._id;

	const targetUserId = req.params.targetUserId;

	const chat = await Chat.findOne();
});
