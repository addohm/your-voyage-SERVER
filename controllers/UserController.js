import mailer from "../utils/mailer.js"
import mailerButton from "../utils/mailerButton.js"
import redefineUserRole from "../utils/redefineUserRole.js"
import setUserRole from "../utils/setUserRole.js"
import { create, find, findOne, signToken, verifyToken } from "./functions.js"

// ! loginGoogle
export const loginGoogle = async (req, res) => {

    const { email } = req.body

    const users = await find({ col: "users", query: { email } })
    let token
    let user

    if (users.length === 0) { // no user => create
        const role = setUserRole(email)
        user = await create({ col: "users", createObj: { ...req.body, role } })
        const userId = user._id.toString()
        await addSupportRoomOnUserCreation({ role, userId })
        await subscribeUserToNewsletterOnUserCreation({ userId, email })
        token = await signToken(userId)
    } else { // user exists
        user = users[0]
        const userId = user._id.toString()
        token = await signToken(userId)
    }

    res.json({ ok: true, token, user })
}

// ! loginSendEmail
export const loginSendEmail = async (req, res) => {

    const { email } = req.body

    // register user, BUT DON'T SEND userInfo to client, as user have to click "verify" in email
    const foundUser = await find({ col: "users", query: { email } })
    let user
    if (foundUser.length === 0) { // no user => create
        const role = setUserRole(email)
        const name = email.split("@")[0] // users that logged WITHOUT google have no name
        user = await create({ col: "users", createObj: { ...req.body, role, name } })
        const userId = user._id.toString()
        await addSupportRoomOnUserCreation({ role, userId })
        await subscribeUserToNewsletterOnUserCreation({ userId, email })
    } else { // user exists
        user = foundUser[0]
    }

    // send token to email: * user gets email, clicks "verify", token written to localStorage, reload page (user authed by autoAuth)
    const userId = user._id.toString()
    const token = await signToken(userId)

    mailer({
        email,
        attachments: [{ filename: 'image1.png', path: './utils/img/logo2.png', contentType: 'image/png', cid: "logo2" }],
        subject: `To login to ${process.env.CLIENT_URL.replace("https://www.", "")}, confirm your email`,
        html: `
            <head>
            	<link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
            </head>
            <img src='cid:logo2' />
            <div style="width: fit-content;">
            	<h2 style="width: 100%">Please confirm your email</h2>
                <div style="width: 100%">
            	${mailerButton({ href: process.env.CLIENT_URL + "/verifyLoginToken/" + token, text: "CONFIRM EMAIL" })}
                </div>
            </div>
        `})

    res.json({ ok: true })
}

async function addSupportRoomOnUserCreation({ role, userId }) {
    if (role !== "user") return
    await create({ col: "support", createObj: { room: userId, userId, type: "support" } })
}

async function subscribeUserToNewsletterOnUserCreation({ userId, email }) {
    await create({ col: "newsletter", createObj: { userId, email, type: "newsletter" } })
}

// ! autoAuth
export const autoAuth = async (req, res) => {

    const { token } = req.body
    if (!token) return

    const userId = await verifyToken(token)
    let user = await find({ col: "users", query: { _id: userId } })
    user = user?.[0]

    if (!user) return res.json({})

    const userEmail = user?.email
    const userRole = user?.role
    const redefinedUserRole = await redefineUserRole({ userEmail, userRole }) // redefine for FRONT-END
    user.role = redefinedUserRole

    res.json({ ok: true, user })
}