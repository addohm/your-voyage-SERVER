import { _delete, create, find, signToken, verifyToken } from "./functions.js"

// ! applyForCoaching
export const applyForCoaching = async (req, res) => {

    const { token, userId, courseId } = req.body
    await verifyToken(token) // if fails return

    const foundToken = await find({ col: "coaching", query: { token } })
    if (foundToken.length > 0) return // prevent writing order with same token

    const room = await signToken(userId + courseId) // make roomToken for messages
    await _delete({ query: { userId, courseId }, col: req.body.type }) // if user renews subscription => delete old subscription
    const created = await create({ createObj: { ...req.body, room }, col: req.body.type })
    created && res.json({ msg: "You have 30 days left. Thank you!" })
}

// ! checkSubscriptionForCoaching
export const checkSubscriptionForCoaching = async (req, res) => {

    const { type, room } = req.body

    if (type === "all") {
        // all checks if user has active subscription at all for at least one coaching
        const foundCoaching = await find({ col: "coaching", query: { userId: req.user.id } })

        if (foundCoaching.length === 0) {
            return res.json({ ok: false, msg: "No active subscriptions" })
        } else {
            return res.json({ ok: true, msg: "" })
        }
    }

    if (type === "one") {
        // one checks if user has active subscription for one EXACT coaching (using room prop)
        const foundCoaching = await find({ col: "coaching", query: { room, userId: req.user.id } })

        const coaching = foundCoaching?.[0]
        if (!coaching) return
        const { courseId, courseName } = coaching

        const subscriptionStartDate = coaching.updatedAt
        const subscriptionUnix = Date.parse(subscriptionStartDate) / 1000;
        const nowUnix = Math.floor(Date.now() / 1000)
        const is30daysPassed = nowUnix - subscriptionUnix > 2592000
        const daysLeft = Math.ceil((2592000 - (nowUnix - subscriptionUnix)) / 86400)
        const nextSubscriptionDate = new Date(Date.parse(subscriptionStartDate) + 2592000000).toLocaleDateString()

        if (!is30daysPassed) {
            return res.json({ ok: true, msg: "", daysLeft, nextSubscriptionDate })
        } else {
            return res.json({ ok: false, msg: "Your subscription has expired, renew it to continue", courseId, courseName })
        }
    }
}