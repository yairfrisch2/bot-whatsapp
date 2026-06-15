const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// ======= QR Code =======
client.on('qr', (qr) => {
  console.log('\n📲 סרוק את קוד ה-QR הבא עם וואטסאפ:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ הבוט מחובר ומוכן!');
});

client.on('auth_failure', () => {
  console.error('❌ כשל אימות – נסה למחוק את תיקיית .wwebjs_auth ולהפעיל מחדש.');
});

// ======= Message Handler =======
client.on('message_create', async (msg) => {
  const chat = await msg.getChat();
  if (!chat.isGroup) return;

  const sender = await msg.getContact();
  const senderId = sender.id._serialized;

  const participants = chat.participants;
  const senderParticipant = participants.find(p => p.id._serialized === senderId);
  const isAdmin = senderParticipant?.isAdmin || senderParticipant?.isSuperAdmin;

  const botId = client.info.wid._serialized;
  const botParticipant = participants.find(p => p.id._serialized === botId);
  const isBotAdmin = botParticipant?.isAdmin || botParticipant?.isSuperAdmin;

  // ======= Auto-delete links =======
  if (config.deleteLinks) {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    if (urlRegex.test(msg.body)) {
      if (!isAdmin) {
        try {
          await msg.delete(true);
          const warning = await chat.sendMessage(`⚠️ @${sender.number} שליחת קישורים אסורה בקבוצה זו!`, {
            mentions: [sender],
          });
          setTimeout(() => warning.delete(true), 5000);
        } catch (e) {
          console.error('שגיאה במחיקת קישור:', e.message);
        }
      }
    }
  }

  // ======= Auto-delete stickers =======
  if (config.deleteStickers && msg.type === 'sticker') {
    if (!isAdmin) {
      try {
        await msg.delete(true);
        const warning = await chat.sendMessage(`⚠️ @${sender.number} שליחת סטיקרים אסורה בקבוצה זו!`, {
          mentions: [sender],
        });
        setTimeout(() => warning.delete(true), 5000);
      } catch (e) {
        console.error('שגיאה במחיקת סטיקר:', e.message);
      }
    }
  }

  // ======= Admin Commands =======
  if (!isAdmin) return;

  const body = msg.body.trim();

  // !kick – הסרת משתמש מהקבוצה (חייבים לצטט הודעה שלו)
  if (body === '!kick') {
    if (!isBotAdmin) {
      return msg.reply('❌ הבוט אינו מנהל בקבוצה ולא יכול להסיר משתמשים.');
    }
    if (!msg.hasQuotedMsg) {
      return msg.reply('❌ יש לצטט הודעה של המשתמש שברצונך להסיר.');
    }
    const quoted = await msg.getQuotedMessage();
    const targetContact = await quoted.getContact();
    const targetId = targetContact.id._serialized;

    const targetParticipant = participants.find(p => p.id._serialized === targetId);
    if (!targetParticipant) {
      return msg.reply('❌ המשתמש לא נמצא בקבוצה.');
    }
    if (targetParticipant.isAdmin || targetParticipant.isSuperAdmin) {
      return msg.reply('❌ לא ניתן להסיר מנהל מהקבוצה.');
    }

    try {
      await chat.removeParticipants([targetId]);
      chat.sendMessage(`✅ המשתמש @${targetContact.number} הוסר מהקבוצה.`, {
        mentions: [targetContact],
      });
    } catch (e) {
      console.error('שגיאה בהסרת משתמש:', e.message);
      msg.reply('❌ שגיאה בהסרת המשתמש.');
    }
  }

  // !links on/off – הפעלה/כיבוי מחיקת קישורים
  if (body === '!links on') {
    config.deleteLinks = true;
    msg.reply('✅ מחיקת קישורים הופעלה.');
  }
  if (body === '!links off') {
    config.deleteLinks = false;
    msg.reply('✅ מחיקת קישורים כובתה.');
  }

  // !stickers on/off – הפעלה/כיבוי מחיקת סטיקרים
  if (body === '!stickers on') {
    config.deleteStickers = true;
    msg.reply('✅ מחיקת סטיקרים הופעלה.');
  }
  if (body === '!stickers off') {
    config.deleteStickers = false;
    msg.reply('✅ מחיקת סטיקרים כובתה.');
  }

  // !help – תפריט פקודות
  if (body === '!help') {
    msg.reply(
      `🤖 *פקודות הבוט:*\n\n` +
      `*!kick* – הסרת משתמש (צטט הודעה שלו)\n` +
      `*!links on/off* – הפעל/כבה מחיקת קישורים\n` +
      `*!stickers on/off* – הפעל/כבה מחיקת סטיקרים\n` +
      `*!help* – הצג תפריט זה`
    );
  }
});

client.initialize();
