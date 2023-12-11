import { create, find, signToken, verifyToken } from "./functions.js"

// ! loginGoogle
export const loginGoogle = async (req, res) => {

    const { email } = req.body

    const users = await find({ col: "users", query: { email } })
    let token
    let user

    if (users.length === 0) { // no user => create
        user = await create({ col: "users", createObj: req.body })
        const userId = user._id.toString()
        token = await signToken(userId)
    } else { // user exists
        user = users[0]
        const userId = user._id.toString()
        token = await signToken(userId)
    }

    res.json({ ok: true, token, user })
}

// ! autoAuth
export const autoAuth = async (req, res) => {

    const { token } = req.body

    const userId = await verifyToken(token)
    let user = await find({ col: "users", query: { _id: userId } })
    user = user[0]

    res.json({ ok: true, user })
}