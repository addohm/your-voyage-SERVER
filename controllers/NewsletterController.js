import { _delete, create, find } from "./functions.js"

// ! subUnSubNewsletter
export const subUnSubNewsletter = async (req, res) => {

    const { id: userId, email } = req.user
    const foundNewsletter = await find({ col: "newsletter", query: { userId } })

    if (foundNewsletter?.[0]) { // has newsletter => DELETE
        await _delete({ col: "newsletter", query: { userId } })
    } else { // no newsletter => CREATE
        await create({ createObj: { userId, email }, col: "newsletter" })
    }
    res.json({})
}