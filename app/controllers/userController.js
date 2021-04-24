const { Group, Member } = require("../models");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

exports.createAdmin = async (req, res, next) => {
  try {
    let { groupName, firstname, email, password, icon } = req.body;
    const role = 3;

    // cleans body elements
    groupName = groupName.trim();
    firstname = firstname.trim();

    // assigns admin role

    // checks if all inputs contain something
    if (!groupName || !firstname || !email || !password || !icon) {
      throw new Error("All fields must contain something.");
    }
    // checks if valid email
    if (!emailValidator.validate(email)) {
      throw new Error("Email not valid.");
    }
    // checks if member already exists
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });
    // if the member already exists, send back member
    if (searchedMember) {
      throw new Error("This user already exists.");
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
      icon,
      role,
      id_group: group.id,
    });
    //if not created
    if (createdMember) {
      next();
    } else {
      throw new Error("the member was not created");
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    console.log("password:", password);

    // checks if email and password are not empty
    if (!email || !password) {
      throw new Error("All fields must contain something.");
    }
    // email verification
    if (!emailValidator.validate(email)) {
      throw new Error("Email not valid.");
    }

    // searches member
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });
    console.log("searchedMember:", searchedMember.dataValues);

    // password verification false by default
    let validPwd = false;

    // checks if member exists
    if (!searchedMember) {
      throw new Error("This user does not exist.");
    } else {
      // checks if password correponds
      validPwd = await bcrypt.compare(
        password,
        searchedMember.dataValues.password
      );
      if (!validPwd) throw new Error("The password is not valid.");
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
    if (!groupMembers.length) throw new Error("No members were found");

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
      member,
      groupMembers,
      connected: true,
      token: jsonwebtoken.sign(jwtContent, process.env.JWT_SECRET, jwtOptions),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
