import { create, find, update } from "./functions.js"

export const addCourse = async (req, res) => {

    const { coachEmail, _id } = req.body
    const foundCourse = await find({ col: "courses", query: { _id } })

    if (!foundCourse?.[0]) { // no course found => create course
        const foundUser = await find({ col: "users", query: { email: coachEmail } })
        const img = foundUser?.[0]?.img

        await create({ createObj: { ...req.body, img }, col: req.body.type })
    } else { // has course => update
        await update({ update: { ...req.body }, col: req.body.type, filter: { _id } })
    }
}