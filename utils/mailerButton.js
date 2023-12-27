export default function mailerButton({ href, text }) {
    return (
        `<a target="_self" style="display: block; width: fit-content; margin: 0 auto; margin-top: 20px; border-radius: 20px; padding: 6px 16px; background: #D19B5B; color: white; text-decoration: none; font-family: Montserrat" href="${href}">${text}</a>`
    )
}