import user from "../models/user.js"
import jwt from "jsonwebtoken"

// ! create
export const create = async ({ req, col }) => {
    // await new user({email})
    const doc = await eval(col)({ ...req.body })
    const saved = await doc.save()
    return saved // {_id: new ObjectId("123"), email: 'abc@gmail.com', ...}
}

// ! find
export const find = async ({ col, query }) => {
    // { query: { email: 'abc@gmail.com' } }
    const find = await eval(col).find({ ...query })
    return find // [{},{}...]
}

// ! signToken
export const signToken = async (whatToSign) => {
    return jwt.sign(whatToSign, process.env.JWT)
}

// ! verifyToken
export const verifyToken = async (whatToVerify) => {
    return jwt.verify(whatToVerify, process.env.JWT)
}






