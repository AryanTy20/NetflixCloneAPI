import { CustomError, JWTService } from "../service";

const Auth = (req, res, next) => {
  let authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(CustomError.unauthorized());
  }

  const token = authHeader.split(" ")[1];
  try {
    const { id, active } = JWTService.sign_v(token);
    const user = {
      id,
      active,
    };
    req.user = user;
    next();
  } catch (error) {
    return next(CustomError.unauthorized());
  }
};

export default Auth;
