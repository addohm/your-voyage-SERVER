import { create, find, verifyToken } from "./functions.js"

export const applyForCoaching = async (req, res) => {

    const { token } = req.body

    await verifyToken(token)
    const foundToken = await find({ col: "coaching", query: { token } })
    if (foundToken.length > 0) return // prevent writing order with same token

    const created = await create({ createObj: req.body, col: req.body.type })
    created && res.json({ msg: "Thank you for your Order!" })
}