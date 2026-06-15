# 🤖 WhatsApp Group Bot

בוט לניהול קבוצות וואטסאפ – מחיקת קישורים, סטיקרים, והסרת משתמשים.

## ✨ יכולות

- 🔗 מחיקת קישורים אוטומטית
- 🎭 מחיקת סטיקרים אוטומטית
- 👢 הסרת משתמשים על ידי פקודת מנהל
- 📲 חיבור דרך QR Code
- ☁️ תמיכה מלאה ב-Render (סשן נשמר ב-MongoDB)

---

## 🚀 הרצה מקומית (הכי פשוט)

```bash
npm install
npm start
```

סרוק את ה-QR שיופיע בטרמינל – הסשן נשמר אוטומטית.

---

## ☁️ פריסה על Render

### שלב 1 – צור מסד נתונים MongoDB Atlas (בחינם)

1. היכנס ל־ https://cloud.mongodb.com
2. צור cluster חינמי (M0)
3. צור משתמש DB ← שמור שם משתמש וסיסמה
4. ב-Network Access הוסף: `0.0.0.0/0`
5. לחץ Connect ← Drivers ← העתק את ה-Connection String
   - ייראה כך: `mongodb+srv://user:pass@cluster.mongodb.net/whatsapp-bot`

### שלב 2 – פרוס על Render

1. היכנס ל- https://render.com
2. New → Web Service → חבר את ה-GitHub repo הזה
3. הגדר:
   - **Runtime:** Node
   - **Build Command:** (render.yaml כבר מגדיר אוטומטית)
   - **Start Command:** `node index.js`
4. הוסף Environment Variables:
   - `MONGODB_URI` ← Connection String מ-MongoDB Atlas
   - `RENDER` ← `true`
   - `PUPPETEER_EXECUTABLE_PATH` ← `/usr/bin/chromium`
5. לחץ Deploy

### שלב 3 – סרוק QR (פעם אחת בלבד!)

1. פתח את לוגי Render
2. המתן עד שיופיע קוד QR
3. סרוק עם וואטסאפ → הסשן נשמר ב-MongoDB
4. מהפעם הבאה הבוט יתחבר אוטומטית ✅

---

## 📋 פקודות מנהל

| פקודה | תיאור |
|-------|--------|
| `!kick` | הסר משתמש (צטט הודעה שלו) |
| `!links on` | הפעל מחיקת קישורים |
| `!links off` | כבה מחיקת קישורים |
| `!stickers on` | הפעל מחיקת סטיקרים |
| `!stickers off` | כבה מחיקת סטיקרים |
| `!help` | הצג תפריט פקודות |

> ⚠️ הבוט חייב להיות **מנהל בקבוצה** כדי למחוק הודעות ולהסיר משתמשים.
