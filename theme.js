// ===== الدارك مود (مشترك لكل الصفحات) =====
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

const themeBtn = document.getElementById("theme-btn");

if (themeBtn) {
  themeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

// =====================================================
// الحقيبة 1: فتح وإغلاق القائمة
// الضغط على الحقيبة يفتح/يسكر، والضغط برا القائمة يسكرها
// =====================================================
const bagBtn = document.getElementById("bag-btn");
const bagPanel = document.getElementById("bag-panel");

// if: عشان الكود ما يخرب بصفحة ما فيها حقيبة
if (bagBtn) {

  // ضغطة الحقيبة: نقلب كلاس open (موجود ← يشيله، مو موجود ← يحطه)
  bagBtn.addEventListener("click", function (e) {
    e.stopPropagation(); // نوقف الضغطة عشان ما توصل للصفحة وتسكرها فوراً
    bagPanel.classList.toggle("open");
  });

  // أي ضغطة داخل القائمة (مثل + و −) نوقفها هنا، عشان القائمة ما تتسكر
  bagPanel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // أي ضغطة توصل للصفحة = ضغطة برا القائمة، فنسكرها
  document.addEventListener("click", function () {
    bagPanel.classList.remove("open");
  });
}

// =====================================================
// الحقيبة 2: دالة updateBag
// تقرا السلة من الدفتر (localStorage) وترسم الحقيبة:
// المنتجات + أزرار الكمية + الرقم على الأيقونة + المجموع بعد الخصم
// تنادى من: هنا، script.js، product.js
// =====================================================
function updateBag() {
  const bagList = document.getElementById("bag-list");
  if (!bagList) return; // الصفحة ما فيها حقيبة؟ نطلع بهدوء

  // نقرا السلة والخصم من الدفتر
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const discount = Number(localStorage.getItem("discount")) || 0;
  let count = 0; // عدد القطع
  let total = 0; // المبلغ قبل الخصم

  bagList.innerHTML = ""; // نمسح القديم قبل ما نرسم من جديد

  // سطر لكل منتج: الاسم يمين، والكمية بين − و + يسار
  cart.forEach(function (item) {
    bagList.innerHTML += `<li>
      <span>${item.name}</span>
      <span class="bag-qty">
        <button class="minus" data-id="${item.id}">−</button>
        ${item.qty}
        <button class="plus" data-id="${item.id}">+</button>
      </span>
    </li>`;
    count += item.qty;
    total += item.price * item.qty;
  });

  // السلة فاضية؟ نكتب رسالة بدل قائمة فاضية
  if (cart.length === 0) {
    bagList.innerHTML = "<li>" + t("emptyBag") + "</li>";
  }

  // نحدّث الرقم على الأيقونة والمجموع بعد الخصم
  document.getElementById("cart-count").textContent = count;
  document.getElementById("cart-total").textContent = (total - total * discount) + " " + t("currency");
}

// نرسم الحقيبة أول ما تفتح أي صفحة
updateBag();

// =====================================================
// الحقيبة 3: أزرار + و − داخل الحقيبة
// نراقب القائمة كاملة بدل كل زر لحاله (لأن الأزرار تنرسم من جديد كل مرة)
// =====================================================
const bagList = document.getElementById("bag-list");

if (bagList) {
  bagList.addEventListener("click", function (e) {

    // 1) وش رقم المنتج؟ لو الضغطة مو على زر (ما فيه data-id) نتجاهلها
    const id = Number(e.target.dataset.id);
    if (!id) return;

    // 2) نقرا السلة ونلقى المنتج
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(function (c) {
      return c.id === id;
    });

    // 3) نزيد أو ننقص حسب الزر
    if (e.target.classList.contains("plus")) {
      item.qty += 1;
    }
    if (e.target.classList.contains("minus")) {
      item.qty -= 1;
    }

    // 4) لو الكمية وصلت صفر، نشيل المنتج من السلة كامل
    if (item.qty === 0) {
      cart = cart.filter(function (c) {
        return c.id !== id;
      });
    }

    // 5) نحفظ ونرسم من جديد
    localStorage.setItem("cart", JSON.stringify(cart));
    updateBag();
  });
}

// =====================================================
// الحقيبة 4: كود الخصم (SULTAN10 = خصم 10%)
// نحفظ الخصم بالدفتر، عشان الحقيبة وصفحة الدفع يشوفونه
// =====================================================
const couponInput = document.getElementById("coupon-input");
const couponBtn = document.getElementById("coupon-btn");
const couponMsg = document.getElementById("coupon-msg");

if (couponBtn) {
  couponBtn.addEventListener("click", function () {
    // trim يشيل المسافات، و toUpperCase يخلي sultan10 تشتغل بعد
    const code = couponInput.value.trim().toUpperCase();

    if (code === "SULTAN10") {
      localStorage.setItem("discount", 0.1);
      // نحفظ الكود نفسه عشان نرسله للسيرفر وقت الدفع، والسيرفر يتحقق منه
      localStorage.setItem("coupon", code);
      couponMsg.textContent = t("couponOk");
    } else {
      localStorage.setItem("discount", 0);
      // الكود غلط: نمسح أي كود قديم محفوظ
      localStorage.removeItem("coupon");
      couponMsg.textContent = t("couponBad");
    }

    updateBag(); // نحدّث المجموع بالخصم الجديد
  });
}

// ===============================================
// 5) قسم الحساب داخل الحقيبة
// ===============================================
// وظيفته: يغير روابط "تسجيل الدخول / الدخول كزائر" حسب حالة الزبون
// لو مسجل دخول: "أهلاً الاسم" + تسجيل الخروج
// لو مو مسجل: رابط صفحة الدخول + رابط الدفع كزائر
// الصندوق .bag-account موجود بهيدر كل الصفحات الأربع
function updateAccount() {
  // 5.1) نمسك صندوق الحساب، ولو الصفحة ما فيها حقيبة نوقف
  const box = document.querySelector('.bag-account');
  if (!box) return;

  // 5.2) نقرا بيانات الزبون اللي حفظها login.js بعد تسجيل الدخول
  // JSON.parse: يرجع النص المحفوظ لـ object عشان نقرا منه user.name
  const user = JSON.parse(localStorage.getItem('user'));

  if (user) {
    // 5.3) الزبون مسجل دخول: نحط الترحيب ورابط الخروج
    box.innerHTML = `
      <p class="bag-hello"></p>
      <a href="orders.html">📦 طلباتي</a>
      <a href="#" id="logout-link">تسجيل الخروج</a>
    `;
    // نحط الاسم بـ textContent مو داخل innerHTML
    // ليش؟ لو أحد سمّى نفسه كود HTML أو JavaScript، textContent يعرضه ككلام عادي وما يشغّله
    // وهذي حماية من هجوم اسمه XSS
    box.querySelector('.bag-hello').textContent = 'أهلاً ' + user.name + ' 👋';

    // 5.4) لما يضغط "تسجيل الخروج"
    document.getElementById('logout-link').addEventListener('click', function (event) {
      event.preventDefault();
      // نقول للسيرفر يلغي الكرت من دفتر الجلسات (الشباك /api/logout نسويه الخطوة الجاية)
      // ونرسل الكرت بالرأس عشان السيرفر يعرف أي كرت يلغي
      fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      }).finally(function () {
        // finally: تشتغل سواء نجح الطلب أو فشل
        // لأن الزبون طلب يطلع، فلازم نطلعه من المتصفح بكل الأحوال
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // نحدّث الصفحة عشان الحقيبة ترجع تعرض "تسجيل الدخول"
        window.location.reload();
      });
    });
  } else {
    // 5.5) الزبون مو مسجل: نرجع الروابط بس هالمرة تودّي لصفحات حقيقية
    box.innerHTML = `
      <a href="login.html">تسجيل الدخول</a>
      <a href="checkout.html">الدخول كزائر</a>
    `;
  }
}

// 5.6) نشغّل الدالة أول ما تفتح أي صفحة
updateAccount();