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
mongoose.connect(`mongodb+srv://enotowitch:qwerty123@cluster0.9tnodta.mongodb.net/luplanner?retryWrites=true&w=majority`)
    .then(console.log('DB OK')).catch(err => console.log('ERROR', err))

// !! ROUTES

// ! auth
import * as UserController from "./controllers/UserController.js"
app.post("/loginGoogle", UserController.loginGoogle)
app.post("/autoAuth", UserController.autoAuth)