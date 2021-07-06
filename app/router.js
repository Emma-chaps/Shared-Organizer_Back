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

// router.get(
//   '/renew-token',
//   securityController.authorizationMiddleware,
//   securityController.renewToken
// );

// edit settings admin only
router.get(
  '/api/group',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.getgroupInfo
);

router.patch(
  '/api/group',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.changeGroupName
);

router.post(
  '/api/member',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.addMember
);

router.patch(
  '/api/member/:id',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.updateMember
);

router.patch(
  '/api/password/:id',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.editPassword
);

router.delete(
  '/api/member/:id',
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.deleteMember
);

// WIDGETS
router.get(
  '/api/widgets/:year/:month',
  securityController.authorizationMiddleware,
  dashboardController.getAllWidgets
);
router.post(
  '/api/widget',
  securityController.authorizationMiddleware,
  widgetController.createWidget
);
router.patch(
  '/api/widget/:id',
  securityController.authorizationMiddleware,
  widgetController.updateWidget
);
router.delete(
  '/api/widget/:id',
  securityController.authorizationMiddleware,
  widgetController.deleteWidget
);

router.use((request, response) => {
  response.status(404).json({
    success: false,
    error: '⚠ Service does not exist !',
  });
});

module.exports = router;
