// ===============================================
// login.js: صفحة تسجيل الدخول وإنشاء الحساب
// وظيفته: يبدّل بين وضع "دخول" و"حساب جديد"
// ويرسل البيانات للسيرفر، ولو نجح يحفظ كرت الدخول ويرجع للمتجر
// ===============================================

// 1) الوضع الحالي للصفحة: 'login' (دخول) أو 'register' (حساب جديد)
// نبدأ بوضع الدخول لأن أغلب الزوار عندهم حساب
let mode = 'login';

// 2) نمسك عناصر الصفحة اللي بنتعامل معها (كلها موجودة بـ login.html)
const form = document.getElementById('login-form');
const title = document.getElementById('form-title');
const nameLabel = document.getElementById('name-label');
const nameInput = document.getElementById('name');
const submitBtn = document.getElementById('submit-btn');
const switchLink = document.getElementById('switch-link');
const switchText = document.querySelector('.switch-text');
const formError = document.getElementById('form-error');

// ===============================================
// 3) التبديل بين الوضعين لما يضغط الرابط تحت الزر
// ===============================================
switchLink.addEventListener('click', function (event) {
  // نمنع الرابط من وظيفته العادية (الانتقال لصفحة ثانية)
  event.preventDefault();

  if (mode === 'login') {
    // 3.1) نحول لوضع حساب جديد: نغير العناوين ونظهر خانة الاسم
    mode = 'register';
    title.textContent = 'حساب جديد';
    submitBtn.textContent = 'إنشاء الحساب';
    nameLabel.hidden = false;
    nameInput.hidden = false;
    // firstChild: أول جزء داخل السطر، وهو الكلام اللي قبل الرابط
    switchText.firstChild.textContent = 'عندك حساب؟ ';
    switchLink.textContent = 'سجّل دخول';
  } else {
    // 3.2) نرجع لوضع الدخول: نرجع العناوين ونخفي خانة الاسم
    mode = 'login';
    title.textContent = 'تسجيل الدخول';
    submitBtn.textContent = 'دخول';
    nameLabel.hidden = true;
    nameInput.hidden = true;
    switchText.firstChild.textContent = 'ما عندك حساب؟ ';
    switchLink.textContent = 'سجّل الحين';
  }

  // نمسح أي رسالة خطأ قديمة لأن الوضع تغير
  formError.textContent = '';
});

// ===============================================
// 4) لما يضغط زر "دخول" أو "إنشاء الحساب"
// ===============================================
// async: يعني الدالة فيها أوامر "تنتظر" رد السيرفر
// و await: "استنّى لين يجي الرد وبعدين كمّل"
// مثل لما تطلب من الكاشير وتنتظر الفاتورة قبل ما تمشي
form.addEventListener('submit', async function (event) {
  // نمنع الفورم من تحديث الصفحة (وظيفته العادية)
  event.preventDefault();
  formError.textContent = '';

  // 4.1) ناخذ اللي كتبه الزبون
  // trim: يشيل المسافات الزايدة من البداية والنهاية
  // كلمة السر ما نسوي لها trim لأن المسافة ممكن تكون جزء منها
  const name = nameInput.value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // try / catch: "جرّب، ولو صار خطأ (مثل السيرفر طافي) روح لـ catch"
  try {
    // 4.2) لو وضع حساب جديد: نسوي الحساب أول
    if (mode === 'register') {
      const registerRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
      });
      const registerData = await registerRes.json();

      // res.ok تكون true لو السيرفر رد بنجاح (200 أو 201)
      // ولو رد بخطأ (400 أو 409) نعرض رسالة الخطأ اللي كتبناها بالسيرفر ونوقف
      if (!registerRes.ok) {
        formError.textContent = registerData.error;
        return;
      }
      // لو نجح، نكمل تحت ونسجل دخوله تلقائياً عشان ما نتعبه يكتب بياناته مرتين
    }

    // 4.3) تسجيل الدخول: نرسل الإيميل وكلمة السر لشباك /api/login
    const loginRes = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      formError.textContent = loginData.error;
      return;
    }

    // 4.4) نجح الدخول: نحفظ الكرت وبيانات الزبون بالمتصفح
    // token: نرسله مع الطلبات الجاية عشان السيرفر يعرفنا
    // user: نحفظه عشان نعرض اسمه بالحقيبة بدون ما نسأل السيرفر كل مرة
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));

    // 4.5) نرجعه للصفحة الرئيسية
    window.location.href = 'index.html';

  } catch (error) {
    // نوصل هنا لو ما قدرنا نكلم السيرفر أصلاً (مثلاً نسيت تشغله)
    formError.textContent = 'ما قدرنا نوصل للسيرفر، تأكد إنه شغال';
  }
});