const { Widget, Label, Field, Member } = require('../models');

exports.createWidget = async (req, res, next) => {
  try {
    const { role, idMember, groupId } = req.tokenData;
    let { title, description, dateNb, range, year, familyMembers } = req.body;

    // prevents children from creating widgets
    if (role < 2) {
      throw new Error('Only the admin and the parents can create a widget.');
    }

    //database required fields verification
    if (
      !title ||
      !dateNb ||
      !range ||
      !Array.isArray(familyMembers) ||
      !familyMembers.length ||
      !year
    )
      throw new Error('Some required fields are invalid.');

    // // checks dateNb type
    // dateNb = Number(dateNb);
    // if (isNaN(dateNb)) {
    //   throw new Error('The date number (dateNb) entered is not a number.');
    // }
    // checks dateNb type

    //checks if value is a number
    const numberChecker = (input) => {
      if (isNaN(Number(input))) {
        throw new Error(`The value ${input} is not a number.`);
      } else {
        return Number(input);
      }
    };
    dateNb = numberChecker(dateNb);
    year = numberChecker(year);

    // checks if the date number corresponds to the range
    const rangeNumberChecker = (min, max) => {
      if (dateNb < min || dateNb > max) {
        throw new Error(
          `The value ${dateNb} is an invalid number for a ${range}.`,
        );
      }
    };
    switch (range) {
      case 'month': {
        rangeNumberChecker(1, 12);
        break;
      }
      case 'week': {
        rangeNumberChecker(1, 53);
        break;
      }
      case 'day': {
        rangeNumberChecker(1, 366);
        break;
      }
      default:
        break;
    }

    // checks if range is a month, week or day
    const possibleRanges = ['month', 'week', 'day'];
    const isInPossibleRange = possibleRanges.includes(range);
    if (!isInPossibleRange) throw new Error('The range entered is not valid');

    // get widget author
    // const widgetAuthor = await Member.findByPk(idMember);

    //widget creation
    const widget = await Widget.create({
      title,
      description,
      date_nb: dateNb,
      year,
      range,
      // author: widgetAuthor.dataValues.firstname,
      author: 'XXX',
      id_group: groupId,
    });

    //sends back json if all is ok
    res.json({
      success: true,
      widget,
      // author: widgetAuthor.dataValues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
