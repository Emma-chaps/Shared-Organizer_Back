const express = require('express');
const dashboardController = require('./controllers/dashboardController');
const settingsController = require('./controllers/settingsController');
const userController = require('./controllers/userController');
const widgetController = require('./controllers/widgetController');
const securityController = require('./controllers/securityController');

const router = express.Router();

// landing page
router.post('/api/signup', userController.createAdmin, userController.login);
router.post('/api/login', userController.login);

router.get(
  '/renew-token',
  securityController.authorizationMiddleware,
  securityController.renewToken
);

// dashboard get all widgets from a specific range

// router.get(
//   '/dashboard/:year/:range/:dateNb',
//   securityController.authorizationMiddleware,
//   dashboardController.getWidgets,
// );

// IMPROVED
router.get(
  '/api/all-widgets/:year/:month',
  securityController.authorizationMiddleware,
  dashboardController.getAllWidgets
);

//dashboard get all day widgets from a specific month or week

// router.post(
//   '/dashboard/days/:year',
//   securityController.authorizationMiddleware,
//   dashboardController.getDayWidgetsFromRange,
// );

// widget creation/update/delete
router.post(
  '/api/dashboard/widgets/create',
  securityController.authorizationMiddleware,
  widgetController.createWidget
);
router.patch(
  '/api/update-widget/:id',
  securityController.authorizationMiddleware,
  widgetController.updateWidget
);
router.delete(
  '/api/delete-widget/:id',
  securityController.authorizationMiddleware,
  widgetController.deleteWidget
);

// edit settings admin only
router.get(
  '/api/group-infos',
  securityController.authorizationMiddleware,
  // securityController.adminChecker,
  settingsController.getgroupInfo
);
router.post(
  '/api/group-settings',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.addMember
);

router.patch(
  '/api/group-settings/group',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.changeGroupName
);

router.patch(
  '/api/group-settings/members',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.editGroupData
);

router.patch(
  '/api/group-settings/member/password',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.editPassword
);

router.delete(
  '/api/group-settings/member/delete/:id',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.deleteMember
);

router.patch('/api/:group/group-settings');
router.delete('/api/:group/group-settings');

//contact page
router.post('/api/contact');
router.get('/api/contact');

// about us
router.get('/api/about-us');

router.use((request, response) => {
  response.status(404).json({
    success: false,
    error: '⚠ Service does not exist !',
  });
});

module.exports = router;
