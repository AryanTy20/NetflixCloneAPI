class CustomError extends Error {
  constructor(status, msg) {
    super();
    this.status = status;
    this.message = msg;
  }

  static alreayExist(message) {
    return new CustomError(409, message);
  }

  static wrongcredential(message = "username or password is wrong") {
    return new CustomError(400, message);
  }

  static unauthorized(message = "unauthorized") {
    return new CustomError(401, message);
  }

  static notfound(message = "User not found") {
    return new CustomError(404, message);
  }
  static serverError(message = "Internal Server Error") {
    return new CustomError(500, message);
  }
  static otpError(message = "Invalid OTP") {
    return new CustomError(422, message);
  }
  static notValid(message = "Invalid Data") {
    return new CustomError(422, message);
  }
  static limitReach(message = "Limit reached") {
    return new CustomError(422, message);
  }
}

export default CustomError;
