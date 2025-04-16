const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
	try {
		//take the token from cookie
		const { token } = req.cookies;

		if (!token) {
			return res.status(401).json({ Error: "Please login" });
		}

		//validate token
		const decodedObj = await jwt.verify(token, "devTinder@Aadil@123");

		const { _id } = decodedObj;

		//find user
		const user = await User.findById(_id);

		if (!user) {
			throw new Error("User not found");
		}
		req.user = user;
		next();
	} catch (err) {
		res.status(400).send("ERROR: " + err.message);
	}
};

module.exports = { userAuth };
