import { find, verifyToken } from "../controllers/functions.js"

export const whoCanPass = async ({ req, res, next, role }) => {

    const token = req.headers.authorization
    if (!token) return // ???

    const userId = await verifyToken(token)
    const foundUser = await find({ col: "users", query: { _id: userId } })
    const userEmail = foundUser[0]?.email
    const userRole = foundUser[0]?.role

    // put user info in req
    req.user = { id: userId, email: userEmail, role: userRole }

    // prevent user from accessing admin routes
    if (role === "admin" && req.user.role !== "admin") {
        return res.json({ ok: false, msg: "you are not admin" })
    }
    next()
}