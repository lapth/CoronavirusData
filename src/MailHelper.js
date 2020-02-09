var nodemailer = require('nodemailer');
var fs = require('fs');

const REAL_FILE = "./public/data/data.json";

// How to send mail by nodemailer
// See https://stackoverflow.com/questions/48854066/missing-credentials-for-plain-nodemailer
// Let replace all [XXX] by your ones if you want to have mail notification

const report_sender = "[report_sender]@gmail.com";
const report_receiver = "[report_receiver]@gmail.com";
var mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: report_sender,
        clientId: '[clientId]',
        clientSecret: '[clientSecret]',
        refreshToken: '[refreshToken]',
        accessToken: '[accessToken]'
    }
});

exports.sendStatusChanged = async () => {

    const realData = JSON.parse(fs.readFileSync(REAL_FILE).toString());
    const jsonData = 
        "Confirmed: " + realData.total + 
        ", Recovered: " + realData.recovered + 
        ", Deaths: " + realData.deaths;

    const dateId = (new Date()).toUTCString();
    let mailOptions = {
        from: report_sender,
        to: report_receiver,
        priority: 'high',
        subject: jsonData + ' - ' + dateId + ' - Coronavirus status changed!',
        html: 'Nothing'
    };

    console.logMsg("Mail sending");
    await mailTransport.sendMail(mailOptions);
    console.logMsg("Mail sent");
}

exports.sendCrawlError = async () => {
    const dateId = (new Date()).toUTCString();
    let mailOptions = {
        from: report_sender,
        to: report_receiver,
        priority: 'high',
        subject: dateId + ' - Coronavirus crawler err!',
        html: dateId + ' - Coronavirus crawler err!'
    };

    console.logMsg("Mail sending");
    await mailTransport.sendMail(mailOptions);
    console.logMsg("Mail sent");
}
