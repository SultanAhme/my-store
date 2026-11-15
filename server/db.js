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

// 4) نطلّع القاعدة عشان server.js يقدر يستخدمها
// مثل لما تعير الدفتر لزميلك: هذا هو، استخدمه
module.exports = db;

// 5) رسالة تأكيد بالترمنال
console.log('قاعدة البيانات جاهزة ✅');