const express = require('express');
const dashboardController = require('./controllers/dashboardController');
const settingsController = require('./controllers/settingsController');
const userController = require('./controllers/userController');
const widgetController = require('./controllers/widgetController');
const securityController = require('./controllers/securityController');

const router = express.Router();

// landing page
router.post('/signup', userController.createAdmin, userController.login);
router.post('/login', userController.login);

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
  '/all-widgets/:year/:month',
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
  '/dashboard/widgets/create',
  securityController.authorizationMiddleware,
  widgetController.createWidget
);
router.patch(
  '/update-widget/:id',
  securityController.authorizationMiddleware,
  widgetController.updateWidget
);
router.delete(
  '/delete-widget/:id',
  securityController.authorizationMiddleware,
  widgetController.deleteWidget
);

// edit settings admin only
router.get(
  '/group-infos',
  securityController.authorizationMiddleware,
  // securityController.adminChecker,
  settingsController.getgroupInfo
);
router.post(
  '/group-settings',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.addMember
);

router.patch(
  '/group-settings/group',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.changeGroupName
);

router.patch(
  '/group-settings/members',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.editGroupData
);

router.patch(
  '/group-settings/member/password',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.editPassword
);

router.delete(
  '/group-settings/member/delete/:id',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.deleteMember
);

router.patch('/:group/group-settings');
router.delete('/:group/group-settings');

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
