import { create, find, update } from "./functions.js"

export const addCourse = async (req, res) => {

    let { coachEmail, _id, discountPrice } = req.body
    const foundCourse = await find({ col: "courses", query: { _id } })
    const foundUser = await find({ col: "users", query: { email: coachEmail } })
    const img = foundUser?.[0]?.img

    if (!foundCourse?.[0]) { // no course found => create course
        await create({ createObj: { ...req.body, img }, col: req.body.type })
    } else { // has course => update
        discountPrice = discountPrice === undefined ? "" : discountPrice // ability to delete discount
        await update({ update: { ...req.body, img, discountPrice }, col: req.body.type, filter: { _id } })
    }
}