// ===============================================
// server.js: السيرفر الرئيسي للمتجر
// وظيفته: يستقبل طلبات المتصفح ويرد عليها
// يشتغل على جهازك على العنوان http://localhost:3000
// ===============================================

// 1) نجيب الأدوات اللي نحتاجها
// express: الأداة اللي نزّلناها بـ npm install، تسهّل بناء السيرفر
const express = require('express');
// path: أداة موجودة أصلاً بـ Node، تساعدنا نكتب مسارات الملفات صح بأي جهاز
const path = require('path');
// crypto: أداة التشفير اللي جاية مع Node، نستخدمها لتشفير كلمات السر
const crypto = require('crypto');
// db: قاعدة البيانات اللي سويناها بملف db.js (الدفتر)
const db = require('./db');

// 2) نسوي السيرفر نفسه ونحفظه بمتغير اسمه app
const app = express();

// 3) رقم "الباب" اللي يستقبل منه السيرفر الطلبات
const PORT = 3000;

// 4) نخلي السيرفر يفهم البيانات اللي توصله بصيغة JSON
// بدون هالسطر، لو المتصفح أرسل اسم وإيميل، السيرفر ما يقدر يقراها
app.use(express.json());

// 5) حماية: نمنع أي أحد يفتح ملفات مجلد server من المتصفح
// لأن فيه كود السيرفر وقاعدة البيانات (الحسابات والطلبات)
app.use('/server', (req, res) => {
  res.status(404).send('مو موجود');
});

// 6) نخلي السيرفر يعطي المتصفح ملفات الموقع (html و css و js)
// '..' يعني "المجلد اللي فوق server" وهو my-store-git اللي فيه موقعك
app.use(express.static(path.join(__dirname, '..')));

// 7) API تجريبي: يرد برسالة بصيغة JSON عشان نتأكد إن السيرفر شغال
app.get('/api/test', (req, res) => {
  res.json({ message: 'السيرفر شغال 🎉', time: new Date().toLocaleString('ar-SA') });
});

// ===============================================
// 8) دالة تشفير كلمة السر
// ===============================================
// الفكرة: ما نحفظ كلمة السر كما هي أبداً، نحولها لنص طويل ما ينفهم (hash)
// salt: "ملح" عشوائي نخلطه مع كلمة السر، عشان لو شخصين كلمة سرهم نفسها
// يطلع لهم hash مختلف، وهذا يصعّب على الهكر يكسرها
function hashPassword(password) {
  // نسوي ملح عشوائي من 16 بايت ونحوله لنص
  const salt = crypto.randomBytes(16).toString('hex');
  // scrypt: طريقة تشفير قوية وبطيئة عن قصد، عشان التخمين ياخذ وقت طويل
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  // نحفظ الملح والـ hash مع بعض بينهم نقطتين، نحتاج الملح بعدين وقت تسجيل الدخول
  return salt + ':' + hash;
}

// ===============================================
// 9) API إنشاء حساب جديد
// ===============================================
// POST يعني المتصفح "يرسل" بيانات للسيرفر (مو بس يطلب يشوف مثل GET)
// المتصفح يرسل: { name, email, password }
app.post('/api/register', (req, res) => {
  // 9.1) ناخذ البيانات اللي أرسلها المتصفح من req.body
  const { name, email, password } = req.body;

  // 9.2) نتأكد إن البيانات كاملة وصحيحة
  // ليش نتأكد هنا وحنا أصلاً بنتأكد بالفرونت؟ لأن أي أحد يقدر يرسل طلب للسيرفر
  // بدون ما يمر على صفحتك، فالسيرفر لازم ما يثق بأي شي يوصله
  // status(400) يعني "طلبك فيه غلط"
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'عبّ كل الخانات' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'الإيميل غير صحيح' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'كلمة السر لازم 6 أحرف أو أكثر' });
  }

  // 9.3) نشوف بالقاعدة: فيه أحد مسجل بنفس الإيميل؟
  // prepare: نجهز أمر SQL، وعلامة ? مكان القيمة اللي نحطها بعدين
  // ليش ? وما نكتب الإيميل مباشرة بالأمر؟ حماية من هجوم اسمه SQL Injection
  // (لو أحد كتب أوامر SQL مكان إيميله، ? تخليها تنقرا كنص عادي مو كأمر)
  // get: يرجع أول سطر يلقاه، أو undefined لو ما لقى شي
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    // 409 يعني "فيه تعارض": الإيميل مستخدم من قبل
    return res.status(409).json({ error: 'هالإيميل مسجل من قبل' });
  }

  // 9.4) نشفر كلمة السر ونحفظ الحساب الجديد بجدول users
  // run: ينفذ الأمر (هنا إضافة سطر جديد) ويرجع معلومات منها رقم السطر الجديد
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hashPassword(password));

  // 9.5) نرد على المتصفح إن الحساب انسوى
  // 201 يعني "انسوى شي جديد بنجاح"
  // لاحظ: ما نرجع كلمة السر ولا الـ hash أبداً
  res.status(201).json({
    message: 'تم إنشاء الحساب ✅',
    user: { id: Number(result.lastInsertRowid), name: name, email: email }
  });
});
// ===============================================
// 10) دالة التأكد من كلمة السر (وقت تسجيل الدخول)
// ===============================================
// الفكرة: ما نقدر "نفك" الـ hash ونرجعه لكلمة السر، هذا مستحيل عن قصد
// بدل كذا، ناخذ كلمة السر اللي كتبها الزبون الحين، ونشفرها بنفس الملح المحفوظ
// لو طلع نفس الـ hash المحفوظ بالقاعدة، معناها كلمة السر صحيحة
function checkPassword(password, saved) {
  // نفصل الملح عن الـ hash (كنا حافظينهم "ملح:hash")
  const [salt, savedHash] = saved.split(':');
  // نشفر كلمة السر الجديدة بنفس الملح
  const newHash = crypto.scryptSync(password, salt, 64).toString('hex');
  // timingSafeEqual: نقارن الاثنين بطريقة تاخذ نفس الوقت دايم
  // عشان الهكر ما يقدر يخمن من سرعة الرد كم حرف صح
  return crypto.timingSafeEqual(Buffer.from(newHash, 'hex'), Buffer.from(savedHash, 'hex'));
}

// ===============================================
// 11) API تسجيل الدخول
// ===============================================
// المتصفح يرسل: { email, password }
// السيرفر يرد: كرت الدخول (token) + بيانات الزبون
app.post('/api/login', (req, res) => {
  // 11.1) ناخذ الإيميل وكلمة السر من الطلب
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'اكتب الإيميل وكلمة السر' });
  }

  // 11.2) ندور الزبون بالقاعدة عن طريق إيميله
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // 11.3) لو ما لقيناه، أو كلمة السر غلط، نرد بنفس الرسالة بالحالتين
  // ليش نفس الرسالة؟ عشان ما نعلّم الهكر إن هالإيميل مسجل عندنا
  // 401 يعني "ما عرفناك" أو "غير مصرح لك"
  if (!user || !checkPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'الإيميل أو كلمة السر غلط' });
  }

  // 11.4) نسوي كرت دخول جديد: 32 بايت عشوائية = نص طويل مستحيل يتخمن
  const token = crypto.randomBytes(32).toString('hex');

  // 11.5) نسجل الكرت بدفتر الجلسات ونربطه برقم الزبون
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);

  // 11.6) نرجع الكرت للمتصفح عشان يحفظه ويرسله مع كل طلب بعدين
  res.json({
    message: 'أهلاً ' + user.name + ' 👋',
    token: token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// ===============================================
// 12) دالة: مين صاحب هالطلب؟
// ===============================================
// المتصفح يرسل الكرت داخل "رأس" الطلب (header) اسمه Authorization
// بهالشكل: Bearer وبعدها الكرت. وBearer يعني "حامل الكرت"
// الدالة ترجع بيانات الزبون، أو null لو ما فيه كرت أو الكرت غلط
function getUser(req) {
  // نقرا الرأس، ولو مو موجود نخليه نص فاضي
  const header = req.headers.authorization || '';
  // نشيل كلمة "Bearer " ويبقى الكرت بس
  const token = header.replace('Bearer ', '');
  if (!token) return null;
  // JOIN: نربط جدول الجلسات بجدول الحسابات عشان نجيب بيانات صاحب الكرت بأمر واحد
  // ونجيب الأعمدة اللي نحتاجها بس، بدون password_hash
  const user = db.prepare(`
    SELECT users.id, users.name, users.email
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token = ?
  `).get(token);
  return user || null;
}

// ===============================================
// 13) API "مين أنا؟"
// ===============================================
// الصفحة تسأل السيرفر: هالكرت اللي معي لمين؟
// نستخدمه بعدين عشان نعرض "أهلاً سلطان" بالحقيبة
app.get('/api/me', (req, res) => {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'مو مسجل دخول' });
  }
  res.json({ user: user });
});
// ===============================================
// 13.5) API تسجيل الخروج
// ===============================================
// المتصفح يرسل الكرت بالرأس Authorization
// والسيرفر يحذفه من دفتر الجلسات، فيصير الكرت ما يفتح شي بعدها
app.post('/api/logout', (req, res) => {
  // نقرا الكرت من الرأس ونشيل كلمة "Bearer " (نفس طريقة getUser)
  const token = (req.headers.authorization || '').replace('Bearer ', '');

  // DELETE: أمر SQL يحذف سطر، وWHERE تحدد أي سطر بالضبط
  // انتبه: DELETE بدون WHERE يحذف الجدول كله! فلا تنساها أبداً
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);

  res.json({ message: 'تم تسجيل الخروج 👋' });
});
// ===============================================
// 13.6) API حفظ طلب جديد
// ===============================================
// المتصفح يرسل: { name, phone, city, address, items, total }
// items: منتجات السلة، كل منتج فيه { id, name, price, qty }
// يشتغل للزبون المسجل وللزائر: لو فيه كرت نربط الطلب بصاحبه، ولو ما فيه نحفظه بدون صاحب
app.post('/api/orders', (req, res) => {
  // 1) ناخذ بيانات الطلب من المتصفح
  const { name, phone, city, address, items, total } = req.body;

  // 2) نتأكد من البيانات (السيرفر ما يثق بأي شي يوصله)
  if (!name || !phone || !city || !address) {
    return res.status(400).json({ error: 'عبّ كل بيانات التوصيل' });
  }
  // Array.isArray: نتأكد إن items قائمة فعلاً، وفيها منتج واحد على الأقل
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'السلة فاضية' });
  }

  // 3) مين صاحب الطلب؟ نستخدم دالة getUser اللي سويناها قبل
  // لو مسجل دخول نحط رقمه، ولو زائر نحط null (يعني "فاضي" بالقاعدة)
  const user = getUser(req);
  const userId = user ? user.id : null;

  // 4) نحفظ الطلب بجدول orders
  // items قائمة، والقاعدة ما تخزن قوائم مباشرة، فنحولها لنص JSON بـ JSON.stringify
  const result = db.prepare(`
    INSERT INTO orders (user_id, name, phone, city, address, items, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, name, phone, city, address, JSON.stringify(items), total);

  // 5) نرجع رقم الطلب الحقيقي من القاعدة (بدل الرقم العشوائي اللي كان بالفرونت)
  res.status(201).json({
    message: 'تم استلام طلبك ✅',
    orderId: Number(result.lastInsertRowid)
  });
});
// 10) نشغّل السيرفر ونخليه ينتظر الطلبات على الباب 3000
app.listen(PORT, () => {
  console.log('السيرفر شغال على http://localhost:' + PORT);
});