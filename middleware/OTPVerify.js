import { OTP } from "../models";
import { CustomError } from "../service";

const Otp = async (req, res, next) => {
  const { otp } = req.body;
  const { email } = req.cookies;
  if (!email) return next(CustomError.unauthorized());
  if (!otp) return next(CustomError.notValid("otp is required"));
  try {
    const match = await OTP.findOne({ otp });
    if (!match) {
      return next(CustomError.otpError());
    }
    const lastTime = new Date(match.updatedAt).getTime();
    const now = new Date().getTime();
    const checkTime = (now - lastTime) / 60000;
    if (checkTime > 1) return next(CustomError.otpError());
    if (match.email !== email) return next(CustomError.otpError());
    res.clearCookie("email", {
      expires: new Date(Date.now() + 200000),
      httpOnly: true, // secure:true for https
    });
    req.email = match.email;
    match.delete();
    next();
  } catch (err) {
    return next(err);
  }
};
export default Otp;
