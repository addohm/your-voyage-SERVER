export default function setUserRole(userEmail) {
    if (userEmail === process.env.ADMIN_EMAIL || userEmail === process.env.ADMIN_EMAIL2) {
        return "admin"
    } else if (userEmail === process.env.COACH_EMAIL || userEmail === process.env.COACH_EMAIL2) {
        return "coach"
    } else {
        return "user"
    }
}