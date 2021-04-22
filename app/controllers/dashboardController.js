const { Member, Group, Widget } = require('../models');

exports.getWidgets = async (req, res, next) => {
  try {
    let { range, dateNb, year } = req.params;
    const error = [];
    let searchedWidgets = null;
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

    if (!error.length) {
      searchedWidgets = await Widget.findAll({
        where: {
          range,
          date_nb: dateNb,
          year,
        },
      });
    }

    res.json({
      success: true,
      error,
      widget: searchedWidgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
