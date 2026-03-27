const express = require("express");
const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const commentsRoutes = require("../modules/comments/comments.routes");
const blogsRoutes = require("../modules/blogs/blogs.routes");
const subscriberRoutes = require("../modules/subscriber/subscriber.routes");
const notificationsRoutes = require("../modules/notifications/notifications.routes");

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/comments",
    route: commentsRoutes,
  },
  {
    path: "/blogs",
    route: blogsRoutes,
  },
  {
    path: "/subscriptions",
    route: subscriberRoutes,
  },
  {
    path: "/notifications",
    route: notificationsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
