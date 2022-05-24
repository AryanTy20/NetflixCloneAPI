import jwt from "jsonwebtoken";
import { JWT_SIGN, JWT_REFRESH } from "../config";

class JWTService {
  static sign(payload, expires = "10s", secretkey = JWT_SIGN) {
    return jwt.sign(payload, secretkey, {
      expiresIn: expires,
    });
  }
  static sign_v(payload, secretkey = JWT_SIGN) {
    return jwt.verify(payload, secretkey);
  }
  static refresh(payload, expires = "7d", secretkey = JWT_REFRESH) {
    return jwt.sign(payload, secretkey, { expiresIn: expires });
  }
  static refresh_v(payload, secretkey = JWT_REFRESH) {
    return jwt.verify(payload, secretkey);
  }
}

export default JWTService;
