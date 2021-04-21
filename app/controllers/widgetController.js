const { Widget, Label, Field, Member } = require('../models');

exports.createWidget = async (req, res, next) => {
  try {
    const { role, idMember, groupId, firstname } = req.tokenData;
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

    const attributedMembers = await Promise.all(
      familyMembers.map((searchedMember) => Member.findByPk(searchedMember.id)),
    ).then((values) => {
      membersFound = values.map((value) => {
        delete value.dataValues.password;
        return value.dataValues;
      });
      return membersFound;
    });

    //widget creation
    Widget.create({
      title,
      description,
      date_nb: dateNb,
      year,
      range,
      author: firstname,
      id_group: groupId,
    })
      .then((widget) => {
        Promise.all(
          attributedMembers.map((attributedMember) => {
            widget.addMember(attributedMember.id);
          }),
        );
        return widget;
      })
      .then((widget) => {
        //sends back json if all is ok
        res.json({
          success: true,
          widget: {
            infos: widget,
            attributedMembers,
          },
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
