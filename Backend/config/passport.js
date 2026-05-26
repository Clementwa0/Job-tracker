const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

async function findOrCreateOAuthUser({ provider, providerId, email, name, avatarUrl }) {
  if (!email) throw new Error("OAuth provider returned no email");
  let user = await User.findOne({ email });
  if (user) {
    const hasProvider = user.providers.some((p) => p.provider === provider && p.providerId === providerId);
    if (!hasProvider) {
      user.providers.push({ provider, providerId });
      if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();
    }
    return user;
  }
  user = await User.create({
    name: name || email.split("@")[0],
    email,
    emailVerified: true,
    avatarUrl,
    providers: [{ provider, providerId }],
  });
  return user;
}

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_at, _rt, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (e) { done(e); }
      }
    )
  );
}

if (process.env.GITHUB_CLIENT_ID) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
      },
      async (_at, _rt, profile, done) => {
        try {
          const user = await findOrCreateOAuthUser({
            provider: "github",
            providerId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName || profile.username,
            avatarUrl: profile.photos?.[0]?.value,
          });
          done(null, user);
        } catch (e) { done(e); }
      }
    )
  );
}

module.exports = passport;
