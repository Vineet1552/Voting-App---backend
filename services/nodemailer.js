// nodemailer.js

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vermavineet688@gmail.com',
        pass: 'nvrc reyx ukic rqzi'
    }
});


const sendMail = (to, subject, text) => {

    const mailOptions = {
        from: "vermavineet688@gmail.com",
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log(error, "error in nodemailer");
        }
        else {
            console.log("mail sent successfully to customer mail");
        }
    });

};

module.exports = sendMail;