const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

const USER_SAFE_DATA = [
	"firstName",
	"lastName",
	"age",
	"gender",
	"about",
	"photoUrl",
	"skills",
];

//get all the pending connection requests for the loggedin user
userRouter.get("/user/request", userAuth, async (req, res) => {
	try {
		const loggedinUser = req.user;
		const connectionRequest = await ConnectionRequest.find({
			toUserId: loggedinUser._id,
			status: "interested",
		}).populate("fromUserId", USER_SAFE_DATA);

		// const data = connectionRequest.map((row) => row.fromUserId);

		res.json({ message: "Data fetched successfully", connectionRequest });
	} catch (err) {
		res.status(400).json({ ERROR: err.message });
	}
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
	try {
		const loggedinUser = req.user;
		const connectionRequest = await ConnectionRequest.find({
			$or: [
				{ toUserId: loggedinUser._id, status: "accepted" },
				{ fromUserId: loggedinUser._id, status: "accepted" },
			],
		})
			.populate("fromUserId", USER_SAFE_DATA)
			.populate("toUserId", USER_SAFE_DATA);

		const data = connectionRequest.map((row) => {
			if (row.fromUserId._id.toString() === loggedinUser._id.toString()) {
				return row.toUserId;
			}
			return row.fromUserId;
		});
		res.json({
			message: "All the connections fetched successfully!!",
			data,
		});
	} catch (err) {
		res.status(400).json({ ERROR: err.message });
	}
});

module.exports = userRouter;
