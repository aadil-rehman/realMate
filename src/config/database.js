const mongoose = require("mongoose");

const mongoDBconnect = async () => {
	await mongoose.connect(process.env.MONGO_URI);
};

module.exports = mongoDBconnect;
