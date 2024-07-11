import React, { useEffect, useRef, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import rough from 'roughjs';

interface ChatMessage{
  sender: string | undefined;
  content: string;
  timeStamp: number;
}

const DrawingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket();


  const [ chatMessages, setChatMessages ] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput ] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!roomId || !socket) return;


  //getting the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    //creating canvas context in 2d
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    //now passing the canvas to rough.js canvas method
    const rc = rough.canvas(canvas);

    //declaring variables for drawing
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e: MouseEvent) => {
      drawing = true;
      //capturing mousedown event and passing the co-ordinates  to lastX and lastY
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const draw = (e: MouseEvent) => {
      if (!drawing) return;
      //as mouse moves new co-ordinates gets captured & stored
      const newX = e.offsetX;
      const newY = e.offsetY;

      rc.line(lastX, lastY, newX, newY);

      socket.emit('draw', { roomId, x1: lastX, y1: lastY, x2: newX, y2: newY });

      [lastX, lastY] = [newX, newY];
    };
    
    const stopDrawing = () => {
      drawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    socket.on('drawLine', ({ x1, y1, x2, y2 }) => {
      rc.line(x1, y1, x2, y2);

    });
    //chat message
    socket.on('chatMessage', (message:ChatMessage)=>{
      setChatMessages(prevMessages => [...prevMessages,message]);
      
    })

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      socket.off('drawLine');
      socket.off('chatMessage');
    };
  }, [roomId, socket]);
  useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [chatMessages]);
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() !== '' && socket && roomId) {
      const newMessage: ChatMessage = {
        sender: socket.id,
        content: messageInput.trim(),
        timeStamp: Date.now(),
      };
      
      socket.emit('sendMessage', { roomId, message: newMessage });
      setMessageInput('');
    }
  };
  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
    <div data-theme="retro" className="flex flex-col h-screen">
      <h2 className="text-2xl font-bold p-4 text-center">Drawing Room: {roomId}</h2>
      <div className="flex flex-grow">
        <div className="flex-grow relative">
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full border-black border-4"
          />
        </div>
        <div className="hidden lg:flex flex-col w-80 border-l border-gray-200">
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
            {chatMessages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.sender === socket?.id ? 'You' : 'Friend'}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t border-stone-600">
            <div className="join">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="input input-bordered join-item flex-grow"
              />
              <button type="submit" className="btn join-item">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </>
  );
};

export default DrawingRoom;