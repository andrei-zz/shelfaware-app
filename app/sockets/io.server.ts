import { Server, type DefaultEventsMap, type Socket } from "socket.io";

export const handleSocketConnection = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  console.log(socket.id, "connected");

  // socket.emit("confirmation", "connected!");

  socket.on("confirmation", (lastItemEventId) => {});
};
