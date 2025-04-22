    import { ChatController } from "./chatClass";

    const chatController = new ChatController();
    
    
    export const createNewChat = async (req: any, res: any) => {
    try {
      const { type, participants, name } = req.body;
      const chatId = await chatController.createChat(type, participants, name);
      res.status(201).json({ chatId });
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(500).json({ error: "Failed to create chat" });
    }
  };

  
