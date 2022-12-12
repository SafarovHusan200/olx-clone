const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// @route   GET /profile/:username
// @desc    Users profile page
// @access  Private
const getProfilePage = async (req, res) => {
  try {
    const userProfile = await User.findOne({ username: req.params.username })
      .populate("posters")
      .lean();
    const isMe = userProfile._id.toString() == req.session.user._id.toString();
    if (!userProfile) throw new Error("Bunday foydalanuvchi mavjud emas!");
    res.render("user/profile", {
      title: `${userProfile.username}`,
      user: req.session.user,
      userProfile,
      isMe,
      myposters: req.session.user.username,
      posters: userProfile.posters.reverse(),
      isAuth: req.session.isLogged,
      url: process.env.URL,
    });
  } catch (err) {
    console.log(err);
  }
};

// @route   GET /profile/:username
// @desc    Update user detailts page
// @access  Private
const updateUserPage = async (req, res) => {
  const user = await User.findById(req.session.user._id).lean();
  try {
    res.render("user/update", {
      title: `${req.session.user.username}`,
      user,
      isAuth: req.session.isLogged,
      url: process.env.URL,
      changeError: req.flash("changeError"),
    });
  } catch (err) {
    console.log(err);
  }
};

// @route   POST /profile/change
// @desc    Update user detailts
// @access  Private
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const { username, phone, oldPassword, newPassword } = req.body;
    if (oldPassword === "" && newPassword === "") {
      await User.findByIdAndUpdate(user._id, req.body);
      return res.redirect(`/profile/${user.username}`);
    }
    const matchPassword = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );
    if (!matchPassword) {
      req.flash("changeError", "Old password is wrong");
      return res.redirect("/profile/change");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(user._id, {
      username,
      phone,
      password: hashedPassword,
    });
    return res.redirect(`/profile/${user.username}`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getProfilePage,
  updateUserPage,
  updateUser,
};
