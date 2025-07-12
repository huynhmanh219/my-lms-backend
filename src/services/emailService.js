    
const nodemailer = require('nodemailer');

const createTransporter = () => {
    // Ensure we call correct Nodemailer API
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        } : undefined
    });

    return transporter;
};

const emailService = {
    sendWelcomeEmail: async (email, name, loginEmail, tempPassword) => {
        try {
            const transporter = createTransporter();
            
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@gmail.com',
                to: email,
                subject: 'Thông tin tài khoản hệ thống LMS',
                html: `
                    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                        <h2>Xin chào ${name},</h2>
                        <p>Tài khoản của bạn trên hệ thống <strong>LMS</strong> đã được tạo thành công.</p>
                        <p><strong>Thông tin đăng nhập:</strong></p>
                        <ul>
                            <li>Email đăng nhập: <strong>${loginEmail}</strong></li>
                            <li>Mật khẩu: <strong>${tempPassword}</strong></li>
                        </ul>
                        <p>Vui lòng đăng nhập và đổi mật khẩu ngay trong lần sử dụng đầu tiên để đảm bảo an toàn.</p>
                        <p>Trân trọng,<br/>Đội ngũ LMS</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${email}`);
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw error;
        }
    },

    sendPasswordResetEmail: async (email, resetToken) => {
        try {
            const transporter = createTransporter();
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@gmail.com',
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>You requested a password reset for your LMS account.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Password reset email sent to ${email}`);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    },

    sendEmailVerification: async (email, verificationToken) => {
        try {
            const transporter = createTransporter();
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@lms.com',
                to: email,
                subject: 'Verify Your Email',
                html: `
                    <h1>Email Verification</h1>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email verification sent to ${email}`);
        } catch (error) {
            console.error('Error sending email verification:', error);
            throw error;
        }
    },

    sendQuizNotification: async (email, quizTitle, dueDate) => {
        try {
            const transporter = createTransporter();
            
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@lms.com',
                to: email,
                subject: `Quiz Available: ${quizTitle}`,
                html: `
                    <h1>New Quiz Available</h1>
                    <p>A new quiz "${quizTitle}" is now available.</p>
                    <p>Due date: ${dueDate}</p>
                    <p>Log in to the LMS to take the quiz.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Quiz notification sent to ${email}`);
        } catch (error) {
            console.error('Error sending quiz notification:', error);
            throw error;
        }
    }
};

module.exports = emailService; 