const { Widget, Member } = require('../models');

exports.createWidget = async (req, res, next) => {
  try {
    const { role, groupId, firstname } = req.tokenData;
    let { title, description, dateNb, range, year, groupMembers } = req.body;

    // prevents children from creating widgets
    if (role < 2) {
      throw new Error('The user is not authorized to create a widget.');
    }

    //database required fields verification
    if (
      !title ||
      !dateNb ||
      !range ||
      !Array.isArray(groupMembers) ||
      !groupMembers.length ||
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
          `The value ${dateNb} is an invalid number for a ${range}.`
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

    // checks if range is valide
    const possibleRanges = ['month', 'week', 'day'];
    const isInPossibleRange = possibleRanges.includes(range);
    if (!isInPossibleRange) throw new Error('The range entered is not valid');

    // checks if members exist and delete password
    const attributedMembers = await Promise.all(
      groupMembers.map((searchedMember) => Member.findByPk(searchedMember.id))
    ).then((values) => {
      const membersFound = values.map((value) => {
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
          })
        );
        return widget;
      })
      .then(() => {
        res.status(200).json({
          success: true,
        });
      });
  } catch (error) {
    res.status(401).json({
      success: false,
    });
  }
};

exports.updateWidget = async (req, res, next) => {
  try {
    const { groupId, role } = req.tokenData;
    let { id } = req.params;
    const { title, description, groupMembers } = req.body;

    if (role < 2) {
      throw new Error('The user is not authorized to edit a widget.');
    }

    const numberChecker = (input) => {
      if (isNaN(Number(input))) {
        throw new Error(`The value ${input} is not a number.`);
      } else {
        return Number(input);
      }
    };
    id = numberChecker(id);

    if (groupMembers && !Array.isArray(groupMembers)) {
      throw new Error('The groupMembers array is not valid.');
    }
    let newMembersRaw = [];
    let newMembers = [];

    if (groupMembers.length) {
      newMembers = await Promise.all(
        groupMembers.map((member) => Member.findByPk(member.id))
      ).then((values) => {
        newMembersRaw = values;
        const membersFound = values.map((value) => {
          delete value.dataValues.password;
          return value.dataValues;
        });
        return membersFound;
      });
    }
    if (!newMembers.length) {
      throw new Error('No member was assigned to the widget');
    }

    const searchedWidgetRaw = await Widget.update(
      {
        title,
        description,
      },
      {
        where: {
          id,
          id_group: groupId,
        },
      }
    ).then(() => Widget.findByPk(id, { include: 'members' }));

    const searchedWidget = searchedWidgetRaw.dataValues;

    const widgetMembersIds = searchedWidget.members.map(
      (member) => member.dataValues.id
    );

    const widgetWithoutMembers = await Promise.all(
      widgetMembersIds.map((id) => {
        searchedWidgetRaw.removeMember(id);
      })
    )
      .then(() => Widget.findByPk(id, { include: 'members' }))
      .then((data) => data);

    const widgetWithNewMembers = await Promise.all(
      newMembers.map((member) => {
        searchedWidgetRaw.addMember(member.id);
      })
    )
      .then(() => Widget.findByPk(id, { include: 'members' }))
      .then((data) => data)

      .then(() => {
        res.json({
          success: true,
        });
      });

    // .then((value) => value.dataValues)
    // .then((widget) => {
    //   Promise.all(
    //     newMembers.map((member) => {
    //       widget.addMember(member.id);
    //     })
    //   );
    //   return widget;
    // })
    // .then((widget) => {
    //   //sends back json if all is ok
    //   res.json({
    //     success: true,
    //   });
    // });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteWidget = (req, res, next) => {
  try {
    let { id } = req.params;

    if (isNaN(Number(id))) {
      return res.status(403).json({
        success: false,
        error: 'All fields must contain something',
      });
    } else {
      id = Number(id);
    }

    Widget.destroy({
      where: {
        id,
      },
    }).then(() =>
      res.status(200).json({
        success: true,
      })
    );
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
