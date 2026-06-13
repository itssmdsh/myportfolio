// Vercel Serverless Function — Send Contact Form Email
// Uses Nodemailer with Gmail SMTP (App Password recommended)
// Environment variables required:
//   EMAIL_USER = your Gmail address (e.g. yourgmail@gmail.com)
//   EMAIL_PASS = your Gmail App Password (16-char, from Google Account > Security > App Passwords)

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // Enable CORS for same-origin calls from the portfolio
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Guard: ensure env vars exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing EMAIL_USER or EMAIL_PASS environment variables.');
        return res.status(500).json({ error: 'Server email configuration missing.' });
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: 'mohammad.worklife@gmail.com',
        replyTo: email,
        subject: `[Portfolio] ${subject}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0C11; border-radius: 12px; overflow: hidden; border: 1px solid #1e2436;">
                <div style="background: linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%); padding: 28px 32px;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 1.4rem; font-weight: 600;">New Portfolio Message</h2>
                    <p style="margin: 6px 0 0; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Someone reached out via your portfolio contact form</p>
                </div>
                <div style="padding: 28px 32px; color: #ECEEF2;">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                            <td style="padding: 8px 0; color: #8E96A4; font-size: 0.82rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; width: 90px;">FROM</td>
                            <td style="padding: 8px 0; font-weight: 500;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #8E96A4; font-size: 0.82rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">EMAIL</td>
                            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #06B6D4; text-decoration: none;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #8E96A4; font-size: 0.82rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">SUBJECT</td>
                            <td style="padding: 8px 0;">${subject}</td>
                        </tr>
                    </table>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 20px;">
                        <p style="margin: 0 0 8px; color: #8E96A4; font-size: 0.82rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">MESSAGE</p>
                        <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    <p style="margin: 24px 0 0; color: #8E96A4; font-size: 0.78rem;">Sent via your portfolio at itssmdsh.vercel.app</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
};
