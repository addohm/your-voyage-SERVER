import { create, find, signToken, verifyToken } from "./functions.js"

// ! applyForCoaching
export const applyForCoaching = async (req, res) => {

    const { token, email, coachEmail, courseName } = req.body
    const room = await signToken(email + coachEmail + courseName) // make roomToken for messages

    await verifyToken(token)
    const foundToken = await find({ col: "coaching", query: { token } })
    if (foundToken.length > 0) return // prevent writing order with same token

    const created = await create({ createObj: { ...req.body, room }, col: req.body.type })
    created && res.json({ msg: "You have 30 days left. Thank you!" })
}

// ! checkSubscriptionForCoaching
export const checkSubscriptionForCoaching = async (req, res) => {

    const foundCoaching = await find({ col: "coaching", query: { email: req.user.email } })

    if (foundCoaching.length === 0) {
        return res.json({ ok: false, msg: "You don't have active subscription!" })
    }

    if (foundCoaching.length > 0) {
        const lastSubscriptionStartDate = foundCoaching[foundCoaching.length - 1].createdAt
        const lastSubscriptionUnix = Date.parse(lastSubscriptionStartDate) / 1000;
        const nowUnix = Math.floor(Date.now() / 1000)
        const is30daysPassed = nowUnix - lastSubscriptionUnix > 2592000
        const howManyDaysLeft = Math.ceil((2592000 - (nowUnix - lastSubscriptionUnix)) / 86400)
        const nextDateToContinueSubscription = new Date(Date.parse(lastSubscriptionStartDate) + 2592000000).toLocaleDateString()
        if (!is30daysPassed) {
            return res.json({ ok: true, msg: `Thank you for subscription! You have ${howManyDaysLeft} days left. Next subscription date: ${nextDateToContinueSubscription}` })
        } else {
            return res.json({ ok: false, msg: "Your subscription has expired" })
        }
    }
}