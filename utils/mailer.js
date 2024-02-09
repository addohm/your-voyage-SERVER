import nodemailer from "nodemailer"
import dotenv from 'dotenv'
dotenv.config()

// !! mailer
// * how to setup: 
// ! place with 2FactorAuth: https://myaccount.google.com/security
// https://stackoverflow.com/questions/26948516/nodemailer-invalid-login
// search: Since May 30, 2022, Google no longer supports less secure apps...
// link to app pass: https://myaccount.google.com/u/1/apppasswords?utm_source=google-account&utm_medium=myaccountsecurity&utm_campaign=tsv-settings&rapt=AEjHL4NP7rp6aFinpkeUX9FqAeo9rPdHOL6pER_F6OJTdahdyrq6BIjp94ynspbBnD3WHMKzjFyhk4_GiCoLM2sQV-L8DQsHOw
// Nodemailer for office 365 example
// https://github.com/nodemailer/nodemailer/issues/1482
// https://nodemailer.com/smtp/
export default function mailer(email, Subject, html) {
    // create reusable transporter object using the default SMTP transport 
    var transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.ADMIN_EMAIL, // email address
            pass: process.env.SMTP_APP_PASS, // app password
        },
        secure: process.env.SMTP_SECURE || false,
        tls: {
            minVersion: 'TLSv1.2',
        },
        debug: true,
    });

    // setup e-mail data with unicode symbols 
    var mailOptions = {
        from: process.env.ADMIN_EMAIL, // sender address 
        to: email, // list of receivers 
        subject: Subject, // Subject line 
        html: html, // html body 
    };

    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("SMTP_HOST: " + process.env.SMTP_HOST)
            console.log("SMTP_PORT: " + process.env.SMTP_PORT)
            console.log("ADMIN_EMAIL: " + process.env.ADMIN_EMAIL)
            console.log("SMTP_APP_PASS: " + process.env.SMTP_APP_PASS)
            console.log("SMTP_SECURE: " + process.env.SMTP_SECURE)
            return console.log("ERROR----" + error);
        }
        console.log(`Message sent: to email: ${email}` + info.response);
    });
}
// ?? mailer