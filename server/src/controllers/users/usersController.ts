import { ChatController } from "../chat/chatClass";

const chatController = new ChatController();

export const getUserChats = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // Check if the user is requesting their own chats
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access other user's chats" });
    }

    const chats = await chatController.getUserChats(userId);
    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({ error: "Failed to get user chats" });
  }
};
