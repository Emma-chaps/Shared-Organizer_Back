const { Widget, Label } = require('../models');

exports.createWidget = async (req, res, next) => {
  try {
    const { title, listStyle, description, color, date, labelId } = req.body;

    //database required fields verification
    if (!title || !labelId) throw new Error('title and labelId are required');

    //get associated label
    const dbLabel = await Label.findByPk(labelId);

    //widget creation
    const widget = await Widget.create({
      title,
      listStyle,
      description,
      color,
      date,
      id_label: dbLabel.id,
    });

    //sends back json if all is ok
    res.json({
      success: true,
      widget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
