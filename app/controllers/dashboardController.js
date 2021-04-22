const { Member, Group, Widget } = require('../models');

// exports.getAllWidgetFromMonth = async (req, res, next) => {
//   try {
//     const { monthNb } = req.params;

//     const error = [];
//     let searchedWidgets = null;

//     if (isNaN(Number(monthNb)) || monthNb > 12 || monthNb < 1) {
//       error.push('The monthNb parameter is not valid');
//     }

//     if (!error.length) {
//       searchedWidgets = await Widget.findAll({
//         where: {
//           range: 'month',
//           date_nb: monthNb,
//         },
//       });
//     }

//     res.json({
//       success: true,
//       error,
//       monthNb,
//       monthlyWidget: searchedWidgets,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// exports.getAllWidgetFromWeek = async (req, res, next) => {
//   try {
//     const { weekNb } = req.params;

//     const error = [];
//     let searchedWidgets = null;

//     if (isNaN(Number(weekNb)) || weekNb > 53 || weekNb < 1) {
//       error.push('The weekNb parameter is not valid');
//     }

//     if (!error.length) {
//       searchedWidgets = await Widget.findAll({
//         where: {
//           range: 'week',
//           date_nb: weekNb,
//         },
//       });
//     }

//     res.json({
//       success: true,
//       error,
//       weekNb,
//       weeklyWidget: searchedWidgets,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// exports.getAllWidgetFromDay = async (req, res, next) => {
//   try {
//     const { dayNb } = req.params;

//     const error = [];
//     let searchedWidgets = null;

//     if (isNaN(Number(dayNb)) || dayNb > 366 || dayNb < 1) {
//       error.push('The dayNb parameter is not valid');
//     }

//     if (!error.length) {
//       searchedWidgets = await Widget.findAll({
//         where: {
//           range: 'day',
//           date_nb: dayNb,
//         },
//       });
//     }

//     res.json({
//       success: true,
//       error,
//       dayNb,
//       weeklyWidget: searchedWidgets,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

exports.getWidgets = async (req, res, next) => {
  try {
    let { range, dateNb, year } = req.params;
    const error = [];
    let searchedWidgets = null;
    console.log('XXXXXXXXXXXXXXXXXXXXXX');
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
