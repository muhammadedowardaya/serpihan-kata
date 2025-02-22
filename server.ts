import { Server } from 'socket.io';

const io = new Server(3001, {
	cors: {
		origin: 'http://localhost:3000',
		credentials: true,
	},
});

// Menyimpan daftar userId yang terhubung (userId -> socketId)
const connectedUsers = new Map<string, string>();

io.on('connection', (socket) => {
	console.log('✅ Socket connected:', socket.id);

	socket.on('registerUser', (userId) => {
		// Cek jika userId sudah ada di daftar (reconnect)
		if (connectedUsers.has(userId)) {
			console.log(`🔄 ${userId} reconnecting...`);
		}

		// Simpan userId dengan socket.id terbaru
		connectedUsers.set(userId, socket.id);
		socket.join(userId);

		console.log('Users online:', Array.from(connectedUsers.keys()));
		socket.emit('userJoined', `User ${userId} joined the room`);
	});

	socket.on('sendNotification', ({ targetUser, message, url }) => {
		console.info('sendNotification', targetUser, message, url);
		socket.to(targetUser.id).emit('notification', {
			username: targetUser.username,
			body: message,
			image: targetUser.image,
			url: url,
		});
	});

	socket.on('unreadCount', ({ unreadCount, userId }) => {
		console.info('unreadCount', unreadCount, userId);
		socket.to(userId).emit('unreadCountNotification', unreadCount);
	});

	socket.on('disconnect', () => {
		// Cari userId berdasarkan socket.id
		const userId = [...connectedUsers.entries()].find(
			([, id]) => id === socket.id
		)?.[0];

		if (userId) {
			console.log(`❌ ${userId} disconnected`);
			connectedUsers.delete(userId); // Hapus user yang keluar
		}

		console.log('Users online:', Array.from(connectedUsers.keys()));
	});
});
