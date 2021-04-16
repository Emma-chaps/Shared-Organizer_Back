const { Member, Group } = require('../models');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

exports.getFamilyInfo = async (req, res, next) => {
  try {
    //Info from token
    const { role, idMember, groupId } = req.tokenData;

    // gets group and associated members
    const group = await Group.findOne({
      where: {
        id: groupId,
      },
      include: 'members',
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
    let { firstname, email, password, icon, role: roleNewUser } = req.body;

    let error = [];
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

    if (!error.length) {
      const searchedMember = await Member.findOne({
        where: {
          email,
        },
      });
      if (!searchedMember) {
        // password encryption
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        const newMember = await Member.create({
          firstname,
          email,
          password: encryptedPassword,
          icon,
          role: roleNewUser,
          id_group: groupId,
        });
        message.push(
          `You just added ${newMember.firstname} to the family! Mazel Tov!`,
        );
      } else {
        const updatedMember = await Member.update(
          {
            firstname,
            email,
            password,
            icon,
            role: roleNewUser,
          },
          {
            where: {
              id: searchedMember.dataValues.id,
            },
          },
        );
        message.push(
          `${firstname}'s infos were successfully updated ! Congrats!`,
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
