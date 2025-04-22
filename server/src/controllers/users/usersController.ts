import { ChatController } from "../chat/chatClass";
import userChatService from "../userChatService/userChatService";

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

export const searchUser = async (req: any, res: any) => {
  try {
    const query = req.query.q as string;
    // console.log("query", req.query);
    if (!query) {
      return res.json([]);
    }
    const users = await userChatService.searchUsers(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to search users" });
  }
};

export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await userChatService.getAllUsers();
    res.json({ users: users });
  } catch (error) {
    res.status(500).json({ error: "Failed to get all users" });
  }
};

export const getUserById = async (req: any, res: any) => {
  try {
    const user = await userChatService.getUser(req.params.userId);
    res.json({ user: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user by id" });
  }
};

export const createTestUsers = async (req: any, res: any) => {
  try {
    const users = await userChatService.addTestUsers();
    res.json({ message: "Test users created successfully", users });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({
      error: "Failed to create test users",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const updateUserRole = async (req: any, res: any) => {
    try {
        const updatedUser = await userChatService.updateUser(req.params.userId, req.body);
        res.json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user role" });
    }
}

