import { findOne } from "../controllers/functions.js"

export default async function redefineUserRole({ userEmail, userRole }) {

    // redefine user role if admin has assigned new coach or support
    const foundUpdatedByAdminAnyMomentCoachRole = await findOne({ col: "courses", query: { coachEmail: userEmail } })
    let newRole = foundUpdatedByAdminAnyMomentCoachRole && userRole !== "admin" ? "coach" : userRole
    newRole = userEmail === process.env.SUPPORT_EMAIL || userEmail === process.env.SUPPORT_EMAIL2 ? "support" : newRole

    return newRole
}
