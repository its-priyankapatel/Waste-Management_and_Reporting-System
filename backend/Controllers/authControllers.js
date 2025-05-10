const express = require("express");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const User = require("../Model/userModel");

//Register the user
const registerController = async (req, res) => {
  const { name, email, password, role, contact, address } = req.body;
  try {
    //validation
    if (!name || !email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if the user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }

    //validate role
    const validRoles = ["admin", "citizen", "worker", "supervisor"];
    if (!validRoles.includes(role)) {
      return res.status(400).send({
        success: false,
        message: "Invalid Role",
      });
    }

    //validate password length
    if (password.length < 8) {
      return res.status(400).send({
        success: false,
        message: "Password must be atleast 8 characters",
      });
    }

    //validate citizen's contact and address
    if (role === "citizen" && (!contact || !address)) {
      return res.status(400).send({
        success: false,
        message: "Citizen must provide contact and address",
      });
    }

    // Create salt (with 10 rounds of salting)
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      contact: role === "citizen" ? contact : undefined,
      address: role === "citizen" ? address : undefined,
    });

    //save the user
    await newUser.save();

    return res.status(201).send({
      success: true,
      message: "User Registered Successfully",
      newUser: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        contact: role === "citizen" ? newUser.contact : undefined,
        address: role === "citizen" ? newUser.address : undefined,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Login the user
const loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    //validate email and password
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

    //check user exist or not
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    //comparePassword
    const isMatchPassword = await bcrypt.compare(password, userExist.password);
    if (!isMatchPassword) {
      return res.status(401).send({
        success: false,
        message: "Password doesn't match",
      });
    }

    //Generate Token
    const token = JWT.sign(
      { userId: userExist._id, role: userExist.role },
      process.env.SECRET_KEY,
      { expiresIn: "8d" }
    );

    return res.status(200).send({
      success: true,
      message: "User Logged In Successfully",
      user: {
        _id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        role: userExist.role,
      },

      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = { registerController, loginController };
