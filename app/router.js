const express = require('express');
const dashboardController = require('./controllers/dashboardController');
const settingsController = require('./controllers/settingsController');
const userController = require('./controllers/userController');
const widgetController = require('./controllers/widgetController');

const router = express.Router();

// landing page
router.post('/signup', userController.createAdmin);
router.post('/login', userController.login);

// widgets according to calendar
router.get('/dashboard/widgets/:period');

// widget creation/update/delete
router.post(
  '/dashboard/widgets/create',
  userController.authorizationMiddleware,
  widgetController.createWidget,
);
router.patch('/:group/dashboard/widgets');
router.delete('/:group/dashboard/widgets');

// edit settings admin only
router.get(
  '/family-settings',
  userController.authorizationMiddleware,
  settingsController.getFamilyInfo,
);
router.patch('/:group/family-settings');
router.post('/:group/family-settings');
router.delete('/:group/family-settings');

//contact page
router.post('/contact');
router.get('/contact');

// about us
router.get('/about-us');

router.use((request, response) => {
  response.status(404).json({
    success: false,
    error: '⚠ Service does not exist !',
  });
});

module.exports = router;
