import mailer from "../utils/mailer.js"
import mailerButton from "../utils/mailerButton.js"
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
    user.role = req.user.role // add user role (from whoCanPass middleware)

    res.json({ ok: true, user })
}

// ! loginSendEmail
export const loginSendEmail = async (req, res) => {

    const { email } = req.body

    // register user, BUT DON'T SEND userInfo to client, as user have to click "verify" in email
    const foundUser = await find({ col: "users", query: { email } })
    let user
    if (foundUser.length === 0) {
        user = await create({ col: "users", createObj: req.body })
    } else {
        user = foundUser[0]
    }

    // send token to email: * user gets email, clicks "verify", token written to localStorage, reload page (user authed by autoAuth)
    const userId = user._id.toString()
    const token = await signToken(userId)

    mailer(email, `To Login to ${process.env.CLIENT_URL.replace("https://www.", "")}, please Confirm Your Email`, `
    <head>
    	<link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet">
    </head>
    <div style="width: fit-content;">
    	<h1 style="width: 100%">Please confirm your email</h1>
    	<img width="300px" src="cid:confirmEmail.png" />
    	${mailerButton({ href: process.env.CLIENT_URL + "/verifyLoginToken/" + token, text: "CONFIRM EMAIL" })}
    </div>
    `)

    res.json({ ok: true })
}