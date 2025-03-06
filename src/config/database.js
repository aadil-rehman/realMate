const mongoose = require("mongoose");

const mongoDBconnect = async () => {
	await mongoose.connect(
		"mongodb+srv://aadilrehman:tmeIajsN2DiBdOkB@cluster0.i9gxd.mongodb.net/devTinder?retryWrites=true&w=majority&appName=Cluster0"
	);
};

module.exports = mongoDBconnect;
