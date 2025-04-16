const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

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

		res.json({ message: "Data fetched successfully", data: connectionRequest });
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

userRouter.get("/user/feed", userAuth, async (req, res) => {
	try {
		const loggedinUser = req.user;

		const page = req.query.page;
		let limit = req.query.limit;
		limit = limit > 50 ? 50 : limit;

		const skip = (page - 1) * limit;

		//find all connection request (sent + received)
		const connectionRequest = await ConnectionRequest.find({
			$or: [{ fromUserId: loggedinUser._id }, { toUserId: loggedinUser._id }],
		}).select("fromUserId toUserId");

		const hideUsersFromFeed = new Set();

		connectionRequest.forEach((req) => {
			hideUsersFromFeed.add(req.fromUserId.toString());
			hideUsersFromFeed.add(req.toUserId.toString());
		});

		const feed = await User.find({
			$and: [
				{ _id: { $nin: Array.from(hideUsersFromFeed) } },
				{ _id: { $ne: loggedinUser._id } },
			],
		})
			.select(USER_SAFE_DATA)
			.skip(skip)
			.limit(limit);

		res.json({
			message: "Fetched all the other users successfully!",
			data: feed,
		});
	} catch (err) {
		res.status(400).json({ Error: err.message });
	}
});

module.exports = userRouter;
