const { Group, Member } = require("../models");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

exports.test = (req, res, next) => {

};

// exports.authorizationMiddleware = (req, res, next) => {
//   //gets bearer header from request
//   const bearerHeader = req.headers['authorization'];
//   //if there is a token
//   if (typeof bearerHeader !== 'undefined') {
//     //gets only the token from the request header
//     const bearerHeaderArray = bearerHeader.split(' ');
//     const bearerToken = bearerHeaderArray[1];
//     //checks if the bearer token corresponds to the server token
//     jsonwebtoken.verify(bearerToken, process.env.JWT_SECRET, (err, data) => {
//       if (err) {
//         // if the tokens don't match
//         res.json({
//           error: 'error 401: Unauthorized token',
//         });
//       } else {
//         console.log(data);
//         // if the tokens match
//         req.bearerToken = bearerToken;
//         req.tokenData = data;
//         //next middleware
//         next();
//       }
//     });
//   } else {
//     // if no token was given
//     res.json({
//       error: 'error 401: Unauthorized token',
//     });
//   }
// };

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
    let token = null;
    const error = [];

    // checks if all inputs contain something
    if (!groupName || !firstname || !email || !password || !icon) {
      error.push("All fields must contain something.");
    }
    // checks if valid email
    if (!emailValidator.validate(email)) {
      error.push("Email not valid.");
    }
    // checks if member already exists
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });
    // if the member already exists, send back member
    if (searchedMember) {
      error.push("This user already exists.");
    }

    if (!error.length) {
      //group creation
      group = await Group.create({
        name: groupName,
      });

      // password encryption
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      // admin creation
      const createdMember = await Member.create({
        firstname,
        email,
        password: encryptedPassword,
        icon,
        role,
        id_group: group.id,
      });
      created = true;

      //clean member to prevent password to be sent to front
      member = createdMember.dataValues;
      delete member.password;

      //creates JWT payload
      const jwtContent = {
        idMember: member.id,
        role: member.role,
        groupId: member.id_group,
        firstname: member.firstname,
      };
      //creates JWT encryption options
      const jwtOptions = {
        algorithm: "HS256",
        expiresIn: "24h",
      };
      //token signature
      token = jsonwebtoken.sign(jwtContent, process.env.JWT_SECRET, jwtOptions);
    }

    res.json({
      member,
      group,
      created,
      error,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  console.log("req.body:", req.body);

  try {
    const { password, email } = req.body;
    const error = [];
    let member = null;
    let connected = false;
    let groupMembers = [];

    // checks if email and password are not empty
    if (!email || !password) {
      error.push("All fields must contain something.");
    }
    // email verification
    if (!emailValidator.validate(email)) {
      error.push('Email not valid.');
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
      error.push("This user does not exist.");
    } else {
      // checks if password correponds
      validPwd = await bcrypt.compare(password, searchedMember?.password);
      !validPwd && error.push("The password is not valid.");
    }

    //checks if all verifications are ok
    if (!error.length) {
      member = searchedMember.dataValues;
      delete member.password;
      connected = true;

      //gets all group members
      groupMembers = await Member.findAll({
        where: {
          id_group: member.id_group,
        },
      });
      for (const groupMember of groupMembers) {
        delete groupMember.dataValues.password;
      }

      //creates JWT payload
      const jwtContent = {
        idMember: member.id,
        role: member.role,
        groupId: member.id_group,
        firstname: member.firstname,
      };
      //creates JWT encryption options
      const jwtOptions = {
        algorithm: "HS256",
        expiresIn: "24h",
      };
      //sends back all info + token signature
      res.json({
        error,
        member,
        groupMembers,
        connected,
        token: jsonwebtoken.sign(
          jwtContent,
          process.env.JWT_SECRET,
          jwtOptions
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
