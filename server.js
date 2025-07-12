
require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');

        if (NODE_ENV === 'development') {
            // await sequelize.sync({ force: false });
            console.log('📊 Database synchronized');
        }

        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${NODE_ENV}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        });

        const { Server } = require('socket.io');
        const jwt = require('jsonwebtoken');
        const jwtConfig = require('./src/config/jwt');
        const { Account, ClassChatMessage } = require('./src/models');

        const io = new Server(server, {
            cors: {
                origin: ['http://localhost:3000', 'http://localhost:5173'],
                methods: ['GET', 'POST']
            }
        });

        const chatNamespace = io.of('/class-chat');

        // Middleware auth for socket
        chatNamespace.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth?.token || socket.handshake.query?.token;
                if (!token) return next(new Error('Authentication token missing'));
                const payload = jwt.verify(token.replace('Bearer ', ''), jwtConfig.secret);
                const account = await Account.findByPk(payload.id);
                if (!account) return next(new Error('Account not found'));
                socket.user = { id: account.id, email: account.email };
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        chatNamespace.on('connection', (socket) => {
            // client emits joinRoom with classId
            socket.on('joinRoom', (classId) => {
                if (!classId) return;
                socket.join(`class-${classId}`);
            });

            socket.on('message', async ({ classId, content }) => {
                if (!classId || !content || !content.trim()) return;
                try {
                    const msg = await ClassChatMessage.create({
                        course_section_id: classId,
                        sender_id: socket.user.id,
                        content
                    });

                    const { Student } = require('./src/models');
                    const stu = await Student.findOne({ where: { account_id: socket.user.id } });
                    chatNamespace.to(`class-${classId}`).emit('message', {
                        id: msg.id,
                        course_section_id: classId,
                        sender_id: socket.user.id,
                        sender_student_id: stu ? stu.student_id : null,
                        sender_email: socket.user.email,
                        content,
                        created_at: msg.created_at
                    });
                } catch (e) {
                    console.error('Socket message error', e);
                }
            });
        });

        const gracefulShutdown = (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            
            server.close(() => {
                console.log('📴 HTTP server closed');
                
                sequelize.close().then(() => {
                    console.log('📴 Database connection closed');
                    process.exit(0);
                }).catch((err) => {
                    console.error('❌ Error closing database connection:', err);
                    process.exit(1);
                });
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

startServer(); 