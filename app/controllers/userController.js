const { Group, Member } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

exports.createAdmin = async (req, res, next) => {
  try {
    let { groupName, firstname, email, password, color } = req.body;
    const role = 3;
    // cleans body elements
    groupName = groupName.trim();
    firstname = firstname.trim();

    // checks if all inputs contain something
    if (!groupName || !firstname || !email || !password || !color) {
      return res.status(403).json({
        success: false,
        error: 'All fields must contain something.',
      });
    }

    // checks if valid email
    if (!emailValidator.validate(email)) {
      return res.status(403).json({
        success: false,
        error: 'Email not valid.',
      });
    }
    // checks if password have more than 8 character, one uppercase letter, one lowercase letter, one special case letter and one digit.
    const regexPassword =
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*([\d]){1})((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/g;
    const passwordValidation = regexPassword.test(password);
    if (!passwordValidation) {
      return res.status(403).json({
        success: false,
        error:
          'Password must have 8 characters minimum, one uppercase, one lowercase, one special case and one digit.',
      });
    }

    // checks if member already exists
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });
    // if the member already exists, send back member
    if (searchedMember) {
      return res.status(403).json({
        success: false,
        error: 'This user already exists',
      });
    }

    //group creation
    const group = await Group.create({
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
      color,
      role,
      id_group: group.id,
    });
    //if not created
    if (createdMember) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'The member was not created.',
      });
    }
  } catch (error) {
    res.status(403).json({
      success: false,
      error: error.message,
    });
  }
};
exports.login = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    // checks if email and password are not empty
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        error: 'All fields must contain something',
      });
    }
    // email verification
    if (!emailValidator.validate(email)) {
      return res.status(403).json({
        success: false,
        error: 'Email is not valid',
      });
    }

    // searches member
    const searchedMember = await Member.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });

    // password verification false by default
    let validPwd = false;

    // checks if member exists
    if (!searchedMember) {
      return res.status(403).json({
        success: false,
        error: 'This user does not exist.',
      });
    } else {
      // checks if password correponds
      validPwd = await bcrypt.compare(
        password,
        searchedMember.dataValues.password
      );
      if (!validPwd) {
        return res.status(403).json({
          success: false,
          error: 'The password is not valid.',
        });
      }
    }

    //checks if all verifications are ok
    const member = searchedMember.dataValues;
    delete member.password;

    //gets all group members
    const groupMembers = await Member.findAll({
      where: {
        id_group: member.id_group,
      },
    });
    if (!groupMembers.length) {
      return res.status(403).json({
        success: false,
        error: 'No members were found',
      });
    }

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
      algorithm: 'HS256',
      expiresIn: '24h',
    };
    //sends back all info + token signature
    res.json({
      member,
      groupMembers,
      connected: true,
      token: jsonwebtoken.sign(jwtContent, process.env.JWT_SECRET, jwtOptions),
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      error: error.message,
    });
  }
};
