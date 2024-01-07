import { markAllMsgsAsRead } from "../utils/markAllMsgsAsRead.js"
import { _delete, find, update } from "./functions.js"

// ! getRooms
export const getRooms = async (req, res) => {

    const { email } = req.user // email = userEmail

    let query, queryEmail
    if (req.user.role === "admin" || req.user.role === "coach") {
        query = { coachEmail: email } // coach: query all coach's subscribers
        queryEmail = "email"
    } else {
        query = { email } // user query only his coaches
        queryEmail = "coachEmail"
    }

    let found = await find({ col: "coaching", query: { ...query }, filter: { [queryEmail]: 1, room: 1, _id: 0 } }) // [{email, room},{...}...]
    const foundEmails = found.map(found => found?.[queryEmail]) // [email,email,...]
    const foundRoomTokens = found.map(found => found.room) // [token,token,...]

    const foundInfo = await find({ col: "users", query: { email: { $in: foundEmails } }, filter: { name: 1, img: 1, _id: 0 } }) // [{ name: 'google account found name', img: 'https:// google account img' }, {...}]
    let allMessages = await find({ col: "messages", query: { room: { $in: foundRoomTokens } }, filter: { msg: 1, room: 1, updatedAt: 1, email: 1, isRead: 1, img: 1, _id: 0 } })
    const allMessagesReversed = [...allMessages].reverse()
    const lastMsgsArr = foundRoomTokens.map(token => allMessagesReversed.find(message => token === message.room && { msg: message.msg, room: message.room, createdAt: message.updatedAt, img: message.img }))
    const notReadMsgsArr = foundRoomTokens.map(token => allMessages.map(message => email !== message.email && message.isRead === false && token === message.room).filter(leaveOnlyTrue => leaveOnlyTrue))
    const foundInfoWithRoomToken = foundInfo.map((foundInfo, ind) => ({ ...foundInfo, room: found?.[ind]?.room, msg: lastMsgsArr?.[ind]?.msg, msgImg: lastMsgsArr?.[ind]?.img, createdAt: lastMsgsArr?.[ind]?.updatedAt, notReadNum: notReadMsgsArr?.[ind]?.length }))

    // clear mongo info
    const roomsInfo = foundInfoWithRoomToken.map(found => {
        delete found?.['$__']
        delete found?.['$isNew']
        delete found?.['_doc']
        return found
    })

    res.json(roomsInfo)
}

// ! getMessages
export const getMessages = async (req, res) => {
    const { token } = req.body
    const foundMessages = await find({ col: "messages", query: { room: token } })
    res.json(foundMessages)
}

// ! editMessage
export const editMessage = async (req, res, next) => {

    const { _id, email, type, room, msg } = req.body
    if (email !== req.user.email) return

    const updated = await update({ col: type, filter: { _id }, update: { ...req.body, isUpdated: true, isRestored: false } })

    // for update message
    req.email = email
    req.msg = msg // updated message
    req.room = room
    req._id = _id
    req.img = updated?.img
    req.updatedAt = updated?.updatedAt
    req.isUpdated = true
    req.isRestored = false
    next()
}

// ! deleteMessage
export const deleteMessage = async (req, res, next) => {
    const { _id, room, type, isRestoring } = req.body
    // isDeleted is opposite of isRestoring: if not restoring isDeleted = true, if restoring, isDeleted = false
    const isDeleted = !isRestoring
    const isRestored = isRestoring
    const deleted = await update({ col: type, filter: { _id }, update: { ...req.body, isDeleted, isRestored } })
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