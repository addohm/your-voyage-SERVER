import { createMany, find, update } from "./functions.js"

export const addCourse = async (req, res) => {

    let { coachEmail, discountPrice } = req.body
    const foundUser = await find({ col: "users", query: { email: coachEmail } })
    const img = foundUser?.[0]?.img
    req.body.img = img // add img to req.body
    discountPrice = discountPrice === undefined ? "" : discountPrice // ability to delete discount
    req.body.discountPrice = discountPrice // for updating

    createMany({ reqBody: req.body })
}