import { create, readAll, find } from "./functions.js"

export const addPost = async (req, res) => {
    const created = await create({ createObj: req.body, col: req.body.type })
    res.json(created)
}

export const getPosts = async (req, res) => {
    const posts = await readAll({ col: req.body.type })
    res.json(posts)
}

export const getPost = async (req, res) => {
    const post = await find({ col: req.body.type, query: { _id: req.body._id } })
    res.json(post[0])
}