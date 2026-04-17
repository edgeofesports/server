import { Request, Response } from "express";
import { MailtrapTransport } from "mailtrap";
import nodemailer from "nodemailer";
import twilio from "twilio";

import "dotenv/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { otpModel } from "./auth.model.js";
import { userModel } from "../users/user.model.js";

const sendMail = async (req: Request, res: Response) => {
  // Create a transporter
  let transporter = nodemailer.createTransport({
    // service: 'gmail',  // or you can configure with other services or custom SMTP
    // auth: {
    //   user: 'mr.oops2090@gmail.com',
    //   pass: 'hprq geji orhz enni'
    // }

    host: "smtpout.secureserver.net",
    port: 465, // Use 587 if you're using TLS
    secure: true, // true for 465, false for 587
    auth: {
      user: "mail@es-portal.org", // your GoDaddy email
      pass: "#Ggnfy57h", // your GoDaddy email password
    },
  });

  // Send email
  let mailOptions = {
    from: "mail@es-portal.org",
    to: "dheeraj.01.dev@gmail.com",
    subject: "Hello from mr oops",
    text: "This is a test email sent from a Node.js app",
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });

  // try {

  //   const mailerSend = new MailerSend({
  //     apiKey: "mlsn.bfbff9dee986f38c6bcc8d5cccbda1258f2a57f678709d3b35bb7cae932cda88",
  //   });

  //   const sentFrom = new Sender("esports@es-portal.org", "Es portal");

  //   const recipients = [
  //     new Recipient("dheeraj.01.dev@gmail.com", "Hi Dheeraj")
  //   ];

  //   const emailParams = new EmailParams()
  //     .setFrom(sentFrom)
  //     .setTo(recipients)
  //     .setReplyTo(sentFrom)
  //     .setSubject("Want to hack Mars")
  //     .setHtml("<strong>This is the Infomation to do that</strong>")
  //     .setText("Follow the guidelines provided by aliens.");

  //   const re = await mailerSend.email.send(emailParams);
  //   res.json({
  //     re
  //   })
  // } catch (err) {
  //   console.log(err)
  // }
};

const sendVerificationMailForSignUp = async (req: Request, res: Response) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // return
  try {
    // const user = await userModel.findOne({ email });
    // if (user) {
    //   res.status(400).json({
    //     success: false,
    //     error: "user already exist",
    //   });
    // }
    await otpModel.deleteMany({ email });
    await otpModel.create({
      email,
      otp,
    });

    // Create a transporter
    let transporter = nodemailer.createTransport({
      service: "gmail", // or you can configure with other services or custom SMTP
      // auth: {
      //   user: 'mr.oops2090@gmail.com',
      //   pass: 'hprq geji orhz enni'
      // }
      auth: {
        user: "edgeofesports@gmail.com",
        pass: "bqfj gbci xlgi esid",
      },

      // host: "mail.edgeofwaresports.com",
      // port: 465, // Use 587 if you're using TLS
      // secure: true, // true for 465, false for 587
      // auth: {
      //   user: "mail@edgeofwaresports.com", // your GoDaddy email
      //   pass: "#Ggnfy57h", // your GoDaddy email password
      // },
    });

    // Send email
    // let mailOptions = {
    //   from: "Edge Of Esports<mail@edgeofesports.com>",
    //   to: email,
    //   subject: "Verification Code",
    //   // text: `Your verification code is ${otp}`,
    //   html: `
    //   <div>
    //     <p>Your verification code is <strong>${otp}</strong></p>
    //   </div>
    // `,
    // };
    let mailOptions = {
      from: "Edge Of Esports<mail@edgeofesports.com>",
      to: email,
      subject: "Verification Code",
      html: 
            `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verification Code</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">

        <!-- Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f13;padding:40px 0;">
          <tr>
            <td align="center">

              <!-- Card -->
              <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1a1a24;border-radius:12px;overflow:hidden;border:1px solid #2a2a3a;">

                <!-- Header Banner -->
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4);padding:36px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Edge of Esports</p>
                    <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Verify Your Identity</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">

                    <p style="margin:0 0 8px;font-size:15px;color:#a0a0b8;line-height:1.6;">
                      Hello,
                    </p>
                    <p style="margin:0 0 32px;font-size:15px;color:#a0a0b8;line-height:1.6;">
                      Use the verification code below to complete your sign-in. This code is valid for <strong style="color:#c4b5fd;">10 minutes</strong> and should not be shared with anyone.
                    </p>

                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="display:inline-block;background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1));border:1px solid rgba(124,58,237,0.4);border-radius:10px;padding:24px 48px;margin-bottom:32px;">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;color:#7c3aed;text-transform:uppercase;">Your Code</p>
                            <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:12px;color:#ffffff;font-family:'Courier New',monospace;">${otp}</p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Warning -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(239,68,68,0.08);border-left:3px solid #ef4444;border-radius:0 6px 6px 0;margin-bottom:32px;">
                      <tr>
                        <td style="padding:14px 16px;">
                          <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.5;">
                            ⚠️ &nbsp;If you didn't request this code, please ignore this email or contact our support team immediately.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:14px;color:#6b6b80;line-height:1.6;">
                      Stay sharp,<br/>
                      <strong style="color:#a0a0b8;">The Edge of Esports Team</strong>
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#13131c;padding:20px 40px;border-top:1px solid #2a2a3a;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#4a4a60;line-height:1.6;">
                      © ${new Date().getFullYear()} Edge of Esports · All rights reserved<br/>
                      <a href="#" style="color:#7c3aed;text-decoration:none;">Unsubscribe</a> &nbsp;·&nbsp;
                      <a href="#" style="color:#7c3aed;text-decoration:none;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>

              </table>
              <!-- /Card -->

            </td>
          </tr>
        </table>
        <!-- /Wrapper -->

      </body>
      </html>
  `,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        return console.log(error);
      }
      res.status(200).json({
        success: true,
        data: info,
      });
    });
  } catch (err) {
    console.log(err);
    res.json({ err });
  }
};

const verifyEmailAndOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const data = await otpModel.findOne({ email });
  if (!data) {
    res.status(404).json({
      success: false,
      error: "try after sometime !",
    });
  } else {
    if (otp === data.otp) {
      res.status(200).json({
        success: true,
        otpMatched: true,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "invalid otp",
      });
    }
  }
};
const verifyEmailAndOtpLocally = async ({
  email,
  otp,
}: {
  email: string;
  otp: number;
}) => {
  const data = await otpModel.findOne({ email });
  if (!data) {
    return {
      success: false,
      error: "try after sometime !",
    };
  } else {
    if (otp === data.otp) {
      return {
        success: true,
        otpMatched: true,
      };
    } else {
      return {
        success: false,
        error: "invalid otp",
      };
    }
  }
};

const sendSms = async (req: Request, res: Response) => {};

const sendWhatsapp = async (req: Request, res: Response) => {};

export {
  sendMail,
  sendSms,
  sendWhatsapp,
  sendVerificationMailForSignUp,
  verifyEmailAndOtp,
  verifyEmailAndOtpLocally,
};

// const Nodemailer = require("nodemailer");
// const { MailtrapTransport } = require("mailtrap");

// const TOKEN = "aff5122ed33672d72da7cd2212edca93";

// const transport = nodemailer.createTransport(
//   MailtrapTransport({
//     token: TOKEN,
//   })
// );

// const sender = {
//   address: "hello@demomailtrap.com",
//   name: "Mailtrap Test",
// };
// const recipients = [
//   "mr.oops2090@gmail.com",
// ];

// transport
//   .sendMail({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);
