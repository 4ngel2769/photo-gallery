import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if email already exists
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              await user.save();
            } else {
              // Create new user
              user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4),
                displayName: profile.displayName || profile.emails[0].value.split('@')[0],
                isAdmin: false,
                needsPasswordChange: false, // OAuth users don't need password change
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            // Get primary email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            
            if (email) {
              // Check if email already exists
              user = await User.findOne({ email });
              
              if (user) {
                // Link GitHub account to existing user
                user.githubId = profile.id;
                await user.save();
              } else {
                // Create new user
                user = await User.create({
                  githubId: profile.id,
                  email,
                  username: profile.username || email.split('@')[0],
                  displayName: profile.displayName || profile.username || email.split('@')[0],
                  isAdmin: false,
                  needsPasswordChange: false, // OAuth users don't need password change
                });
              }
            } else {
              return done(new Error('No email found in GitHub profile'), null);
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
