const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

//This job will run at 8 AM in the morning daily to send mail to the users
cron.schedule("0 8 * * *", async () => {
	console.log("Running every minute, " + new Date());
	//Send mail to all those who recieved request in last 24 hrs

	try {
		const yesterday = subDays(new Date(), 1);

		const yesterdayStart = startOfDay(yesterday);
		const yesterdayEnd = endOfDay(yesterday);
		const pendingRequests = await ConnectionRequest.find({
			status: "interested",
			createdAt: {
				$gte: yesterdayStart,
				$lt: yesterdayEnd,
			},
		}).populate("fromUserId toUserId");

		const listOfEmails = [
			...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
		];

		if (listOfEmails.length === 0) return;
		for (const email of listOfEmails) {
			try {
				const res = await sendEmail.run("", email);
				console.log(res);
			} catch (err) {
				console.error(err);
			}
		}
	} catch (err) {
		console.error(err);
	}
});
