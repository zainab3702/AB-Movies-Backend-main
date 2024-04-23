const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const z = require("zod");
// importing dotenv config for accessing environment variables
require("dotenv/config");

//  fetching the user model from models
const User = require("../models/Users");

// handler function to create a new user in the database
const handleRegister = async (req, res) => {
  try {
    //   extracting the username(email) and password from body object
    const { email, password } = req.body;

    // defining zod validations for email and password;
    const emailSchema = z.string().email();

    /* 

    this regex below ensures that password has at least one lowercase letter, one uppercase letter,
  one number, and one special character, with the password starting with an uppercase or lowercase letter:

Explanation:

^ asserts the start of the string.
(?=.*[a-z]) ensures that there is at least one lowercase letter.
(?=.*[A-Z]) ensures that there is at least one uppercase letter.
(?=.*\d) ensures that there is at least one number.
(?=.*[!@#$%^&*()\-_=+{};:,<.>]) ensures that there is at least one special character. You can adjust this character set as per your specific requirements.
.{8,} ensures that the password is at least 8 characters long. You can adjust the minimum length as needed.
$ asserts the end of the string. */

    const passwordSchema = z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,32}$/
      );

    // to parse the email and check if it meets confidtions defined above
    const parsedEmail = emailSchema.safeParse(email);

    //  if it fails validation send a 400 bad request error
    if (!parsedEmail.success)
      return res
        .status(400)
        .json({ success: false, message: "Not a valid email" });

    // to parse the password and check if it meets confidtions defined above
    const parsedPassword = passwordSchema.safeParse(password);

    // defining a password error to show if password validation fails
    const passwordError = `The password should have atleast:
      1. An uppercase letter
      2. A lowercase letter
      3. A number and a special character`;

    //  if it fails validation send a 400 bad request error
    if (!parsedPassword.success)
      return res
        .status(400)
        .json({ success: false, message: `${passwordError}` });

    // define a regex for email to perform an exactly matching case-Insenstive search
    const emailRegex = new RegExp(`^${email}$`, "i");

    // checking if user already exists in database
    const doesUserExist = await User.findOne({ email: { $regex: emailRegex } });

    // if user exists fail registration with an error
    if (doesUserExist)
      return res
        .status(409)
        .json({ success: false, message: "Email Already Registred" });

    //   hashing the password with a salt to save in database
    const hashedPassword = await bcrypt.hash(password, 10);

    // saving the user in database
    const user = new User({
      email,
      password: hashedPassword,
      watchList: [],
    });
    await User.create(user);

    res.status(201).json({
      success: true,
      message: "User registered successfuly",
      email: email,
    });
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Can't register user please try again",
    });
  }
};

// handler function to login a user
const handleLogin = async (req, res) => {
  try {
    //   extracting the username(email) and password from body object
    const { email, password } = req.body;
    // define a regex for email to perform an exactly matching case-Insenstive search
    const emailRegex = new RegExp(`^${email}$`, "i");
    //   finding that if the entered email is correct
    const doesUserExist = await User.findOne({ email: { $regex: emailRegex } });
    // if given email is incorrect send a 401 unAuthorized error with invalid email error
    if (!doesUserExist) {
      return res
        .status(401)
        .json({ success: false, message: "Given email id does not exist" });
    }

    // proceeding ahead to check password if given email is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      doesUserExist.password
    );

    // if given password is not correct return a 401 unAuthorized error with invalid password login
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password please try again",
      });
    }

    // creating a access_jwt token for auth during further logins
    const accessToken = jwt.sign(
      { email: doesUserExist.email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h", // NOTE: This evaulates to 1 hour
      }
    );

    // sending the success and accessToken as a response back to the client
    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    // logging the error
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: "Can't login please try again",
    });
  }
};

// handler function to logout the user
const handleLogout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res
      .status(204)
      .json({ success: false, message: "User not logged in" });
  }

  // sending response status 200 back to client
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

// handler function to get user detials using jwt access_token
const handleJwtLogin = async (req, res) => {
  // extracting user email using user object from middleware
  const user = req.user;

  // define a regex for email to perform an exactly matching case-Insenstive search
  const emailRegex = new RegExp(`^${user.email}$`, "i");

  // getting the user details from database
  const userDetails = await User.findOne(
    { email: { $regex: emailRegex } },
    { _id: 0, email: 1 }
  );

  // if no user is found return a 404 error
  if (!userDetails)
    return res
      .status(404)
      .json({ success: false, message: "User not found please login again" });

  //else send the response back to client
  res.status(200).json({ success: true, userDetails });
};
module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  handleJwtLogin,
};
