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
