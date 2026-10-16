import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  registerUser, loginUser, sendOtp, checkOtp, resetPassword,
  updateProfile, getProfile,demoLogin
} from '../controllers/userController.js';
import { verifyToken } from '../auth/auth.js';
import User from '../models/userModel.js'

const router = express.Router();

router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/check-otp', checkOtp);
router.post('/reset-password', resetPassword);
router.put('/profile/update', verifyToken, updateProfile);
router.get('/profile', verifyToken, getProfile);

router.post("/demo-login", demoLogin);

const googleClientId = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_CLIENT_ID_PROD
  : process.env.GOOGLE_CLIENT_ID_LOCAL;

const googleClientSecret = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_CLIENT_SECRET_PROD
  : process.env.GOOGLE_CLIENT_SECRET_LOCAL;

  const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? 'https://gym-fee-tracker-vite-31pd.onrender.com/auth/google/callback'
  : 'http://localhost:4000/auth/google/callback';


// Google OAuth Setup
passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackURL,
  },
  
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value;
      const username = profile.displayName;
      const picture = profile.photos?.[0]?.value;

      let user = await User.findOne({ googleId });

      if (!user) {
        user = await User.findOne({ email });
      }

      if (!user) {
        user = await User.create({
          googleId,
          email,
          username,
          picture
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }

      done(null, {
        _id: user._id,
        username: user.username,
        email: user.email
      });

    } catch (err) {
      done(err, null);
    }
  }
));

router.use(passport.initialize());

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
 const frontend = process.env.NODE_ENV === 'production' 
      ? 'https://gym-fee-tracker.vercel.app'
      : 'http://localhost:5173';

res.redirect(`${frontend}/oauth-success?token=${token}`);


  }
);

export default router;
