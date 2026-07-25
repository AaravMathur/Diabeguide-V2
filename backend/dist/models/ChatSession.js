import { Schema, model } from "mongoose";
const MessageSchema = new Schema({
    text: { type: String, required: true },
    sender: { type: String, enum: ["user", "ai"], required: true },
    timestamp: { type: String, required: true }
});
const ChatSessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    messages: [MessageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export const ChatSession = model("ChatSession", ChatSessionSchema);
