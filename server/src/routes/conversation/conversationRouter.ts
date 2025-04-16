import express from "express";
import { getConversation } from "../../controllers/conversation/conversation";

const router = express.Router();
    router.get("/conversation/:conversationId", getConversation);
    
export default router;
