import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Home: React.FC = () => {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const socket = useSocket();

  const createRoom = () => {
    socket.emit('createRoom', (roomId: string) => {
      navigate(`/draw/${roomId}`);
    });
  };

  const joinRoom = () => {
    if(!socket) return;
    if (pin.length === 6) {
      socket.emit('joinRoom', pin, (success: boolean, message: string) => {
        if (success) {
          navigate(`/draw/${pin}`);
          alert(message);
        } else {
          alert('Invalid room code');
        }
      });
    }
  };

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5'>
      <h1 className='text-5xl font-bold mb-5'>DrawMate</h1>
      <button className="btn btn-info sm:btn-sm md:btn-md lg:btn-lg" onClick={createRoom}>Create a Room</button>
      <p>OR</p>
      <input
        type="text"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter 6-digit PIN to Join a Room"
        maxLength={6}
        className="input input-bordered input-info w-full max-w-xs"
      />
      <button className="btn btn-outline btn-accent" onClick={joinRoom}>Join a Room</button>
    </div>
  );
};

export default Home;