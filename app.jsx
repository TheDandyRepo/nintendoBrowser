import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

export default function App() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [channelId, setChannelId] = useState('');

  useEffect(() => {
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  const sendMessage = async () => {
    await axios.post('http://localhost:3000/send', { channelId, content });
    setContent('');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Discord Bot Dashboard</h1>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Channel ID"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded">Send</button>
      </div>

      <div className="border p-4 h-96 overflow-y-scroll">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <span className="font-bold">{m.author}</span>: {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}
