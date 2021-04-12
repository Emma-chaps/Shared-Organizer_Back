const Group = require('../models/Group');
const Member = require('../models/Member');

exports.createAdmin = async (req, res, next) => {
  const { groupName, firstname, email, password, icon } = req.body;
  const role = 3;
  if (!groupName) {
    throw new Error('No group name was given.');
  }

  try {
    // checks if member already exists
    const searchedMember = await Member.findOne({
      where: {
        email,
      },
    });
    // if the member already exists, send back member
    if (searchedMember) {
      res.json({
        member: searchedMember,
        created: false,
      });
    } else {
      // admin creation
      const admin = await Member.create({
        firstname,
        email,
        password,
        icon,
        role,
      });
      console.log(admin);
      //group creation
      const group = await Group.create({
        name: groupName,
      });
      res.json({
        member: admin,
        group,
        created: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
