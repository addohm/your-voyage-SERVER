import { updateMany } from "../controllers/functions.js"

export const markAllMsgsAsRead = async (obj) => {
    const { room, userEmail } = obj
    await updateMany({ col: "messages", filter: { email: { $ne: userEmail }, room }, update: { isRead: true } })
}