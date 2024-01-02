import { _delete, find, update } from "./functions.js"

// ! getRooms
export const getRooms = async (req, res) => {

    const { email } = req.user

    let foundCoaches = await find({ col: "coaching", query: { email }, filter: { coachEmail: 1, roomToken: 1, _id: 0 } }) // [{email, roomToken},{...}...]
    const foundCoachesEmails = foundCoaches.map(coach => coach.coachEmail) // [email,email,...]
    const foundCoachesRoomTokens = foundCoaches.map(coach => coach.roomToken) // [token,token,...]

    const foundCoachesInfo = await find({ col: "users", query: { email: { $in: foundCoachesEmails } }, filter: { name: 1, img: 1, _id: 0 } }) // [{ name: 'google account coach name', img: 'https:// google account img' }, {...}]
    let eachRoomLastMsg = await find({ col: "messages", query: { room: { $in: foundCoachesRoomTokens } }, filter: { msg: 1, _id: 0 } })
    eachRoomLastMsg = eachRoomLastMsg[eachRoomLastMsg.length - 1]?.msg
    const foundCoachesInfoWithRoomToken = foundCoachesInfo.map((coachInfo, ind) => ({ ...coachInfo, roomToken: foundCoaches?.[ind].roomToken, msg: eachRoomLastMsg }))

    // clear mongo info
    const roomsInfo = foundCoachesInfoWithRoomToken.map(coach => {
        delete coach?.['$__']
        delete coach?.['$isNew']
        delete coach?.['_doc']
        return coach
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