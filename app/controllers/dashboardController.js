const { Member, Group, Widget } = require('../models');
const {
  getDayOfYear,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  getWeek,
} = require('date-fns');
const { Op } = require('sequelize');

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

exports.getAllWidgets = async (req, res, next) => {
  try {
    const { groupId } = req.tokenData;
    let { year, month } = req.params;

    //database required fields verification
    if (!year) throw new Error('No year was provided.');
    if (!month) throw new Error('No month was provided.');

    const numberChecker = (input) => {
      if (isNaN(Number(input))) {
        throw new Error(`The value ${input} is not a number.`);
      } else {
        return Number(input);
      }
    };
    year = numberChecker(year);
    month = numberChecker(month);

    //first of the month
    const monthStartDate = startOfMonth(new Date(year, month - 1));
    //last day of the month
    const monthEndDate = endOfMonth(new Date(year, month - 1));
    //weeks contained in month
    const weeksInMonth = eachWeekOfInterval({
      start: monthStartDate,
      end: monthEndDate,
    });
    const weekNumbers = weeksInMonth.map((week) => getWeek(week));
    //day number of first of the month
    const rangeStartDayNb = getDayOfYear(monthStartDate);
    //number of days in the month
    const numberOfDaysInMonth = getDaysInMonth(monthStartDate);
    const dateContainer = new Array(numberOfDaysInMonth).fill(undefined);
    const dayNumbers = dateContainer.map(
      (element, index) => rangeStartDayNb + index,
    );

    const searchedDayWidgets = await Promise.all(
      dayNumbers.map((day) =>
        Widget.findAll({
          where: {
            year,
            range: 'day',
            date_nb: day,
            id_group: groupId,
          },
          include: 'members',
          order: [['created_at', 'DESC']],
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

    let searchedDayWidgetsClean = [];
    if (searchedDayWidgets.length) {
      searchedDayWidgetsClean = searchedDayWidgets.reduce(
        (accumulator, current) => [...accumulator, ...current],
      );
    }

    const searchedWeekWidgets = await Promise.all(
      weekNumbers.map((week) =>
        Widget.findAll({
          where: {
            year,
            range: 'week',
            date_nb: Number(week),
            id_group: groupId,
          },
          include: 'members',
          order: [['created_at', 'DESC']],
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

    let searchedWeekWidgetsClean = [];
    if (searchedWeekWidgets.length) {
      searchedWeekWidgetsClean = searchedWeekWidgets.reduce(
        (accumulator, current) => [...accumulator, ...current],
      );
    }

    const searchedMonthWidgets = await Widget.findAll({
      where: {
        year,
        range: 'month',
        date_nb: month,
        id_group: groupId,
      },
      include: 'members',
      order: [['created_at', 'DESC']],
    }).then((rawWidgets) => rawWidgets.map((widget) => widget.dataValues));
    // .then((cleanWidgets) => console.log(cleanWidgets));

    const allSearchedWidgets = [
      ...searchedDayWidgetsClean,
      ...searchedWeekWidgetsClean,
      ...searchedMonthWidgets,
    ];

    res.json({
      success: true,
      widgets: allSearchedWidgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
