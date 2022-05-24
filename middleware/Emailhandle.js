import { User } from "../models";
import { CustomError } from "../service";
const Email = async (req, res, next) => {
  let { email } = req.body;
  email.toLowerCase();
  if (!email) return next(CustomError.notValid("Email is required"));
  try {
    const match = await User.exists({ email });
    if (!match) return next(CustomError.notfound());
    req.email = email;
    next();
  } catch (err) {
    return next(err);
  }
};
export default Email;
