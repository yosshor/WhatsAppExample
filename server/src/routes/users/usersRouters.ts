import express from "express";
import userChatService from "../../controllers/userChatService/userChatService";
const router = express.Router();

router
.get("/users/search", async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.json([]);
        }
        const users = await userChatService.searchUsers(query);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to search users" });
    }
})
.get("/users/:userId", (req, res) => userChatService.getUser(req.params.userId))
.put("/updateUserRole/:userId", (req, res) => userChatService.updateUser(req.params.userId, req.body))
.post("/users/create-test", async (req, res) => {
    try {
        console.log("Starting to create test users...");
        const users = await userChatService.addTestUsers();
        console.log("Successfully created users:", users);
        res.json({ message: "Test users created successfully", users });
    } catch (error) {
        console.error("Error creating test users:", error);
        res.status(500).json({ error: "Failed to create test users", 
            details: error instanceof Error ? error.message : 'Unknown error' });
    }
});

export default router;
