const { Member, Group } = require('../models');

exports.getFamilyInfo = async (req, res, next) => {
  try {
    //Info from token
    const { role, idMember, groupId } = req.tokenData;

    // gets group and associated members
    const group = await Group.find({
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
