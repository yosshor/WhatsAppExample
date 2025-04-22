import express from "express";
import userChatService from "../../controllers/userChatService/userChatService";
import { authenticateUser } from "../../middleware/auth";
import { getUserChats, searchUser, getAllUsers, getUserById, createTestUsers, updateUserRole } from "../../controllers/users/usersController";
const router = express.Router();



// Get user's chats
router.get("/user/:userId", authenticateUser, getUserChats)

router.get("/users/search", searchUser)
      .get("/users/all", getAllUsers)
      .get("/users/:userId", getUserById)
      .put("/updateUserRole/:userId", updateUserRole)
      .post("/users/create-test", createTestUsers);

export default router;
