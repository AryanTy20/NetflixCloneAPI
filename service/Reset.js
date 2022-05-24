import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import otpGenerator from "otp-generator";
import { OTP } from "../models";
import { EMAIL, PASS } from "../config";
import CustomError from "./CustomError";

const ResetMail = (email, res) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: EMAIL,
      pass: PASS,
    },
    secure: true,
  });

  const hbsoption = {
    viewEngine: {
      extName: ".hbs",
      partialsDir: "./views/",
      defaultLayout: false,
    },
    viewPath: "./views/",
    extName: ".hbs",
  };

  transporter.use("compile", hbs(hbsoption));
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    specialChars: false,
  });

  const mailData = {
    from: "devty007@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Password Reset For Netflix-Clone",
    template: "reset",
    context: {
      otp,
      title: "Password Reset ",
    },
  };

  transporter.sendMail(mailData, async function (err, info) {
    const sendOtp = async () => {
      const user = await OTP.findOne({ email });
      if (user) {
        res.json({ message: "OTP has been sent to your mail" });
        user.reqCount += 1;
        user.email = email;
        user.otp = otp;
        user.save();
      } else {
        OTP.create({ email, otp });
        res.json({ message: "OTP has been sent to your mail" });
      }
    };
    if (err) console.log("default", error);
    else {
      await sendOtp();
    }
  });
};

export default ResetMail;
