const socket = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

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

	io.on("connection", (socket) => {
		const token = socket.handshake.auth?.token;

		// Optional: Verify token (JWT example)
		console.log(token);
		let userData;
		try {
			userData = jwt.verify(token, process.env.JWT_SECRET); // use your actual secret
			console.log("Socket Authenticated:", userData);
		} catch (err) {
			console.log("Invalid token. Disconnecting socket." + err.message);
			return socket.disconnect(true);
		}

		socket.on("joinChat", ({ userId, targetUserId, firstName }) => {
			const roomId = getSecretRoomId(userId, targetUserId);
			console.log(firstName + ": Joining room: " + roomId);
			socket.join(roomId);
		});

		socket.on("sendMessage", ({ firstName, userId, targetUserId, text }) => {
			const roomId = getSecretRoomId(userId, targetUserId);
			console.log(firstName + " " + text);
			io.to(roomId).emit("messageReceived", { firstName, text });
		});

		socket.on("disconnect", () => {});
	});
};

module.exports = initializeSocket;
