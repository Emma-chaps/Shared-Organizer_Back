const { Member, Group, Widget } = require('../models');

exports.getWidgets = async (req, res, next) => {
  try {
    const { groupId } = req.tokenData;
    let { range, dateNb, year } = req.params;
    //database required fields verification
    if (!dateNb || !range || !year)
      throw new Error('Some required fields are invalid.');

    const numberChecker = (input) => {
      if (isNaN(Number(input))) {
        throw new Error(`The value ${input} is not a number.`);
      } else {
        return Number(input);
      }
    };
    dateNb = numberChecker(dateNb);
    year = numberChecker(year);

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

    const searchedWidgets = await Widget.findAll({
      where: {
        range,
        date_nb: dateNb,
        id_group: groupId,
        year,
      },
      include: 'members',
    });
    const members = searchedWidgets.map((widget) =>
      widget.dataValues.members.map((member) => {
        delete member.dataValues.password;
        delete member.dataValues.member_widget;
        return member.dataValues;
      }),
    );
    const widgets = searchedWidgets.map((widget, index) => {
      widget.dataValues.members = members[index];
      return widget.dataValues;
    });
    console.log('widgets:', widgets);

    res.json({
      success: true,
      widgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getDayWidgetsFromRange = async (req, res, next) => {
  try {
    const { groupId } = req.tokenData;
    let { year } = req.params;
    const { dayNumbers } = req.body;

    //database required fields verification
    if (!year) throw new Error('No year was provided.');

    if (!dayNumbers.length) throw new Error('No days were provided.');

    const numberChecker = (input) => {
      if (isNaN(Number(input))) {
        throw new Error(`The value ${input} is not a number.`);
      } else {
        return Number(input);
      }
    };
    year = numberChecker(year);
    //checks if days are numbers and valid range
    const validDays = dayNumbers.map((day) => numberChecker(day));
    const searchedWidgets = await Promise.all(
      validDays.map((day) =>
        Widget.findAll({
          where: {
            year,
            range: 'day',
            date_nb: day,
            id_group: groupId,
          },
        }),
      ),
    )
      .then((widgetDates) =>
        widgetDates.map((widgetDate) =>
          widgetDate.map((widget) => {
            return widget.dataValues;
          }),
        ),
      )
      .then((arrayDates) => arrayDates.filter((array) => array.length !== 0));
    const widgetsArray = searchedWidgets.reduce((accumulator, current) => [
      ...accumulator,
      ...current,
    ]);

    res.json({
      success: true,
      widgets: widgetsArray,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
