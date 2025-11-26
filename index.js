const { Client, GatewayIntentBits } = require('discord.js-selfbot-v13');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const BOT_TOKEN = 'MTIyODE2NTA3NjYzNzMxOTI1OQ.GZVP8R.yGj4m7VvQh8A56J2fTBMGWvkLZt46i1w4CQBWs';
const client = new Client();

// When a message is created in any channel
client.on('messageCreate', (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  io.emit('newMessage', {
    content: message.content,
    author: message.author.username,
    channel: message.channel.id,
    timestamp: message.createdTimestamp
  });
});

// API endpoint to send message
app.post('/send', async (req, res) => {
  const { channelId, content } = req.body;
  try {
    const channel = await client.channels.fetch(channelId);
    await channel.send(content);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

client.login(BOT_TOKEN);

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
