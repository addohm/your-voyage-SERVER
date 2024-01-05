// npm i express dotenv mongoose cors nodemon jsonwebtoken

import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'

const app = express()
app.use(cors()) // enables api queries
app.use(express.json()) // enables req.body

const PORT = process.env.PORT || 5000
app.listen(PORT, err => err ? console.log(err) : console.log(`SERVER OK, PORT: ${PORT}`))
mongoose.connect(process.env.MONGO_URL)
    .then(console.log('DB OK')).catch(err => console.log('ERROR', err))

// ! ROUTES
// ! auth
import * as UserController from "./controllers/UserController.js"
import { whoCanPass } from './middleware/whoCanPass.js'
app.post("/autoAuth", (req, res, next) => whoCanPass({ req, res, next, role: "user" }), UserController.autoAuth)
app.post("/loginGoogle", UserController.loginGoogle)
app.post("/loginSendEmail", UserController.loginSendEmail)

// ! post
import * as PostController from "./controllers/PostController.js"
app.post("/addPost", (req, res, next) => whoCanPass({ req, res, next, role: "admin" }), PostController.addPost)
app.post("/editPost", (req, res, next) => whoCanPass({ req, res, next, role: "admin" }), PostController.editPost)
app.post("/deletePost", (req, res, next) => whoCanPass({ req, res, next, role: "admin" }), PostController.deletePost)
app.post("/getPosts", PostController.getPosts)
app.post("/getPost", PostController.getPost)

// ! applyForCoaching
import * as ApplyController from "./controllers/ApplyController.js"
app.post("/applyForCoaching", ApplyController.applyForCoaching)
app.post("/checkSubscriptionForCoaching", (req, res, next) => whoCanPass({ req, res, next, role: "user" }), ApplyController.checkSubscriptionForCoaching)

// ! stripe
import * as StripeController from "./controllers/StripeController.js"
app.post("/create-checkout-session", StripeController.stripe)
// ? ROUTES

// ! MULTER
import multer from "multer"
import fs, { existsSync, unlinkSync } from "fs"

// Reusable function to configure Multer instance for upload
const configureMulter = (uploadPath) => {
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const folderPath = uploadPath;
                if (!existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }
                cb(null, folderPath);
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            },
        }),
    });
};

// Reusable function for handling file uploads
const handleFileUpload = (uploadPath) => (req, res) => {
    const fileArr = req.files?.map(
        (file) => `${process.env.SERVER_URL}/${uploadPath}/${file.filename}`
    );
    res.json({ fileArr });
};

// ===

// Upload for site content
const uploadSiteContentPath = "upload/siteContent";
const uploadSiteContent = configureMulter(uploadSiteContentPath);

app.post(
    `/${uploadSiteContentPath}`,
    uploadSiteContent.array("anyfile", 99),
    handleFileUpload(uploadSiteContentPath)
);

app.use(`/${uploadSiteContentPath}`, express.static(uploadSiteContentPath));

// Delete image
app.post("/deleteFile", (req, res) => {
    const { name } = req.body;
    const deletePath = `${uploadSiteContentPath}/${name}`;

    if (existsSync(deletePath)) {
        unlinkSync(deletePath);
        res.json({ ok: true });
    } else {
        res.json({ ok: false });
    }
});

// ! messages images
const uploadMsgContentPath = "upload/msgContent";
const uploadMsgContent = configureMulter(uploadMsgContentPath);

app.post(
    `/${uploadMsgContentPath}`,
    uploadMsgContent.array("anyfile", 99),
    handleFileUpload(uploadMsgContentPath)
);

app.use(`/${uploadMsgContentPath}`, express.static(uploadMsgContentPath));
// ? MULTER

// ! socket.io
import http from "http";
import { Server } from "socket.io";
import { create } from './controllers/functions.js'

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
    },
    path: '/socket.io'
});

const handleSendMessage = async (data) => {
    // ! addMessage to db
    const created = await create({ col: "messages", createObj: data });
    io.to(data.room).emit("receive_message", { ...data, _id: created._id, createdAt: created.createdAt }); // add id to socket (temp) message: for editing and deleting 
};

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // join room
    socket.on("join_room", (data) => {
        console.log("join_room", { data })
        socket.join(data);
    });

    // messages to room
    socket.on("send_message", (data) => {
        handleSendMessage(data);
    });
});

server.listen(PORT, () => { // https PORT
    console.log(`SOCKET SERVER IS RUNNING ON PORT: ${PORT}`);
});

// ! messages
import * as MessageController from "./controllers/MessageController.js"
app.post("/getRooms", (req, res, next) => whoCanPass({ req, res, next, role: "user" }), MessageController.getRooms)
app.post("/getMessages", (req, res, next) => whoCanPass({ req, res, next, role: "user" }), MessageController.getMessages)
app.post("/editMessage", (req, res, next) => whoCanPass({ req, res, next, role: "user" }), MessageController.editMessage, (req, res, next) => io.to(req.room).emit('edit_message', { email: req.email, msg: req.msg, room: req.room, _id: req._id, img: req.img, updatedAt: req.updatedAt, isUpdated: req.isUpdated, isRestored: req.isRestored }))
app.post("/deleteMessage", (req, res, next) => whoCanPass({ req, res, next, role: "user" }), MessageController.deleteMessage, (req, res, next) => io.to(req.room).emit('delete_message', { _id: req._id, updatedAt: req.updatedAt, isDeleted: req.isDeleted, isRestored: req.isRestored }))