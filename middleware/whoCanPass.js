import { find, verifyToken } from "../controllers/functions.js"

export const whoCanPass = async ({ req, res, next, role }) => {

    const token = req.headers.authorization
    const userId = await verifyToken(token)
    const foundUser = await find({ col: "users", query: { _id: userId } })
    const userEmail = foundUser[0]?.email

    // put user info in req
    const infoToStoreInReq = { id: userId, email: userEmail }
    if (userEmail === process.env.ADMIN_EMAIL || userEmail === process.env.ADMIN_EMAIL2) {
        req.user = {
            ...infoToStoreInReq,
            role: "admin"
        }
    } else {
        req.user = {
            ...infoToStoreInReq,
            role: "user"
        }
    }

    // prevent user from accessing admin routes
    if (role === "admin" && req.user.role !== "admin") {
        return res.json({ ok: false, msg: "you are not admin" })
    }
    next()
}