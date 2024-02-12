import { findOne } from "../controllers/functions.js"

export default async function redefineUserRole({ userEmail, userRole }) {

    // redefine user role if admin has assigned new coach
    const foundUpdatedByAdminAnyMomentCoachRole = await findOne({ col: "courses", query: { coachEmail: userEmail } })
    const newRole = foundUpdatedByAdminAnyMomentCoachRole && userRole !== "admin" ? "coach" : userRole

    return newRole
}
