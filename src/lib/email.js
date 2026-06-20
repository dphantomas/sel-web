import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.SMTP_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
  })

  const mailOptions = {
    from: `"Sanación en Luz" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html
  }

  await transporter.sendMail(mailOptions)
}
