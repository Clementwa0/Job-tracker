const Google = require("@auth/express/providers/google").default;
const GitHub = require("@auth/express/providers/github").default;
const User = require("../models/User");

async function findOrCreateOAuthUser({ provider, providerId, email, name, avatarUrl }) {
  if (!email) throw new Error("OAuth provider returned no email");
  let user = await User.findOne({ email });
  if (user) {
    const hasProvider = user.providers.some(
      (p) => p.provider === provider && p.providerId === providerId
    );
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

const providers = [];
if (process.env.GOOGLE_CLIENT_ID) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}
if (process.env.GITHUB_CLIENT_ID) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

const authConfig = {
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/api/auth/social/start",
    error: `${process.env.CLIENT_URL}/login`,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const email =
          user?.email ||
          profile?.email ||
          (Array.isArray(profile?.emails) ? profile.emails[0]?.value : undefined);
        const dbUser = await findOrCreateOAuthUser({
          provider: account.provider,
          providerId: account.providerAccountId,
          email,
          name: user?.name || profile?.name || profile?.login,
          avatarUrl: user?.image || profile?.avatar_url || profile?.picture,
        });
        user.dbId = String(dbUser._id);
        return true;
      } catch (err) {
        console.error("Auth.js signIn error:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.dbId) token.dbId = user.dbId;
      return token;
    },
    async session({ session, token }) {
      if (token?.dbId) session.userId = token.dbId;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/api/auth/social/complete`;
    },
  },
};

module.exports = { authConfig };
