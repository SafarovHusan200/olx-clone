const Poster = require("../models/posterModel")
// @route     GET /
// @desc      Get home page
// @access    Public
const getHomePage = async (req, res) => {
  const posters = await Poster.find().lean()
  res.render("home", {
    title: "Home page",
    posters: posters.reverse().slice(0, 8),
    url: process.env.URL,
    user: req.session.user,
    isLogged: req.session.isLogged,
  });
};

module.exports = {
  getHomePage,
};
