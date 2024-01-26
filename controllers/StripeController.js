import dotenv from 'dotenv'
dotenv.config()
import { find, signToken } from "./functions.js";
import _stripe from "stripe"
const __stripe = _stripe(process.env.STRIPE_PRIVATE_KEY)

export const stripe = async (req, res) => {

    const { courseId } = req.body
    const foundCourse = await find({ col: "courses", query: { _id: courseId } })
    const { discountPrice, price, courseName } = foundCourse?.[0]
    const priceInCents = discountPrice ? discountPrice * 100 : price * 100
    const storeItems = [{ name: courseName, priceInCents }]

    // if user is redirected to "/verifyOrderToken" page, he gets orderToken, 
    // then client makes app.post("/applyForCoaching") from "/verifyOrderToken" page
    // then if token verified => create order in DB
    const orderToken = await signToken(Date.now().toString()) // gen token, write it to order, only create order if this token not used (prevent order with token copied)

    try {
        const session = await __stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: storeItems.map(item => {
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: item.priceInCents,
                    },
                    quantity: 1,
                }
            }),
            success_url: `${process.env.CLIENT_URL}/verifyOrderToken/${orderToken}`,
            cancel_url: `${process.env.CLIENT_URL}/paymentCancel`,
        })
        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
}