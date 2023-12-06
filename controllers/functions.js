// * gray cause of eval
import user from "../models/user.js"
import tool from "../models/tool.js"
import jwt from "jsonwebtoken"

// ! CRUD
// ! create
export const create = async ({ createObj, col }) => {
    // await new user({email})
    const doc = await eval(col)({ ...createObj })
    const saved = await doc.save()
    return saved // {_id: new ObjectId("123"), email: 'abc@gmail.com', ...}
}

// ! readAll
export const readAll = async ({ col }) => {
    // await todo.find()
    const all = await eval(col).find()
    return all // [{},{}...]
}

// ! update
export const update = async ({ col, filter, update }) => {
    // await todo.findOneAndUpdate({_id}, {position})
    const updated = await eval(col).findOneAndUpdate({ ...filter }, { ...update })
    return updated // {}
}

// ! delete
export const _delete = async ({ col, query }) => {
    // await todo.findOneAndDelete({ _id })
    await eval(col).findOneAndDelete({ ...query })
}

// ! find
export const find = async ({ col, query, sort }) => {
    // await find({ col: "todo", query: { when: "1/1/2000" }, sort: { position: 1 } })
    const find = await eval(col).find({ ...query })?.sort({ ...sort })
    return find // [{},{}...]
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






