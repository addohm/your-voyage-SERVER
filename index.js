// npm i express dotenv mongoose cors nodemon jsonwebtoken

import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
process.env.NODE_ENV = 'production';

const app = express()
app.use(cors()) // enables api queries
app.use(express.json()) // enables req.body

const PORT = process.env.PORT || 5000
app.listen(PORT, err => err ? console.log(err) : console.log(`SERVER OK, PORT: ${PORT}`))
mongoose.connect(`mongodb+srv://enotowitch:qwerty123@cluster0.9tnodta.mongodb.net/yourVoyage?retryWrites=true&w=majority`)
    .then(console.log('DB OK')).catch(err => console.log('ERROR', err))

// ! ROUTES
// ! auth
import * as UserController from "./controllers/UserController.js"
app.post("/loginGoogle", UserController.loginGoogle)
app.post("/autoAuth", UserController.autoAuth)

// ! post
import * as PostController from "./controllers/PostController.js"
app.post("/addPost", PostController.addPost)
app.post("/editPost", PostController.editPost)
app.post("/getPosts", PostController.getPosts)
app.post("/getPost", PostController.getPost)

// ! applyForCoaching
import * as ApplyController from "./controllers/ApplyController.js"
app.post("/applyForCoaching", ApplyController.applyForCoaching)
// ? ROUTES

// ! MULTER
import multer from "multer"
import fs, { existsSync, unlinkSync } from "fs"

const uploadSiteContentPath = "upload/siteContent"

// Create storage configurations for the productImages folder
const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = uploadSiteContentPath
        if (!existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true })
        }
        cb(null, folderPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

// Create Multer instances with the respective storage configurations
const upload1 = multer({ storage: storage1 })

app.post("/" + uploadSiteContentPath, upload1.array("anyfile", 99), (req, res) => {
    const fileArr = req.files?.map((file) => `${process.env.SERVER_URL}/${uploadSiteContentPath}/${file.filename}`)
    res.json({ fileArr })
})

app.use("/" + uploadSiteContentPath, express.static(uploadSiteContentPath))

// ! delete img
app.post("/deleteImg", (req, res) => {
    const { imgName } = req.body
    if (existsSync(`${uploadSiteContentPath}/${imgName}`)) {
        unlinkSync(`${uploadSiteContentPath}/${imgName}`)
        res.json({ ok: true })
    } else {
        res.json({ ok: false })
    }
})
// ? MULTER