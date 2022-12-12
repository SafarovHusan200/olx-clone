const { Router } = require("express");
const router = Router();

const {
  getProfilePage,
  updateUserPage,
  updateUser,
} = require("../controllers/profileControllers");

router.get("/change", updateUserPage);
router.post("/change", updateUser);
router.get("/:username", getProfilePage);

module.exports = router;
