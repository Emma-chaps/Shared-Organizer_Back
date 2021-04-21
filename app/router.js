const express = require("express");
const dashboardController = require("./controllers/dashboardController");
const settingsController = require("./controllers/settingsController");
const userController = require("./controllers/userController");
const widgetController = require("./controllers/widgetController");
const securityController = require("./controllers/securityController");

const router = express.Router();

// landing page
router.post("/signup", userController.createAdmin);
router.post("/login", userController.login);

// dashboard get
router.get(
  "/dashboard/month/:monthNb",
  securityController.authorizationMiddleware,
  dashboardController.getAllWidgetFromMonth
);
router.get(
  "/dashboard/week/:weekNb",
  securityController.authorizationMiddleware,
  dashboardController.getAllWidgetFromWeek
);
router.get(
  "/dashboard/day/:dayNb",
  securityController.authorizationMiddleware,
  dashboardController.getAllWidgetFromDay
);

// widget creation/update/delete
router.post(
  "/dashboard/widgets/create",
  securityController.authorizationMiddleware,
  widgetController.createWidget
);
router.patch("/:group/dashboard/widgets");
router.delete("/:group/dashboard/widgets");

// edit settings admin only
router.get(
  "/family-settings",
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.getFamilyInfo
);
router.post(
  "/family-settings",
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.addMember
);

router.patch(
  "/family-settings/group",
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.changeGroupName
);

router.patch(
  "/family-settings/members",
  securityController.authorizationMiddleware,
  securityController.adminChecker,
  settingsController.editGroupData
);

router.patch("/:group/family-settings");
router.delete("/:group/family-settings");

//contact page
router.post("/contact");
router.get("/contact");

// about us
router.get("/about-us");

router.use((request, response) => {
  response.status(404).json({
    success: false,
    error: "⚠ Service does not exist !",
  });
});

module.exports = router;
