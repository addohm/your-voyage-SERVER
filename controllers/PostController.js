import { create, readAll } from "./functions.js"

export const addPost = async (req, res) => {
    const created = await create({ createObj: req.body, col: req.body.type })
    res.json(created)
}

export const getPosts = async (req, res) => {
    const posts = await readAll({ col: req.body.type })
    res.json(posts)
}