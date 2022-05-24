import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import otpGenerator from "otp-generator";
import { OTP } from "../models";
import { EMAIL, PASS } from "../config";
import CustomError from "./CustomError";

const ActivateMail = (email, type, res, next) => {
  console.log(type);
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

  const subject =
    type == "account" ? "Account Activation" : "Email Confirmation";

  const mailData = {
    from: "Netflix-Clone", // sender address
    to: email, // list of receivers
    subject,
    template: "activate",
    context: {
      otp,
      title: subject,
      type,
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

    if (err) return next(CustomError.serverError());
    else {
      await sendOtp();
    }
  });
};

export default ActivateMail;
