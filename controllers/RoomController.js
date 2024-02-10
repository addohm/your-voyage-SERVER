import { find } from "./functions.js"

// ! getRooms (getRoomsCourses)
export const getRooms = async (req, res) => { // room = coaching (DB model)

    const { email } = req.user // email = userEmail

    // ! found
    let found
    if (req.user.role === "admin" || req.user.role === "coach" || req.user.role === "support") {
        // admin or coach +support sees coach rooms even if he is support initially (admin can assign coach role to support)
        const foundCourseIdsForThisCoach = await find({ col: "courses", query: { coachEmail: email }, filter: { courseId: 1 } })
        const foundCourseIds = foundCourseIdsForThisCoach?.map(course => String(course._id))
        const roomsForThisCoach = []
        for (let i = 0; i < foundCourseIds.length; i++) {
            // coaching !!!
            roomsForThisCoach.push(await find({ col: "coaching", query: { courseId: foundCourseIds[i] }, filter: { userId: 1, room: 1, courseName: 1, _id: 0 } }))
        }
        found = roomsForThisCoach.flat()
    } else {
        // user
        // coaching !!!
        found = await find({ col: "coaching", query: { userId: req.user.id }, filter: { userId: 1, room: 1, courseName: 1, _id: 0 } }) // [{userId, room},{...}...]
    }

    // ! MUTATE GETROOMS
    // ! mutateRoomInfo
    async function mutateRoomInfo(foundInfoWithRoomToken) {
        // ! rewrite for user: in each Room user sees: coach img, coach name
        // coach sees: user img, user name
        if (req.user.role === "user") {
            const foundCoachInfoToDisplayInEachUserRoom = []
            for (let i = 0; i < found.length; i++) {
                foundCoachInfoToDisplayInEachUserRoom.push(await find({ col: "courses", query: { courseName: found[i]?.courseName }, filter: { coachName: 1, img: 1, _id: 0 } }))
            }

            foundInfoWithRoomToken.forEach((info, infoInd) => {
                info.coachName = foundCoachInfoToDisplayInEachUserRoom?.[infoInd]?.[0]?.coachName
                info.img = foundCoachInfoToDisplayInEachUserRoom?.[infoInd]?.[0]?.img
            })
        }
        // add type: needed for Snackbar Link: => /type<message||support>/msgId
        // fot all: user, admin, support
        foundInfoWithRoomToken.forEach((info, infoInd) => {
            info.type = "message"
        })
        return foundInfoWithRoomToken
    }
    // ? MUTATE GETROOMS

    res.json(await processRooms({ req, found, mutateRoomInfo }))
}

// ! getRoomsSupport
export const getRoomsSupport = async (req, res) => {

    let found
    if (req.user.role === "admin" || req.user.role === "support") {
        // admin or support
        found = await find({ col: "support", query: {}, filter: { userId: 1, room: 1, _id: 0 } })
    } else {
        // user
        found = await find({ col: "support", query: { userId: req.user.id }, filter: { userId: 1, room: 1, _id: 0 } }) // [{userId, room},{...}...]
    }

    // ! MUTATE GETROOMSSUPPORT
    // ! mutateRoomInfo
    async function mutateRoomInfo(foundInfoWithRoomToken) {
        // add type: needed for Snackbar Link: => /type<message||support>/msgId
        foundInfoWithRoomToken.forEach((info, infoInd) => {
            info.type = "support"
            info.courseName = "support"
        })
        return foundInfoWithRoomToken
    }
    // ? MUTATE GETROOMSSUPPORT

    res.json(await processRooms({ req, found, mutateRoomInfo }))
}

// ! processRooms
async function processRooms({ req, found, mutateRoomInfo }) {
    const foundUserIds = found.map(found => found?.userId) // [userId,userId,...]
    const foundRoomTokens = found.map(found => found.room) // [token,token,...]

    // foundInfo must = foundUserIds.length => allow 1 coach to have many courses
    let foundInfo = []
    for (let i = 0; i < foundUserIds.length; i++) {
        foundInfo.push(await find({ col: "users", query: { _id: foundUserIds[i] }, filter: { name: 1, img: 1, _id: 1 } }))
    }

    let allMessages = await find({ col: "messages", query: { room: { $in: foundRoomTokens } }, filter: { msg: 1, room: 1, updatedAt: 1, userId: 1, isRead: 1, img: 1, name: 1, _id: 0 } })
    const allMessagesReversed = [...allMessages].reverse()
    const lastMsgsArr = foundRoomTokens.map(token => allMessagesReversed.find(message => token === message.room && { msg: message.msg, room: message.room, createdAt: message.updatedAt, img: message.img }))
    const notReadMsgsArr = foundRoomTokens.map(token => allMessages.map(message => req.user.id !== message.userId && message.isRead === false && token === message.room).filter(leaveOnlyTrue => leaveOnlyTrue))

    let foundInfoWithRoomToken = foundInfo.map((info, infoInd) => ({
        name: info?.[0]?.name,
        senderName: lastMsgsArr?.[infoInd]?.name,
        img: info?.[0]?.img,
        userId: lastMsgsArr?.[infoInd]?.userId,
        room: found?.[infoInd]?.room,
        msg: lastMsgsArr?.[infoInd]?.msg,
        msgImg: lastMsgsArr?.[infoInd]?.img,
        createdAt: lastMsgsArr?.[infoInd]?.updatedAt,
        notReadNum: notReadMsgsArr?.[infoInd]?.length,
        isRead: lastMsgsArr?.[infoInd]?.isRead,
        courseName: found?.[infoInd]?.courseName
    }));

    if (mutateRoomInfo) {
        foundInfoWithRoomToken = await mutateRoomInfo(foundInfoWithRoomToken)
    }

    // clear mongo info
    const roomsInfo = foundInfoWithRoomToken.map(found => {
        delete found?.['$__']
        delete found?.['$isNew']
        delete found?.['_doc']
        return found
    })

    return roomsInfo
}