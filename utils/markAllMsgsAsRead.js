import { updateMany } from "../controllers/functions.js"

export const markAllMsgsAsRead = async (obj) => {
    const { room, userId } = obj
    await updateMany({ col: "messages", filter: { userId: { $ne: userId }, room }, update: { isRead: true } })
}