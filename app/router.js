const express = require('express');
const dashboardController = require('./controllers/dashboardController');
const settingsController = require('./controllers/settingsController');
const userController = require('./controllers/userController');
const widgetController = require('./controllers/widgetController');

const router = express.Router();

// landing page
router.post('/signup', userController.createAdmin);
router.post('/login', userController.login);
router.post('/logout');
router.post(
  '/test',
  userController.authorizationMiddleware,
  userController.test,
);

// widgets according to calendar
router.get('/:group/dashboard/day');
router.get('/:group/dashboard/week');
router.get('/:group/dashboard/month');

// wigets without date
router.get('/:group/dashboard/infos');

// wiget creation/update/delete
router.post('/:group/dashboard/widget');
router.patch('/:group/dashboard/widget');
router.delete('/:group/dashboard/widget');

// edit settings admin only
router.get('/:group/family-settings');
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
