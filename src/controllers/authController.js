
const authService = require('../services/authService');
const { Account, Role, Student, Lecturer } = require('../models');
const { ValidationError } = require('../middleware/errorHandler');

const authController = {
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new ValidationError('Email and password are required');
            }

            const user = await Account.findOne({
                where: { email, is_active: true },
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            const isPasswordValid = await authService.comparePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            let userProfile = null;
            if (user.role.name === 'student') {
                userProfile = await Student.findOne({ where: { account_id: user.id } });
            } else if (user.role.name === 'lecturer') {
                userProfile = await Lecturer.findOne({ where: { account_id: user.id } });
            }

            const tokenPayload = {
                id: user.id,
                email: user.email,
                role: user.role.name,
                role_id: user.role_id
            };

            const accessToken = authService.generateToken(tokenPayload);
            const refreshToken = authService.generateRefreshToken(tokenPayload);

            await user.update({ last_login: new Date() });

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role.name,
                        profile: userProfile
                    },
                    tokens: {
                        accessToken,
                        refreshToken,
                        expiresIn: '15m'
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            res.status(200).json({
                status: 'success',
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new ValidationError('All password fields are required');
            }

            if (newPassword !== confirmPassword) {
                throw new ValidationError('New password and confirmation do not match');
            }

            if (newPassword.length < 6) {
                throw new ValidationError('New password must be at least 6 characters long');
            }

            const user = await Account.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            const isCurrentPasswordValid = await authService.comparePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }

            const hashedNewPassword = await authService.hashPassword(newPassword);
            await user.update({ password: hashedNewPassword });

            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email) {
                throw new ValidationError('Email is required');
            }

            const user = await Account.findOne({ where: { email, is_active: true } });
            if (!user) {
                return res.status(200).json({
                    status: 'success',
                    message: 'If the email exists, a password reset link has been sent'
                });
            }

            const resetToken = authService.generatePasswordResetToken();
            const resetExpires = new Date(Date.now() + 3600000); // 1 hour

            await user.update({
                password_reset_token: resetToken,
                password_reset_expires: resetExpires
            });

            res.status(200).json({
                status: 'success',
                message: 'Password reset link has been sent to your email',
                resetToken: resetToken
            });
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            const { token, newPassword, confirmPassword } = req.body;

            if (!token || !newPassword || !confirmPassword) {
                throw new ValidationError('Token, new password, and confirmation are required');
            }

            if (newPassword !== confirmPassword) {
                throw new ValidationError('New password and confirmation do not match');
            }

            if (newPassword.length < 6) {
                throw new ValidationError('Password must be at least 6 characters long');
            }

            const user = await Account.findOne({
                where: {
                    password_reset_token: token,
                    password_reset_expires: {
                        [require('sequelize').Op.gt]: new Date()
                    },
                    is_active: true
                }
            });

            if (!user) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid or expired reset token'
                });
            }

            const hashedPassword = await authService.hashPassword(newPassword);
            await user.update({
                password: hashedPassword,
                password_reset_token: null,
                password_reset_expires: null
            });

            res.status(200).json({
                status: 'success',
                message: 'Password reset successful'
            });
        } catch (error) {
            next(error);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new ValidationError('Refresh token is required');
            }

            const decoded = authService.verifyRefreshToken(refreshToken);

            const user = await Account.findOne({
                where: { id: decoded.id, is_active: true },
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid refresh token'
                });
            }

            const tokenPayload = {
                id: user.id,
                email: user.email,
                role: user.role.name,
                role_id: user.role_id
            };

            const newAccessToken = authService.generateToken(tokenPayload);
            const newRefreshToken = authService.generateRefreshToken(tokenPayload);

            res.status(200).json({
                status: 'success',
                message: 'Tokens refreshed successfully',
                data: {
                    tokens: {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                        expiresIn: '15m'
                    }
                }
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or expired refresh token'
                });
            }
            next(error);
        }
    }
};

module.exports = authController; 