const { Router } = require("express");
const { getHomePage } = require("../controllers/homeControllers");

const router = Router();

router.get("/", getHomePage);

module.exports = router;
