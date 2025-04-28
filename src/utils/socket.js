const socket = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
	return crypto
		.createHash("sha256")
		.update([userId, targetUserId].sort().join("_"))
		.digest("hex");
};

const initializeSocket = (server) => {
	const io = socket(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});

	const onlineUsers = new Map();

	io.on("connection", (socket) => {
		const token = socket.handshake.auth?.token;

		// Optional: Verify token (JWT example)
		console.log(token);
		let userData;
		try {
			userData = jwt.verify(token, process.env.JWT_SECRET); // use your actual secret
		} catch (err) {
			console.log("Invalid token. Disconnecting socket." + err.message);
			return socket.disconnect(true);
		}

		//save user as online

		socket.on("joinChat", ({ userId, targetUserId, firstName }) => {
			const roomId = getSecretRoomId(userId, targetUserId);
			console.log(firstName + ": Joining room: " + roomId);
			socket.join(roomId);

			socket.userId = userId; // <-- save userId on socket itself
			onlineUsers.set(userId, socket.id);
			console.log(onlineUsers);
		});

		socket.on("checkonline", (targetUserId) => {
			const isOnline = onlineUsers.has(targetUserId);
			socket.emit("userOnlineStatus", isOnline);
		});

		socket.on(
			"sendMessage",
			async ({
				firstName,
				lastName,
				profileImage,
				userId,
				targetUserId,
				text,
				createdAt,
			}) => {
				try {
					const roomId = getSecretRoomId(userId, targetUserId);
					console.log(firstName + " " + text);

					//Check if userId and targetUserId are friends
					const connection = await ConnectionRequest.findOne({
						$or: [
							{
								fromUserId: userId,
								toUserId: targetUserId,
								status: "accepted",
							},
							{
								fromUserId: targetUserId,
								toUserId: userId,
								status: "accepted",
							},
						],
					});

					if (!connection) {
						throw new Error("Please first make connection. ");
					}

					//save messages to database
					let chat = await Chat.findOne({
						participants: { $all: [userId, targetUserId] },
					});

					if (!chat) {
						chat = new Chat({
							participants: [userId, targetUserId],
							messages: [],
						});
					}

					chat.messages.push({
						senderId: userId,
						text,
					});

					await chat.save();

					io.to(roomId).emit("messageReceived", {
						firstName,
						lastName,
						profileImage,
						text,
						createdAt,
					});
				} catch (err) {
					console.log(err);
				}
			}
		);

		console.log(onlineUsers);

		socket.on("disconnect", () => {
			if (socket.userId) {
				console.log("User disconnected:", socket.userId);
				onlineUsers.delete(socket.userId);
			}
		});
	});
};

module.exports = initializeSocket;
