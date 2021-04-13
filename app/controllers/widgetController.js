const { Group, Member } = require('../models');

exports.getWidgetsByDate = async (req, res, next) => {
  try {
    const { period } = req.params;
    console.log('period:', period);
  } catch (error) {
    console.log(error);
  }
};
