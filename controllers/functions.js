import jwt from "jsonwebtoken"
// ! models
import createModel from "../models/createModel.js"
// * gray cause of eval
const users = createModel("users", { role: { type: String, default: "" }, hasPurchase: { type: Boolean, default: false } })
const tools = createModel("tools")
const books = createModel("books")
const news = createModel("news")
const coaching = createModel("coaching")
const terms = createModel("terms")
const privacy = createModel("privacy")
const messages = createModel("messages", { isRead: { type: Boolean, default: false } })
const courses = createModel("courses")
const faq = createModel("faq")
const support = createModel("support")
const newsletter = createModel("newsletter")
// ? models

// ! CRUD
// ! create
export const create = async ({ createObj, col }) => {
    // await new user({email})
    const doc = await eval(col)({ ...createObj })
    const saved = await doc.save()
    return saved // {_id: new ObjectId("123"), email: 'abc@gmail.com', ...}
}

// ! readAll
export const readAll = async ({ col, sort }) => {
    // await todo.find()
    const all = await eval(col).find().sort({ ...sort })
    return all // [{},{}...]
}

// ! update
export const update = async ({ col, filter, update }) => {
    // await todo.findOneAndUpdate({_id}, {position})
    const updated = await eval(col).findOneAndUpdate({ ...filter }, { ...update })
    return updated // {}
}

// ! updateMany
export const updateMany = async ({ col, filter, update }) => {
    const updated = await eval(col).updateMany({ ...filter }, { ...update })
    return updated // [{}, {}, ...]
}

// ! delete
export const _delete = async ({ col, query }) => {
    // await todo.findOneAndDelete({ _id })
    await eval(col).findOneAndDelete({ ...query })
}

// ! find
export const find = async ({ col, query, filter, sort, limit, skip }) => {
    // await find({ col: "todo", query: { when: "1/1/2000" }, filter: { coach: 1 } <(leave only "coach" field)>, sort: { position: 1 } })
    const find = await eval(col).find({ ...query }, { ...filter })?.sort({ ...sort })?.limit(limit)?.skip(skip)
    return find // [{},{}...]
}

export const createMany = async ({ reqBody }) => {
    const foundPosts = await find({ col: reqBody.type, query: { _id: reqBody._id } })
    if (!foundPosts?.[0]) { // no post found => CREATE POST
        await create({ createObj: { ...reqBody }, col: reqBody.type })
    } else { // has post => UPDATE POST
        await update({ update: { ...reqBody }, col: reqBody.type, filter: { _id: reqBody._id } })
    }
}
// ? CRUD

// ! signToken
export const signToken = async (whatToSign) => {
    return jwt.sign(whatToSign, process.env.JWT)
}

// ! verifyToken
export const verifyToken = async (whatToVerify) => {
    return jwt.verify(whatToVerify, process.env.JWT)
}






