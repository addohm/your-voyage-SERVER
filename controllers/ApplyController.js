import { create } from "./functions.js"

export const applyForCoaching = async (req, res) => {
    const created = await create({ createObj: req.body, col: req.body.type })
    res.json(created)
}