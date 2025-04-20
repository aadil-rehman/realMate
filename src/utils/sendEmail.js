const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (
	toAddress,
	fromAddress,
	senderName,
	receiverFirstName
) => {
	return new SendEmailCommand({
		Destination: {
			CcAddresses: [
				/* more items */
			],
			ToAddresses: [toAddress],
		},
		Message: {
			Body: {
				Html: {
					Charset: "UTF-8",
					Data: `
                     <div style="font-family: Arial, sans-serif; line-height: 1.6; font-size: 15px;">
                       <p>Hello ${receiverFirstName},</p>
                       <p>
                          <strong>${senderName}</strong> has sent you a connection request on RealMate.
                          <a href="https://realmate.cfd/" style="color: #007bff;">View and respond to the request</a>.
                       </p>
                       <hr style="margin: 20px 0;" />

                       <p>Regards,<br/>
                       Team RealMate<br/>
                       <a href="https://realmate.cfd/">www.realmate.cfd</a></p>

                       <p style="color: gray; font-size: 12px;">
                         You're receiving this email because someone sent you a connection request on RealMate.
                         If you believe this was a mistake, please ignore this email.
                       </p>
                     </div>`,
				},
				Text: {
					Charset: "UTF-8",
					Data: "TEXT_FORMAT_BODY",
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: "New connection request | RealMate",
			},
		},
		Source: fromAddress,
		ReplyToAddresses: [
			/* more items */
		],
	});
};

const run = async (senderName, receiverFirstName) => {
	const sendEmailCommand = createSendEmailCommand(
		"aadilrehman.development@gmail.com",
		"aadilrehman@realmate.cfd",
		senderName,
		receiverFirstName
	);

	try {
		return await sesClient.send(sendEmailCommand);
	} catch (caught) {
		if (caught instanceof Error && caught.name === "MessageRejected") {
			/** @type { import('@aws-sdk/client-ses').MessageRejected} */
			const messageRejectedError = caught;
			return messageRejectedError;
		}
		throw caught;
	}
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
module.exports = { run };
