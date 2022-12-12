const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// @route   GET /auth/login
// @desc    Get login page
// @access  Public
const getLoginPage = (req, res) => {
  if (!req.session.isLogged) {
    res.render("auth/login", {
      title: "Login",
      loginError: req.flash("loginError"),
      url: process.env.URL,
    });
  }
};

// @route   GET /auth/signup
// @desc    Get register page
// @access  Public
const getRegisterPage = (req, res) => {
  if (!req.session.isLogged) {
    res.render("auth/signup", {
      title: "Registratsiya",
      regError: req.flash("regError"),
      url: process.env.URL,
    });
  }
};

// @route   POST /auth/signup
// @desc    Register new user database
// @access  Public
const registerNewUser = async (req, res) => {
  try {
    const { email, username, phone, password, password2 } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist) {
      req.flash("regError", "Bunday foydalanuvchi bazada bor");
      return res.redirect("/auth/signup");
    }
    if (password !== password2) {
      req.flash("regError", "Parollar mos tushmayapti");
      return res.redirect("/auth/signup");
    }

    await User.create({
      email,
      username,
      phone,
      password,
    });

    return res.redirect("/auth/login");
  } catch (err) {
    console.log(err);
  }
};

// @route   POST /auth/login
// @desc    Login user to website
// @access  Public
const loginUser = async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      const matchPassword = await bcrypt.compare(
        req.body.password,
        userExist.password
      );
      if (matchPassword) {
        req.session.user = userExist;
        req.session.isLogged = true;
        req.session.save((err) => {
          if (err) throw err;
          res.redirect("/profile/" + req.session.user.username);
        });
      } else {
        req.flash("loginError", "Noto`g`ri ma`lumot kiritildi");
        res.redirect("/auth/login");
      }
    } else {
      req.flash("loginError", "Bunday foydalanuvchi mavjud emas");
      res.redirect("/auth/login");
    }
  } catch (err) {
    console.log(err);
  }
};

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

module.exports = {
  getLoginPage,
  getRegisterPage,
  registerNewUser,
  loginUser,
  logout,
};
