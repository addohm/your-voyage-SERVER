export default function setUserRole(userEmail) {
    if (userEmail === process.env.ADMIN_EMAIL || userEmail === process.env.ADMIN_EMAIL2) {
        return "admin"
    }
    // CURRENTLY support role is defined in redefineUserRole
    // if (userEmail === process.env.SUPPORT_EMAIL || userEmail === process.env.SUPPORT_EMAIL2) {
    //     return "support"
    // } 
    if (userEmail !== process.env.ADMIN_EMAIL || userEmail !== process.env.ADMIN_EMAIL2 || userEmail !== process.env.SUPPORT_EMAIL || userEmail !== process.env.SUPPORT_EMAIL2) {
        return "user"
    }
}