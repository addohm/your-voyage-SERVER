import { markAllMsgsAsRead } from "../utils/markAllMsgsAsRead.js"
import { _delete, find, update } from "./functions.js"

// ! getMessages
export const getMessages = async (req, res) => {
    let { token, limit } = req.body
    limit = limit || 10 // if no limit get "new messages" else get "old messages" (limit = 10/20/30/40...)
    const foundMessages = await find({ col: "messages", query: { room: token }, limit, sort: { createdAt: -1 } })
    foundMessages.reverse()
    res.json(foundMessages)
}

// ! editMessage
export const editMessage = async (req, res, next) => {

    const { _id, userId, type, room, msg } = req.body
    if (userId !== req.user.id) return

    const updated = await update({ col: type, filter: { _id }, update: { ...req.body, isUpdated: true, isRestored: false, isRead: false } })

    // for update message
    req.userId = req.user.id
    req.msg = msg // updated message
    req.room = room
    req._id = _id
    req.img = updated?.img
    req.updatedAt = updated?.updatedAt
    req.isUpdated = true
    req.isRestored = false
    next()
}

// * both for deleteMessage and "restoreMessage"
// ! deleteMessage
export const deleteMessage = async (req, res, next) => {
    const { _id, room, type, isRestoring } = req.body
    // isDeleted is opposite of isRestoring: if not restoring isDeleted = true, if restoring, isDeleted = false
    const isDeleted = !isRestoring
    const isRestored = isRestoring
    const deleted = await update({ col: type, filter: { _id }, update: { ...req.body, isDeleted, isRestored, isRead: false } })
    res.json(deleted)

    // for delete/restore message
    req._id = _id
    req.room = room
    req.updatedAt = deleted?.updatedAt
    req.isDeleted = isDeleted
    req.isRestored = isRestored
    next()
}

export const markAllMessagesAsRead = async (req, res, next) => {
    // ! mark all messages as "isRead" for not this user (read all messages from another user, when RECEIVED THE MESSAGE)
    markAllMsgsAsRead(req.body)
}