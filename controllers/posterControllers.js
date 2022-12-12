const Poster = require("../models/posterModel");
const User = require("../models/userModel");
const filtering = require("../utils/filtering");

// @route     GET /posters
// @desc      Get all poster
// @access    Public
const getPostersPage = async (req, res) => {
  try {
    const pagelimit = 10;
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const total = await Poster.countDocuments();

    // Redirect f queryes [page, limit] doesn't exist
    if (req.url === "/") {
      return res.redirect(`?page=1&limit=${pagelimit}`);
    }
    if (req.query.search) {
      const { search } = req.query;
      const posters = await Poster.searchFull(search, (err, data) => {
        if (err) throw new Error();
      }).lean();

      return res.status(200).render("poster/searchResults", {
        title: "Search results",
        posters: posters.reverse(),
        user: req.session.user,
        querySearch: req.query.search,
        url: process.env.URL,
      });
    }

    if (!req.query.page || !req.query.limit) {
      const { category, from, to, region } = req.query;
      // $gte $lte $gt $lt
      const filterings = filtering(category, from, to, region);
      const posters = await Poster.find(filterings).lean();

      return res.render("poster/searchResults", {
        title: "Filter results",
        posters: posters.reverse(),
        user: req.session.user,
        querySearch: req.query.search,
        url: process.env.URL,
      });
    }


    const posters = await Poster
      .find()
      .sort({createdAt: -1})
      .skip(page * limit - limit)
      .limit(limit)
      .lean();
    return res.render("poster/posters", {
      title: "Posters page",
      posters: posters.reverse(),
      pagination: {
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
      user: req.session.user,
      url: process.env.URL,
      // myposters: req.session.user.username,
    });
  } catch (err) {
    console.log(err);
  }
};

// @route     GET /posters/:id
// @desc      Get One poster by id
// @access    Public
const getOnePoster = async (req, res) => {
  try {
    const poster = await Poster.findByIdAndUpdate(
      req.params.id,
      { $inc: { visits: 1 } },
      { new: true }
    )
      .populate("author")
      .lean();
    res.render("poster/one", {
      title: poster.title,
      url: process.env.URL,
      user: req.session.user,
      author: poster.author,
      poster,
      myposters: req.session.user.username,
    });
  } catch (error) {
    console.log(error);
  }
};

// @route     GET /posters/add
// @desc      Get one poster
// @access    Private
const addNewPosterPage = (req, res) => {
  res.render("poster/add-poster", {
    title: "Yangi e'lon qo'shish",
    url: process.env.URL,
    user: req.session.user,
  });
};

// @route     POST /posters/add
// @desc      Add new poster
// @access    Private
const addNewPoster = async (req, res) => {
  try {
    // await Poster.create(poster);
    const newPoster = new Poster({
      title: req.body.title,
      amount: req.body.amount,
      region: req.body.region,
      category: req.body.category,
      image: "uploads/" + req.file.filename,
      description: req.body.description,
      author: req.session.user._id,
    });

    await User.findByIdAndUpdate(
      req.session.user._id,
      { $push: { posters: newPoster._id } },
      { new: true, upsert: true }
    );
    await newPoster.save((err, posterSaved) => {
      if (err) throw err;
      const posterId = posterSaved._id;
      res.redirect("/posters/" + posterId);
    });
  } catch (err) {
    console.log(err);
  }
};

// @route     POST /posters/:id/edit
// @desc      Get edit poster page
// @access    Private (Own)
const getEditPosterPage = async (req, res) => {
  try {
    const poster = await Poster.findById(req.params.id).lean();
    res.render("poster/edit-poster", {
      title: "Edit page",
      url: process.env.URL,
      poster,
    });
  } catch (err) {
    console.log(err);
  }
};

// @route     POST /posters/:id/edit
// @desc      edit poster by id
// @access    Private (Own)
const updatePoster = async (req, res) => {
  const editedposter = {
    title: req.body.title,
    amount: req.body.amount,
    region: req.body.region,
    category: req.body.category,
    image: req.body.image,
    description: req.body.description,
  };
  await Poster.findByIdAndUpdate(req.params.id, editedposter);
  res.redirect("/posters");
};

// @route     POST /posters/:id/delete
// @desc      Delete poster by id
// @access    Private (Own)
const deletePoster = async (req, res) => {
  try {
    await Poster.findByIdAndRemove(req.params.id);
    res.redirect("/posters");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getPostersPage,
  addNewPosterPage,
  addNewPoster,
  getOnePoster,
  getEditPosterPage,
  updatePoster,
  deletePoster,
};
