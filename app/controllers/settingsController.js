const { Member, Group } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

exports.getgroupInfo = async (req, res, next) => {
  try {
    //Info from token
    const { role, idMember, groupId } = req.tokenData;

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
    res.json({
      success: true,
      group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.editGroupData = async (req, res, next) => {
  try {
    const { role, idMember, groupId } = req.tokenData;
    let { id, firstname, email, icon, role: roleNewUser } = req.body;

    const error = [];
    let message = [];

    // cleans body elements
    firstname = firstname.trim();
    icon = icon.trim();

    if (isNaN(id)) {
      error.push('"id" must be a number.');
    }
    //
    if (isNaN(roleNewUser)) {
      error.push('"role" must be a number.');
    }

    // checks if all inputs contain something
    if (!firstname || !email || !icon) {
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
          icon,
          role: roleNewUser,
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
    const { role, idMember, groupId } = req.tokenData;
    let { id, password } = req.body;

    const error = [];
    let message = [];

    if (isNaN(id)) {
      error.push('"id" must be a number.');
    }

    // checks if all inputs contain something
    if (!password) {
      error.push('All fields must contain something.');
    }
    // checks if password have more than 8 character
    if (password.length < 6) {
      return res.json({
        success: false,
        error: 'Password must have 6 characters minimum.',
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

exports.addMember = async (req, res, next) => {
  try {
    const { role, idMember, groupId } = req.tokenData;
    let { firstname, email, password, icon, role: roleNewUser } = req.body;

    const error = [];
    let message = [];

    // cleans body elements
    firstname = firstname.trim();
    icon = icon.trim();

    //
    if (isNaN(roleNewUser)) {
      error.push('"role" must be a number.');
    }

    // checks if all inputs contain something
    if (!firstname || !email || !password || !icon) {
      error.push('All fields must contain something.');
    }

    // checks if valid email
    if (!emailValidator.validate(email)) {
      error.push('Email not valid.');
    }

    // checks if password have more than 8 character
    if (password.length < 6) {
      return res.json({
        success: false,
        error: 'Password must have 6 characters minimum.',
      });
    }

    if (!error.length) {
      // checks if member already exists
      const searchedMember = await Member.findOne({
        where: {
          email,
        },
      });
      // if the member already exists, send back member
      if (searchedMember) {
        return res.json({
          success: false,
          userError: 'This user already exists',
        });
      }

      // password encryption
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const newMember = await Member.create({
        firstname,
        email: email.toLowerCase(),
        password: encryptedPassword,
        icon,
        role: roleNewUser,
        id_group: groupId,
      });
      message.push(
        `You just added ${newMember.firstname} to the group! Mazel Tov!`
      );

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

exports.changeGroupName = async (req, res, next) => {
  try {
    const { role, idMember, groupId } = req.tokenData;
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
