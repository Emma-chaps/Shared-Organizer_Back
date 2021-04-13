const { Group, Member } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

exports.test = (req, res, next) => {
  res.json({
    status: 'ok',
  });
};

exports.authorizationMiddleware = (req, res, next) => {
  const bearerHeader = req.headers['Authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerHeaderArray = bearerHeader.split(' ');
    const bearerToken = bearerHeaderArray[1];
    jsonwebtoken.verify(bearerToken, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        res.json({
          error: 'error 401: Unauthorized token',
        });
      } else {
        req.bearerToken = bearerToken;
        req.tokenData = data;
        next();
      }
    });
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    let { groupName, firstname, email, password, icon } = req.body;
    const role = 3;

    // cleans body elements
    groupName = groupName.trim();
    firstname = firstname.trim();

    // assigns admin role
    let member = null;
    let group = null;
    let created = false;
    const error = [];

    // checks if all inputs contain something
    if (!groupName || !firstname || !email || !password || !icon) {
      error.push('All fields must contain something.');
    }
    // checks if valid email
    if (!emailValidator.validate(email)) {
      error.push('Email not valid.');
    }
    // checks if member already exists
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });
    // if the member already exists, send back member
    if (searchedMember) {
      error.push('This user already exists.');
    }

    if (!error.length) {
      // password encryption
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      // admin creation
      member = await Member.create({
        firstname,
        email,
        password: encryptedPassword,
        icon,
        role,
      });
      //group creation
      group = await Group.create({
        name: groupName,
      });
      created = true;
    }

    res.json({
      member,
      group,
      created,
      error,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  console.log('req.body:', req.body);

  try {
    const { password, email } = req.body;
    const error = [];
    let member = null;
    let connected = false;

    // email verification
    if (!emailValidator.validate(email)) {
      error.push('Email not valid.');
    }
    // checks if email and password are not empty
    if (!email || !password) {
      error.push('All fields must contain something.');
    }

    // searches member
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });

    // password verification false by default
    let validPwd = false;

    // checks if member exists
    if (!searchedMember) {
      error.push('This user does not exist.');
    } else {
      // checks if password correponds
      validPwd = await bcrypt.compare(password, searchedMember?.password);
      !validPwd && error.push('The password is not valid.');
    }

    //checks if all verifications are ok
    if (!error.length) {
      member = searchedMember.dataValues;
      delete member.password;
      connected = true;

      //creates JWT payload
      const jwtContent = {
        id: member.id,
        role: member.role,
        firstname: member.firstname,
      };
      //creates JWT encryption options
      const jwtOptions = {
        algorithm: 'HS256',
        expiresIn: '3h',
      };
      //sends back all info + token signature
      res.json({
        error,
        member,
        connected,
        token: jsonwebtoken.sign(
          jwtContent,
          process.env.JWT_SECRET,
          jwtOptions,
        ),
      });
    } else {
      res.json({
        error,
        member,
        connected,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
