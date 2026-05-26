const express = require("express");
const passport = require("passport");
const { signAccessToken } = require("../utils/tokens");
const router = express.Router();

const callback = (provider) => [
  passport.authenticate(provider, { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  async (req, res) => {
    // Issue access token + redirect with token (frontend handles storage)
    const token = signAccessToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
  },
];

router.get("/google", passport.authenticate("google", { session: false, scope: ["profile", "email"] }));
router.get("/google/callback", ...callback("google"));

router.get("/github", passport.authenticate("github", { session: false, scope: ["user:email"] }));
router.get("/github/callback", ...callback("github"));

module.exports = router;
