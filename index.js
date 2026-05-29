const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// ⚠️ URL completa de tu Google Apps Script (termina en /exec)
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwCPGOaZllFNLBl6jr5yy1bGPqASeLrv0v964bMKLXXa1LSF5HyakNaZBh4uBl5tIKW/exec';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('⬆️ ESCANEA EL QR DE ARRIBA O USA EL MÉTODO DE 8 DÍGITOS.');
});

client.on('ready', () => {
    console.log('✅ Bot conectado a WhatsApp. ¡Listo para responder!');
});

client.on('message', async (message) => {
    if (message.fromMe) return;
    if (message.isGroupMsg) return;

    const userMessage = message.body.trim();
    const userNumber = message.from;

    console.log(`📩 Mensaje de ${userNumber}: ${userMessage.substring(0, 50)}`);

    try {
        const response = await axios.post(WEBHOOK_URL, {
            from: userNumber,
            mensaje: userMessage
        }, { timeout: 10000 });

        if (response.data && response.data.respuesta) {
            await client.sendMessage(userNumber, response.data.respuesta);
            console.log(`✅ Respondido a ${userNumber}`);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        await client.sendMessage(userNumber, '🔧 Servicio ocupado, intenta de nuevo.');
    }
});

client.initialize();
