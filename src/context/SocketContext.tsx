import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};

export const SocketProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('https://drawmate-backend.onrender.com');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);
  

  if (!socket) {
    return <div>Connecting...</div>; // Or any loading indicator
  }
  
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};