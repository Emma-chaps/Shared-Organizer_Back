const { Widget, Label, Field, Member } = require('../models');

exports.createWidget = async (req, res, next) => {
  try {
    const { role, idMember, groupId } = req.tokenData;
    const {
      title,
      listStyle,
      description,
      color,
      date,
      labelId,
      fields,
    } = req.body;

    // prevents children from creating widgets
    if (role < 2) {
      throw new Error('Only the admin and the parents can create a widget.');
    }

    // if listStyle is empty, fields.length has to be O
    if (!listStyle && fields?.length) {
      throw new Error('The fields entered are not associated with a listStyle');
    }

    if (fields?.length) {
      //verifies that all required fields data is entered
      fields.forEach((field) => {
        if (!field.content) {
          throw new Error('Each field must contain acontent');
        }
        if (listStyle === 'checkbox' && field.checked !== false) {
          throw new Error(
            'The list-style is checkbox, therefore, all fields must be initialized at checked:false',
          );
        }
      });
    }

    //database required fields verification
    if (!title || !labelId) throw new Error('title and labelId are required');

    //get associated label
    const dbLabel = await Label.findByPk(labelId);

    // get widget author
    const widgetAuthor = await Member.findByPk(idMember);

    //widget creation
    const widget = await Widget.create({
      title,
      list_style: listStyle,
      description,
      color,
      date,
      author: widgetAuthor.dataValues.firstname,
      id_label: dbLabel.dataValues.id,
      id_group: groupId,
    });

    const dbfields = [];
    for (const field of fields) {
      const newField = await Field.create({
        description: field.content,
        checked: field.checked,
        id_widget: widget.id,
      });
      dbfields.push(newField);
    }

    //sends back json if all is ok
    res.json({
      success: true,
      widget,
      fields: dbfields,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
