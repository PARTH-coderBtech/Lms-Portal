import { Webhook } from "svix";
import User from "../models/user.js";

export const clerkWebhook = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const payload = req.body; // Assuming raw buffer, see note above
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        const evt = whook.verify(payload, headers);
        const { data, type } = evt;

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                };
                await User.create(userData);
                res.json({});
                return;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.json({});
                return;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                res.json({});
                return;
            }

            default:
                res.status(400).json({ success: false, message: "Unhandled event type" });
                return;
        }

    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
