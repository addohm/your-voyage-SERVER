import { find } from "./functions.js"

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
            // coaching !!!
            roomsForThisCoach.push(await find({ col: "coaching", query: { courseId: foundCourseIds[i] }, filter: { userId: 1, room: 1, courseName: 1, _id: 0 } }))
        }
        found = roomsForThisCoach.flat()
    } else {
        // user
        // coaching !!!
        found = await find({ col: "coaching", query: { userId: req.user.id }, filter: { userId: 1, room: 1, courseName: 1, _id: 0 } }) // [{userId, room},{...}...]
    }

    res.json(await processRooms({ req, found }))
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

    res.json(await processRooms({ req, found }))
}

// ! processRooms
async function processRooms({ req, found }) {
    const foundUserIds = found.map(found => found?.userId) // [userId,userId,...]
    const foundRoomTokens = found.map(found => found.room) // [token,token,...]

    // foundInfo must = foundUserIds.length => allow 1 coach to have many courses
    let foundInfo = []
    for (let i = 0; i < foundUserIds.length; i++) {
        foundInfo.push(await find({ col: "users", query: { _id: foundUserIds[i] }, filter: { name: 1, img: 1, _id: 1 } }))
    }
    
    let allMessages = await find({ col: "messages", query: { room: { $in: foundRoomTokens } }, filter: { msg: 1, room: 1, updatedAt: 1, userId: 1, isRead: 1, img: 1, _id: 0 } })
    const allMessagesReversed = [...allMessages].reverse()
    const lastMsgsArr = foundRoomTokens.map(token => allMessagesReversed.find(message => token === message.room && { msg: message.msg, room: message.room, createdAt: message.updatedAt, img: message.img }))
    const notReadMsgsArr = foundRoomTokens.map(token => allMessages.map(message => req.user.id !== message.userId && message.isRead === false && token === message.room).filter(leaveOnlyTrue => leaveOnlyTrue))

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

    return roomsInfo
}