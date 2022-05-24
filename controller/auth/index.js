import {
  RValidator,
  LValidator,
  Resetvalidator,
} from "../../validation/authValid";
import { User, RefreshToken, Wishlist, OTP } from "../../models";
import {
  ActivateMail,
  ResetMail,
  JWTService,
  CustomError,
} from "../../service";

export const AuthHandler = {
  async register(req, res, next) {
    const { error } = RValidator.validate(req.body);
    if (error) return next(error);
    if (!/@gmail.com/.test(req.body.email))
      return next(CustomError.notValid("Only gmail email is allowed"));
    try {
      const usernameExists = await User.exists({ username: req.body.username });
      const emailExists = await User.exists({ email: req.body.email });
      if (usernameExists)
        return next(CustomError.alreayExist("username already exist"));
      if (emailExists)
        return next(CustomError.alreayExist("email already exist"));
      const { username, email, password } = req.body;
      const validData = JWTService.sign({ username, email, password }, "200s");
      res.cookie("validData", validData, {
        expires: new Date(Date.now() + 200000),
        httpOnly: true,
      });
      res.json({ message: "OTP has been send to your mail" });
    } catch (error) {
      return next(error);
    }
  },
  async login(req, res, next) {
    const { error } = LValidator.validate(req.body);
    if (error) return next(error);
    try {
      const { username, password, remember } = req.body;
      let user;
      if (/@gmail.com/.test(username)) {
        user = await User.findOne({ email: username.toLowerCase() });
      } else {
        user = await User.findOne({ username });
      }
      if (!user) return next(CustomError.wrongcredential());
      if (!user.active) return next(CustomError.unauthorized());
      const pc = await user.validPassword(password);
      if (!pc) return next(CustomError.wrongcredential());
      const rt = await RefreshToken.exists({ id: user._id });
      let accessToken, refreshToken;
      const data = {
        id: user._id,
        active: user.active,
      };
      const listItem = await Wishlist.findOne({ id: user._id }).select(
        "list -_id"
      );
      let list;
      if (listItem) {
        list = listItem.list.map((el) => el.id);
      }
      accessToken = JWTService.sign(data);
      refreshToken = JWTService.refresh(data);
      if (!rt) {
        RefreshToken.create({ id: user._id, token: refreshToken });
        res.cookie("jwt", refreshToken, {
          ...(remember === true && {
            expires: new Date(Date.now() + 604800000),
          }),
          httpOnly: true,
        });
        res.json({ accessToken, list });
      } else {
        const { token } = await RefreshToken.findOne({ _id: rt._id });
        res.cookie("jwt", token, {
          ...(remember === true && {
            expires: new Date(Date.now() + 604800000),
          }),
          httpOnly: true,
        });
        res.json({ accessToken, list });
      }
    } catch (error) {
      console.log(error);
    }
  },
  async activate(req, res, next) {
    try {
      const { validData } = req.cookies;
      if (!validData) return next(CustomError.unauthorized);
      const { username, email, password } = JWTService.sign_v(validData);
      if (req.email != email) return next(CustomError.notValid("Invalid OTP"));
      const user = new User({
        username,
        email: email.toLowerCase(),
        active: true,
      });
      user.subUsers = {
        username,
        imgUrl: "https://i.ibb.co/dmJDQBn/images.png",
      };
      user.setPassword(password);
      const usr = await user.save();
      const jwtData = {
        id: usr._id,
        active: true,
      };
      const accessToken = JWTService.sign(jwtData);
      const refreshToken = JWTService.refresh(jwtData);
      await RefreshToken.create({ id: usr._id, token: refreshToken });
      res.clearCookie("validData", {
        expires: new Date(Date.now() + 200000),
        httpOnly: true,
      });
      res.cookie("jwt", refreshToken, {
        expires: new Date(Date.now() + 604800000),
        httpOnly: true,
      });
      res.json({ accessToken });
    } catch (error) {
      console.log(error);
    }
  },
  async forgot(req, res, next) {
    try {
      const userEmail = req.email.toLowerCase();
      const email = await User.findOne({ email: userEmail });
      if (!email) return next(CustomError.notfound("No user found"));
      res.cookie("email", userEmail, {
        expires: new Date(Date.now() + 200000),
        httpOnly: true,
      });
      res.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  },
  async reset(req, res, next) {
    const { error } = Resetvalidator.validate(req.body);
    if (error) return next(error);
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return next(CustomError.unauthorized());
      await user.setPassword(req.body.password);
      user.save();
      res.sendStatus(204);
    } catch (error) {
      return next(CustomError.serverError("something went wrong try again"));
    }
  },
  async logout(req, res, next) {
    try {
      const { jwt } = req.cookies;
      if (!jwt) return res.sendStatus(204);
      const userfound = await RefreshToken.deleteOne({ token: jwt });
      if (!userfound) {
        res.clearCookie("jwt", {
          expires: new Date(Date.now() + 604800000),
          httpOnly: true,
        });
        return res.sendStatus(403);
      }
      // await RefreshToken.findOneAndDelete({ token: jwt });
      res.clearCookie("jwt", {
        expires: new Date(Date.now() + 604800000),
        httpOnly: true, // secure:true for https
      });
      res.sendStatus(204);
    } catch (err) {
      return next(err);
    }
  },
  async refresh(req, res, next) {
    try {
      const { jwt } = req.cookies;
      if (!jwt) return next(CustomError.unauthorized());
      const usr = await RefreshToken.exists({ token: jwt });
      if (!usr) return next(CustomError.unauthorized());
      const { id, active } = JWTService.refresh_v(jwt);
      const accessToken = JWTService.sign({ id, active });
      res.json({ accessToken });
    } catch (error) {
      return next(error);
    }
  },
  async users(req, res, next) {
    try {
      const data = await User.findById({ _id: req.user.id });
      res.json(data.subUsers);
    } catch (error) {
      console.log(error);
    }
  },
  async addUsers(req, res, next) {
    const { username, imgUrl } = req.body;
    if (!username && !imgUrl)
      return next(CustomError.notValid("username and imgUrl is required"));
    try {
      const reqUser = await User.findById({ _id: req.user.id });
      if (!reqUser) return next(CustomError.serverError());
      if (reqUser.subUsers.length > 3)
        return next(CustomError.limitReach("max user limit reached"));
      const users = reqUser.subUsers.filter((usr) => usr.username == username);
      if (users.length > 0)
        return next(CustomError.alreayExist("username already exist"));
      await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          $push: {
            subUsers: {
              username,
              imgUrl,
            },
          },
        }
      );
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
    }
    // if(!user.user && !user.imgUrl) return next(CustomError.notValid("user Object must have atleast user or imgurl"))
  },
  async updateUser(req, res, next) {
    const { username, imgUrl } = req.body;
    const { userid } = req.params;
    if (!username && !imgUrl) return;
    try {
      const usr = await User.findOne({ _id: req.user.id });
      if (!usr) return next(CustomError.unauthorized());
      let index, data;
      for (let i = 0; i < usr.subUsers.length; i++) {
        if (usr.subUsers[i].username == username) {
          return next(CustomError.alreayExist("username already exist"));
        }
        if (usr.subUsers[i].username == userid) {
          data = usr.subUsers[i];
          index = i;
          break;
        }
      }

      if (username) {
        delete data.username;
        data["username"] = username;
      }
      if (imgUrl) {
        delete data.imgUrl;
        data["imgUrl"] = imgUrl;
      }
      usr.updateByIndex(index, data);
      usr.save();
      res.sendStatus(201);
    } catch (error) {
      console.log(error);
    }
  },
  async deleteUser(req, res, next) {
    const { userid } = req.params;
    try {
      await User.findByIdAndUpdate(
        { _id: req.user.id },
        { $pull: { subUsers: { username: userid } } }
      );
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
    }
  },
  async profile(req, res, next) {
    try {
      let user = await User.findById({ _id: req.user.id });
      user = {
        username: user.username,
        email: user.email,
        active: user.active,
        DOJ: user.createdAt,
      };
      res.json(user);
    } catch (error) {
      return next(error);
    }
  },
  async deleteProfile(req, res, next) {
    try {
      await User.findByIdAndDelete({ _id: req.user.id });
      await Wishlist.findOneAndDelete({ id: req.user.id });
      await RefreshToken.findOneAndDelete({ id: req.user.id });
      try {
        const { jwt } = req.cookies;
        if (!jwt) return res.sendStatus(204);
        const userfound = await RefreshToken.deleteOne({ token: jwt });
        if (!userfound) {
          res.clearCookie("jwt", {
            expires: new Date(Date.now() + 604800000),
            httpOnly: true,
          });
          return res.sendStatus(403);
        }
        // await RefreshToken.findOneAndDelete({ token: jwt });
        res.clearCookie("jwt", {
          expires: new Date(Date.now() + 604800000),
          httpOnly: true, // secure:true for https
        });
        res.sendStatus(204);
      } catch (err) {
        return next(err);
      }
    } catch (error) {
      return next(CustomError.serverError());
    }
  },
  async updateProfile(req, res, next) {
    try {
      const { username, email, password, repeatPassword } = req.body.change;
      if (!req.body.change)
        return next(CustomError.notValid("Change Object is required"));

      if (password !== repeatPassword)
        return next(CustomError.notValid("password not matched"));
      if (username) {
        const name = await User.exists({ username });
        if (name)
          return next(CustomError.alreayExist("username already taken"));
      }
      if (email) {
        const emailfound = await User.exists({ email });
        if (emailfound)
          return next(CustomError.alreayExist("Email already taken"));
      }
      let user = await User.findOne({ _id: req.user.id });
      if (username) {
        user.username = username;
        await user.save();
      }
      if (email) {
        user.email = email;
        await user.save();
      }
      if (password) {
        user.setPassword(password);
        await user.save();
      }
      user = {
        username: user.username,
        email: user.email,
        active: user.active,
        DOJ: user.createdAt,
      };
      res.json(user);
    } catch (error) {
      console.log(error);
      // return next(error);
    }
  },
  async verifyOTP(req, res, next) {
    res.sendStatus(204);
  },

  async emailOTP(req, res, next) {
    if (!req.body.email) return next(CustomError.notValid("email is required"));
    try {
      const user = await OTP.findOne({ email: req.body.email });
      if (user) {
        let limit = user.reqCount;
        if (limit > 3) return next(CustomError.limitReach("OTP limit Reached"));
        ActivateMail(req.body.email, "email", res);
        res.cookie("email", req.body.email, {
          expires: new Date(Date.now() + 200000),
          httpOnly: true,
        });
      } else {
        ActivateMail(req.body.email, "email", res, next);
        res.cookie("email", req.body.email, {
          expires: new Date(Date.now() + 200000),
          httpOnly: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  async resetOTP(req, res, next) {
    try {
      const user = await OTP.findOne({ email: req.email });
      if (user) {
        let limit = user.reqCount;
        if (limit > 3) return next(CustomError.limitReach("OTP limit Reached"));
        ResetMail(req.email, res);
      } else {
        ResetMail(req.email, res);
      }
    } catch (error) {
      console.log(error);
    }
  },
  async activateOTP(req, res, next) {
    const { email } = req.body;
    if (!email) return next(CustomError.unauthorized());
    try {
      const user = await OTP.findOne({ email });
      if (user) {
        let limit = user.reqCount;
        if (limit > 3) return next(CustomError.limitReach("OTP limit Reached"));
        ActivateMail(email, "account", res);
        res.cookie("email", req.body.email, {
          expires: new Date(Date.now() + 200000),
          httpOnly: true,
        });
      } else {
        ActivateMail(email, "account", res);
        res.cookie("email", req.body.email, {
          expires: new Date(Date.now() + 200000),
          httpOnly: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};
