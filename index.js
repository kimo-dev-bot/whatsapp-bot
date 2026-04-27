const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const pino = require('pino')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// عشان Render ميفصلش البوت لازم سيرفر وهمي
app.get('/', (req, res) => res.send('بوت كيمو شغال يا وحش!'))
app.listen(port, () => console.log(`Server on port ${port}`))

async function startKimo() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Kimo-Bot", "Chrome", "1.0.0"]
    })

    if (!sock.authState.creds.registered) {
        const phoneNumber = "201105749499"; 
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber)
                console.log(`\n\x1b[32m[!] كود الربط بتاعك يا كيمو: ${code}\x1b[0m\n`)
            } catch (e) {
                console.log("استنى شوية السيرفر بيحمل...")
            }
        }, 10000)
    }

    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const from = msg.key.remoteJid
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

        if (body === 'الاوامر') {
            await sock.sendMessage(from, { text: 'أؤمر يا كيمو.. معاك بوت الإدارة المصري:\n1- طرد (رد بكلمة طرد على أي رسالة)\n2- قفل (يقفل الجروب)\n3- فتح (يفتح الجروب)\n4- منشن (ينادي على الكل)' })
        }
        // هنا ممكن نزود أوامر تانية كتير براحتنا
    })

    console.log("البوت بدأ.. راقب الكونسول عشان الكود")
}

startKimo()
