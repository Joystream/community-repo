import io from "socket.io-client";

const socket_location = `${process.env.PUBLIC_URL}/socket.io`;
const socket = io(window.location.origin, { path: socket_location });
console.log(`socket location: ${window.location.origin + socket_location}`);

export default socket;
