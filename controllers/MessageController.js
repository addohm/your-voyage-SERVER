import { find } from "./functions.js"

// ! getRooms
export const getRooms = async (req, res) => {

    const { email } = req.user

    let foundCoaches = await find({ col: "coaching", query: { email }, filter: { coachEmail: 1, roomToken: 1, _id: 0 } }) // [{email, roomToken},{...}...]
    const foundCoachesEmail = foundCoaches.map(coach => coach.coachEmail) // [email,email,...]

    const foundCoachesInfo = await find({ col: "users", query: { email: { $in: foundCoachesEmail } }, filter: { name: 1, img: 1, _id: 0 } }) // [{ name: 'google account coach name', img: 'https:// google account img' }, {...}]
    const foundCoachesInfoWithRoomToken = foundCoachesInfo.map((coachInfo, ind) => ({ ...coachInfo, roomToken: foundCoaches?.[ind].roomToken }))

    // clear mongo info
    const roomsInfo = foundCoachesInfoWithRoomToken.map(coach => {
        delete coach?.['$__']
        delete coach?.['$isNew']
        delete coach?.['_doc']
        return coach
    })

    res.json(roomsInfo)
}