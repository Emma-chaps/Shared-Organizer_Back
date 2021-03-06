const { Member, Group } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

exports.getgroupInfo = async (req, res, next) => {
  try {
    //Info from token
    const { groupId } = req.tokenData;

    // gets group and associated members
    const group = await Group.findOne({
      where: {
        id: groupId,
      },
      include: 'members',
      order: [['members', 'id', 'ASC']],
    });

    // delete password for each member of members
    group.members.map((member) => {
      delete member.dataValues.password;
    });

    //If all is OK, sends back group containing members
    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { firstname, email, color, role: userRole } = req.body;

    const error = [];
    let message = [];

    // cleans body elements
    firstname = firstname.trim();
    color = color.trim();

    if (isNaN(id)) {
      error.push('"id" must be a number.');
    }
    //
    if (isNaN(userRole)) {
      error.push('"role" must be a number.');
    }

    // checks if all inputs contain something
    if (!firstname || !email || !color) {
      error.push('All fields must contain something.');
    }

    // checks if valid email
    if (!emailValidator.validate(email)) {
      error.push('Email not valid.');
    }

    if (!error.length) {
      const searchedMember = await Member.findByPk(id);
      if (!searchedMember) {
        // return res.json({
        //   success: false,
        //   error: `This member doesn't exist`,
        // });
        error.push(`This member doesn't exist`);
      }
      if (searchedMember.dataValues.email !== email) {
        // checks if member already exists
        const searchedEmailMember = await Member.findOne({
          where: {
            email,
          },
        });
        // if the member already exists, send back member
        if (searchedEmailMember) {
          return res.json({
            success: false,
            userError: 'This user already exists',
          });
        }
      }
      const updatedMember = await Member.update(
        {
          firstname,
          email: email.toLowerCase(),
          color,
          role: userRole,
        },
        {
          where: {
            id: searchedMember.dataValues.id,
          },
        }
      );
      message.push(
        `${firstname}'s infos were successfully updated ! Congrats!`
      );

      //Sends back updated or created member
      res.json({
        success: true,
        message,
        error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.editPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { password } = req.body;

    const error = [];
    let message = [];

    if (isNaN(id)) {
      error.push('"id" must be a number.');
    }

    // checks if all inputs contain something
    if (!password) {
      error.push('All fields must contain something.');
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

    if (!error.length) {
      const searchedMember = await Member.findByPk(id);
      if (!searchedMember) {
        error.push(`This member doesn't exist`);
      } else {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const updatedMember = await Member.update(
          {
            password: encryptedPassword,
          },
          {
            where: {
              id: searchedMember.dataValues.id,
            },
          }
        );
        message.push(
          `${searchedMember.firstname}'s password was successfully updated ! Congrats!`
        );
      }

      //Sends back updated or created member
      res.json({
        success: true,
        message,
        error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.tokenData;
    let { firstname, email, password, color, role: userRole } = req.body;

    // checks if all inputs contain something
    if (!firstname || !email || !password || !color || !userRole) {
      return res.status(403).json({
        success: false,
        userError: 'All fields must contain something.',
      });
    }

    // cleans body elements
    firstname = firstname.trim();
    email = email.trim();
    password = password.trim();

    //
    if (isNaN(userRole)) {
      return res.status(403).json({
        success: false,
        userError: '"role" must be a number.',
      });
    }

    // checks if valid email
    if (!emailValidator.validate(email)) {
      return res.status(403).json({
        success: false,
        userError: 'Email not valid.',
      });
    }
    // checks if password have more than 8 character, one uppercase letter, one lowercase letter, one special case letter and one digit.
    const regexPassword =
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*([\d]){1})((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/g;
    const passwordValidation = regexPassword.test(password);
    if (!passwordValidation) {
      return res.status(403).json({
        success: false,
        userError:
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
        userError: 'This user already exists',
      });
    }

    // password encryption
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // add member to database
    const newMember = await Member.create({
      firstname,
      email: email.toLowerCase(),
      password: encryptedPassword,
      color,
      role: userRole,
      id_group: groupId,
    });

    //Sends back created member
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(403).json({
      success: false,
    });
  }
};

exports.changeGroupName = async (req, res) => {
  try {
    const { groupId } = req.tokenData;
    const { groupName } = req.body;
    const error = [];
    let updated = false;

    if (!groupName) {
      error.push('No valid group name was entered');
    }

    if (!error.length) {
      const groupUpdate = await Group.update(
        {
          name: groupName,
        },
        {
          where: {
            id: groupId,
          },
        }
      );
      if (groupUpdate) {
        updated = true;
      }
    }
    res.json({
      success: true,
      error,
      updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const { role, idMember, groupId } = req.tokenData;
    let { id } = req.params;
    const error = [];
    let message = [];

    //
    if (isNaN(id)) {
      error.push('"id" must be a number.');
    }

    if (!error.length) {
      const deletedMember = await Member.destroy({
        where: {
          id,
        },
      });
      message.push(`You just deleted a member`);

      //Sends back created member
      res.json({
        success: true,
        message,
        error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
