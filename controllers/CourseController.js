import { create, find } from "./functions.js"

export const addCourse = async (req, res) => {
    const { coachEmail } = req.body
    const foundUser = await find({ col: "users", query: { email: coachEmail } })
    const img = foundUser?.[0]?.img

    const created = await create({ createObj: { ...req.body, img }, col: req.body.type })
    res.json(created)
}