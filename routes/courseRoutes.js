import express from "express";
import {
  addLectures,
  crearteCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import { isAuthenticated, authorizeAdmin, authorizeSubscriber } from "../middlewares/auth.js";

const router = express.Router();

//get all courses without lectures
router.route("/courses").get(getAllCourses);

//create new course - only admin
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, crearteCourse);

router
  .route("/course/:id")
  .get(isAuthenticated,authorizeSubscriber, getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLectures)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);

router
  .route("/lecture")
  .delete(isAuthenticated, authorizeAdmin, deleteLecture);

export default router;
