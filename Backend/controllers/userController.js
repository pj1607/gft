import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

//register

export const registerUser = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address.',
        success: 'no'
      });
    }

    if (username.length < 4) {
      return res.status(400).json({
        error: 'Username must be at least 4 characters long.',
        success: 'no'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
        success: 'no'
      });
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(400).json({
        message: 'Email already exists, please try with another',
        success: 'no'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '2d'  // Token expires in 2 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      success: 'yes',
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token  // Send the token in the response body
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: 'no'
    });
  }
};
//LOGIN
export const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        success: 'no'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
        success: 'no'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2d' } 
    );

    res.status(200).json({
      message: 'Login successful',
      success: 'yes',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token 
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: 'Internal server error',
      success: 'no'
    });
  }
};

//SEND-OTP

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const buffer = crypto.randomBytes(4);
      const token = buffer.readUInt32BE(0) % 900000 + 100000;

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 	120000;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,       
          pass: process.env.EMAIL_APP_PASS,  
        },
      });

      const mailOptions = {
        from: `"Gym Fee Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP',
        html: `<p>Your OTP is <b>${token}</b>. It is valid for 2 minutes.</p>`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: 'OTP sent successfully',
        success: 'yes',
        email,
      });

    } else {
      res.status(404).json({ error: 'Email not found',message:'Email not found', success: 'no' });
    }

  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};


// CHECK OTP

export const checkOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

     const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'OTP is invalid or has expired' });
    }

    res.status(200).json({ message: 'OTP is successfully verified' });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

//RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword ,confirmNewPassword} = req.body;

    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Technical error' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};



// UPDATE PROFILE with validation
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username ) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (!email ) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (typeof username !== 'string' || username.trim().length < 4) {
      return res.status(400).json({ message: 'Username must be at least 4 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim(), email: email.toLowerCase() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


//GET-PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('username email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const demoLogin = async (req, res) => {
  try {

    const demoUser = await User.findOne({email:"demo@gmail.com"});

    if (!demoUser) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const token = jwt.sign(
      { id: demoUser._id},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Demo login successful",
      data: {
        id: demoUser._id,
        username: demoUser.username,
        email: demoUser.email,
        token,
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
