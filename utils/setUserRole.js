export default function setUserRole(userEmail) {
    if (userEmail === process.env.ADMIN_EMAIL || userEmail === process.env.ADMIN_EMAIL2) {
        return "admin"
    } else if (userEmail === process.env.SUPPORT_EMAIL || userEmail === process.env.SUPPORT_EMAIL2) {
        return "support"
    } else {
        return "user"
    }
}