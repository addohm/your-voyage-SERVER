import { create, update, readAll, find, _delete, createMany } from "./functions.js"

export const addPost = async (req, res) => {
    const created = await create({ createObj: req.body, col: req.body.type })
    res.json(created)
}

export const editPost = async (req, res) => {
    const updated = await update({ col: req.body.type, filter: { _id: req.body.id }, update: req.body })
    res.json(updated)
}

export const deletePost = async (req, res) => {
    const deleted = await _delete({ col: req.body.type, query: { _id: req.body.id } })
    res.json(deleted)
}

export const getPosts = async (req, res) => {
    const { type, lang, sort } = req.body
    const posts = await find({ col: type, query: { lang }, sort })
    res.json(posts)
}

export const getPost = async (req, res) => {
    const { type, ...reqBodyWithoutType } = req.body
    const post = await find({ col: req.body.type, query: { ...reqBodyWithoutType } })
    res.json(post[0]) // {}
}

export const addPosts = async (req, res) => {
    const posts = await createMany({ reqBody: req.body })
    res.json(posts)
}