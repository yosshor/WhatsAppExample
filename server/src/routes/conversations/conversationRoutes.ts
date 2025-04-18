import express from "express";
import conversationService from "../../controllers/conversation/conversationController";
const router = express.Router();

router
    .post("/conversations", async (req, res) => {
        try {
            const { participants, type, name } = req.body;
            const conversationId = await conversationService.createConversation(participants, type, name);
            res.json({ conversationId });
        } catch (error) {
            res.status(500).json({ error: "Failed to create conversation" });
        }
    })
    .get("/conversations/:userId", async (req, res) => {
        try {
            const conversations = await conversationService.getUserConversations(req.params.userId);
            res.json(conversations);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch conversations" });
        }
    })
    .get("/conversations/:conversationId/messages", async (req, res) => {
        try {
            const messages = await conversationService.getMessages(req.params.conversationId);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch messages" });
        }
    })
    .post("/conversations/:conversationId/messages", async (req, res) => {
        try {
            const { senderId, content, type } = req.body;
            const messageId = await conversationService.sendMessage(
                req.params.conversationId,
                senderId,
                content,
                type
            );
            res.json({ messageId });
        } catch (error) {
            res.status(500).json({ error: "Failed to send message" });
        }
    });

export default router; 