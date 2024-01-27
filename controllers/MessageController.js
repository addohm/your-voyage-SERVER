import { markAllMsgsAsRead } from "../utils/markAllMsgsAsRead.js"
import { _delete, find, update } from "./functions.js"

// ! getRooms
export const getRooms = async (req, res) => { // room = coaching (DB model)

    const { email } = req.user // email = userEmail

    let found
    if (req.user.role === "admin" || req.user.role === "coach") {
        // admin or coach
        const foundCourseIdsForThisCoach = await find({ col: "courses", query: { coachEmail: email }, filter: { courseId: 1 } })
        const foundCourseIds = foundCourseIdsForThisCoach?.map(course => String(course._id))
        const roomsForThisCoach = []
        for (let i = 0; i < foundCourseIds.length; i++) {
            roomsForThisCoach.push(await find({ col: "coaching", query: { courseId: foundCourseIds[i] }, filter: { email: 1, room: 1, courseName: 1, _id: 0 } }))
        }
        found = roomsForThisCoach.flat()
    } else {
        // user
        found = await find({ col: "coaching", query: { email }, filter: { email: 1, room: 1, courseName: 1, _id: 0 } }) // [{email, room},{...}...]
    }
    const foundEmails = found.map(found => found?.email) // [email,email,...]
    const foundRoomTokens = found.map(found => found.room) // [token,token,...]

    // foundInfo must = foundEmails.length => allow 1 coach to have many courses
    let foundInfo = []
    for (let i = 0; i < foundEmails.length; i++) {
        foundInfo.push(await find({ col: "users", query: { email: foundEmails[i] }, filter: { name: 1, img: 1, _id: 1 } }))
    }
    let allMessages = await find({ col: "messages", query: { room: { $in: foundRoomTokens } }, filter: { msg: 1, room: 1, updatedAt: 1, email: 1, isRead: 1, img: 1, _id: 0 } })
    const allMessagesReversed = [...allMessages].reverse()
    const lastMsgsArr = foundRoomTokens.map(token => allMessagesReversed.find(message => token === message.room && { msg: message.msg, room: message.room, createdAt: message.updatedAt, img: message.img }))
    const notReadMsgsArr = foundRoomTokens.map(token => allMessages.map(message => email !== message.email && message.isRead === false && token === message.room).filter(leaveOnlyTrue => leaveOnlyTrue))

    const foundInfoWithRoomToken = foundInfo.map((info, infoInd) => ({
        name: info?.[0]?.name,
        img: info?.[0]?.img,
        userId: info?.[0]?._id,
        room: found?.[infoInd]?.room,
        msg: lastMsgsArr?.[infoInd]?.msg,
        msgImg: lastMsgsArr?.[infoInd]?.img,
        createdAt: lastMsgsArr?.[infoInd]?.updatedAt,
        notReadNum: notReadMsgsArr?.[infoInd]?.length,
        isRead: lastMsgsArr?.[infoInd]?.isRead,
        courseName: found?.[infoInd]?.courseName
    }));

    // ! rewrite for user: in each Room user sees: coach img, coach name
    // coach sees: user img, user name
    if (req.user.role === "user") {
        const foundCoachInfoToDisplayInEachUserRoom = []
        for (let i = 0; i < found.length; i++) {
            foundCoachInfoToDisplayInEachUserRoom.push(await find({ col: "courses", query: { courseName: found[i]?.courseName }, filter: { coachName: 1, img: 1, _id: 0 } }))
        }

        foundInfoWithRoomToken.forEach((info, infoInd) => {
            info.name = foundCoachInfoToDisplayInEachUserRoom?.[infoInd]?.[0]?.coachName
            info.img = foundCoachInfoToDisplayInEachUserRoom?.[infoInd]?.[0]?.img
        })
    }

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
    let { token, limit } = req.body
    limit = limit || 10 // if no limit get "new messages" else get "old messages" (limit = 10/20/30/40...)
    const foundMessages = await find({ col: "messages", query: { room: token }, limit, sort: { createdAt: -1 } })
    foundMessages.reverse()
    res.json(foundMessages)
}

// ! editMessage
export const editMessage = async (req, res, next) => {

    const { _id, email, type, room, msg } = req.body
    if (email !== req.user.email) return

    const updated = await update({ col: type, filter: { _id }, update: { ...req.body, isUpdated: true, isRestored: false, isRead: false } })

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