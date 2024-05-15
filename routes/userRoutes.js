import express from "express";
import { getAllUsers, login, register, logout, getMyProfile, changePassword, updateProfile, updateProfilePicture, forgetPassword, resetPassword, addToPlaylist, removeFromPlaylist, updateUserRole, deleteUser, deleteMyProfile } from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/getAllUsers").get(getAllUsers)
router.route("/register").post(singleUpload,register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/me").get(isAuthenticated,getMyProfile).delete(isAuthenticated,deleteMyProfile)
router.route("/changepassword").put(isAuthenticated,changePassword)
router.route("/updateprofile").put(isAuthenticated,updateProfile)
router.route("/updateprofilePicture").put(isAuthenticated,singleUpload,updateProfilePicture)
router.route("/forgetpassword").post(isAuthenticated,forgetPassword)
router.route("/resetpassword/:token").put(isAuthenticated,resetPassword)

router.route("/addtoplaylist").post(isAuthenticated,addToPlaylist)
router.route("/removefromplaylist").delete(isAuthenticated,removeFromPlaylist)

//admin routes
router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers)
router.route("/admin/user/:id").put(isAuthenticated,authorizeAdmin,updateUserRole).delete(isAuthenticated,authorizeAdmin,deleteUser)



export default router;