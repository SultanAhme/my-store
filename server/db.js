// ===============================================
// db.js: ملف قاعدة البيانات
// وظيفته: يفتح قاعدة البيانات (ملف store.db) ويسوي الجداول لو ما كانت موجودة
// أي ملف ثاني يبي يقرا أو يكتب بالقاعدة يستدعي هالملف
// ===============================================

// 1) نجيب أداة SQLite اللي جاية مع Node
// DatabaseSync: تخلينا نتعامل مع القاعدة خطوة بخطوة بشكل بسيط
const { DatabaseSync } = require('node:sqlite');
// path: عشان نكتب مسار الملف صح
const path = require('path');

// 2) نفتح ملف القاعدة store.db داخل مجلد server
// لو الملف مو موجود، ينسوى تلقائياً أول مرة
const db = new DatabaseSync(path.join(__dirname, 'store.db'));

// 3) نسوي الجداول بأوامر SQL
// CREATE TABLE IF NOT EXISTS يعني: سوّ الجدول بس لو مو موجود
// عشان كل ما شغّلنا السيرفر ما يمسح البيانات القديمة
db.exec(`
  -- جدول الحسابات: كل سطر = زبون عنده حساب
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- رقم الزبون، يزيد تلقائياً 1 و 2 و 3
    name TEXT NOT NULL,                     -- اسمه، وNOT NULL يعني لازم يكون موجود
    email TEXT NOT NULL UNIQUE,             -- إيميله، وUNIQUE يعني ما يتكرر بين حسابين
    password_hash TEXT NOT NULL,            -- كلمة السر بعد التشفير، ما نحفظها كما هي أبداً
    created_at TEXT DEFAULT CURRENT_TIMESTAMP  -- وقت التسجيل، ينحط تلقائياً
  );

  -- جدول الطلبات: كل سطر = طلب واحد
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,   -- رقم الطلب
    user_id INTEGER REFERENCES users(id),   -- رقم الزبون صاحب الطلب، ويكون فاضي لو زائر
    name TEXT NOT NULL,                     -- اسم المستلم
    phone TEXT NOT NULL,                    -- جواله
    city TEXT NOT NULL,                     -- المدينة
    address TEXT NOT NULL,                  -- العنوان
    items TEXT NOT NULL,                    -- المنتجات اللي بالسلة، نحفظها كنص JSON
    total REAL NOT NULL,                    -- المجموع بعد الخصم، وREAL يعني رقم ممكن فيه كسور
    created_at TEXT DEFAULT CURRENT_TIMESTAMP  -- وقت الطلب
  );
    -- جدول الجلسات: كل سطر = زبون مسجل دخوله الحين بجهاز معين
  -- مثل سجل كروت الفندق: رقم الكرت، ولمين، ومتى انعطى
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,                       -- الكرت: نص عشوائي طويل ما يتكرر
    user_id INTEGER NOT NULL REFERENCES users(id),  -- رقم الزبون صاحب الكرت
    created_at TEXT DEFAULT CURRENT_TIMESTAMP     -- متى سجل دخوله
  );
`);

// 4) جدول المنتجات: كل سطر = منتج واحد
// ليش ننقلها للقاعدة؟ عشان السيرفر يعرف السعر الحقيقي ويحسب المجموع بنفسه
// وما يصدّق السعر اللي يجيه من المتصفح (لأن أي أحد يقدر يغيره من الكونسول)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,     -- رقم المنتج (نفس الأرقام اللي في products.js)
    name TEXT NOT NULL,         -- اسم المنتج
    price REAL NOT NULL,        -- السعر الحقيقي، وهذا اللي يعتمد عليه السيرفر
    category TEXT NOT NULL,     -- القسم: audio, phones, chargers, accessories
    image TEXT NOT NULL,        -- رابط الصورة
    desc TEXT                   -- الوصف
  );
`);

// 5) نعبّي الجدول بالمنتجات أول مرة بس
// COUNT(*): يحسب كم سطر في الجدول
// لو صفر (الجدول فاضي) نضيف المنتجات، ولو فيه منتجات ما نكررها
const count = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
if (count === 0) {
  // نفس المنتجات اللي في products.js
  const startProducts = [
    { id: 1, name: "سماعة لاسلكية", price: 199, category: "audio", image: "https://picsum.photos/300/200?1", desc: "صوت نقي وبطارية تدوم ٢٠ ساعة." },
    { id: 2, name: "ايفون 17 برو ماكس", price: 3500, category: "phones", image: "https://picsum.photos/300/200?2", desc: "يتوفر كاش او اقساط" },
    { id: 3, name: "شاحن تايب سي 30واط", price: 95, category: "chargers", image: "https://picsum.photos/300/200?3", desc: "شاحن من شركة ابل" },
    { id: 4, name: "بطارية ايفون", price: 15, category: "accessories", image: "https://picsum.photos/300/200?4", desc: "بطارية" },
    { id: 5, name: "سوارة من شاومي", price: 199, category: "accessories", image: "https://picsum.photos/300/200?5", desc: "سوارة ذكية" },
    { id: 6, name: "كفر جوال من سامسنج", price: 250, category: "accessories", image: "https://picsum.photos/300/200?6", desc: "كفر" }
  ];

  // نجهز أمر الإضافة مرة وحدة، والعلامات ? تنعبى بالقيم (حماية من SQL Injection)
  const insert = db.prepare(
    'INSERT INTO products (id, name, price, category, image, desc) VALUES (?, ?, ?, ?, ?, ?)'
  );
  // نمر على كل منتج ونضيفه
  startProducts.forEach(function (p) {
    insert.run(p.id, p.name, p.price, p.category, p.image, p.desc);
  });
  console.log('انضافت المنتجات للقاعدة 📦');
}


// 5) نطلّع القاعدة عشان server.js يقدر يستخدمها
// مثل لما تعير الدفتر لزميلك: هذا هو، استخدمه
module.exports = db;

// 6) رسالة تأكيد بالترمنال
console.log('قاعدة البيانات جاهزة ✅');