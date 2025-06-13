import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | undefined>(undefined);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({
  socket,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SocketContext>, "value"> & {
  socket: Socket | undefined;
}) => {
  return (
    <SocketContext.Provider {...props} value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
