import { io } from 'socket.io-client'; // ✅ Fixed import

let socketInstance = null;

export const initializeSocket = (projectId) => {
    socketInstance = io(import.meta.env.VITE_API_URL, { // ✅ Fixed `socket` to `io`
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}
