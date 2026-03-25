function setupSocketHandler(io) {
	io.on('connection', (socket) => {
		const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

		if (!userId) {
			socket.emit('socket_error', { message: 'userId is required to establish realtime stream' });
			return;
		}

		socket.join(String(userId));
		socket.emit('socket_ready', { userId: String(userId) });

		socket.on('join_user_room', (nextUserId) => {
			if (!nextUserId) return;
			socket.join(String(nextUserId));
		});

		socket.on('disconnect', () => {
			console.log(`User disconnected: ${userId}`);
		});
	});
}

module.exports = setupSocketHandler;
