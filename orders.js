// ===============================================
// orders.js: صفحة "طلباتي"
// وظيفته: يجيب طلبات الزبون المسجل من السيرفر ويعرضها كروت
// ===============================================

// 1) القائمة اللي بنحط فيها الطلبات (موجودة بـ orders.html)
const list = document.getElementById('orders-list');

// 2) كرت الدخول المحفوظ بالمتصفح (حفظه login.js وقت تسجيل الدخول)
const token = localStorage.getItem('token');

// 3) رسالة "سجّل دخول" نستخدمها بأكثر من مكان تحت، فنحطها بمتغير واحد
const loginMessage = '<li>سجّل دخول عشان تشوف طلباتك. <a href="login.html">تسجيل الدخول</a></li>';

// ===============================================
// 4) الدالة الرئيسية: تجيب الطلبات وتعرضها
// ===============================================
async function loadOrders() {
  // 4.1) لو ما فيه كرت، الزبون مو مسجل، فما نسأل السيرفر أصلاً
  if (!token) {
    list.innerHTML = loginMessage;
    return;
  }

  try {
    // 4.2) نطلب الطلبات من السيرفر ونرسل الكرت بالرأس
    const res = await fetch('/api/my-orders', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    // 4.3) لو السيرفر رفض الكرت (مثلاً سجّل خروج من مكان ثاني)
    if (!res.ok) {
      list.innerHTML = loginMessage;
      return;
    }

    // 4.4) لو ما عنده ولا طلب
    if (data.orders.length === 0) {
      list.innerHTML = '<li>ما عندك طلبات للحين 🛍️ <a href="index.html">تسوّق الحين</a></li>';
      return;
    }

    // 4.5) نمر على كل طلب ونبني له كرت
    data.orders.forEach(function (order) {
      // نسوي عنصر li جديد وهو "الكرت"
      const card = document.createElement('li');
      card.className = 'order-card';

      // رقم الطلب
      const title = document.createElement('h3');
      title.textContent = 'طلب رقم #' + order.id;

      // التاريخ: القاعدة تحفظه بتوقيت عالمي (UTC) بهالشكل "2026-11-16 01:30:00"
      // نحط T بدل المسافة وZ بالآخر عشان JavaScript يفهمه، وtoLocaleString يعرضه بتوقيتك وبالعربي
      const date = document.createElement('p');
      date.className = 'order-date';
      date.textContent = new Date(order.created_at.replace(' ', 'T') + 'Z').toLocaleString('ar-SA');

      // المنتجات: نحول كل منتج لنص "الاسم × الكمية" ونجمعهم بفاصلة
      const items = document.createElement('p');
      items.textContent = order.items.map(item => item.name + ' × ' + item.qty).join('، ');

      // المجموع
      const total = document.createElement('p');
      total.className = 'order-total';
      total.textContent = 'المجموع: ' + order.total + ' ريال';

      // نركب الأجزاء داخل الكرت، ونحط الكرت بالقائمة
      // استخدمنا textContent بدل innerHTML عشان نحمي الصفحة من XSS
      card.append(title, date, items, total);
      list.appendChild(card);
    });

  } catch (error) {
    // السيرفر طافي أو ما قدرنا نوصله
    list.innerHTML = '<li>ما قدرنا نوصل للسيرفر، تأكد إنه شغال</li>';
  }
}

// 5) نشغّل الدالة أول ما تنفتح الصفحة
loadOrders();