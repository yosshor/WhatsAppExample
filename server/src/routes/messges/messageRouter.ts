import express from "express";
import { getMessages, sendMessage } from "../../controllers/messages/messages";
 export const router = express.Router();

router
  .post('/messages',sendMessage)
  .get('/messages/:conversationId', getMessages);

  export default router;