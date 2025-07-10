import { clerkClient } from "@clerk/express";

export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    // Check if userId is present
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user ID found." });
    }

    const response = await clerkClient.users.getUser(userId);

    // Check educator role
    if (response.publicMetadata.role !== "educator") {
      return res.status(403).json({ success: false, message: "Unauthorized Access" });
    }

    // Role is valid, proceed to next middleware or route
    next();

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
