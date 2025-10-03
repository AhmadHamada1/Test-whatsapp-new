const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create a new client instance
const client = new Client();

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});

// When the client received QR-Code
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

// Start your client
client.initialize();

// Listening to all incoming messages
client.on('message_create', message => {
    console.log(message.body);
    if (message.body === '!ping') {
        // send back "pong" to the chat the message was sent in
        client.sendMessage(message.from, 'pong (using sendMessage)');

        // reply back "pong" directly to the message
        message.reply('pong (using reply)');
    }
});

// TESTING sending a message
// - client.sendMessage("+923054767456", "Hello"); ??? does this work???

// API # 1
// - Connect a number
// - Calling this API should return a QR code to let the 
//   customer scan and connect the number

// API # 2
// - Send a message as text, image and document. 
// - There should be an indicator delay, based on how much time it 
//   takes to write the message, and then it will send that. 

// API # 3
// Number warmup