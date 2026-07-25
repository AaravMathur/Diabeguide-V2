import { Schema, model } from "mongoose";
const ReadingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true },
    meal: { type: String, required: true },
    timeOfDay: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
export const Reading = model("Reading", ReadingSchema);
