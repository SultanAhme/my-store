// =====================================================
// lang.js: تبديل اللغة (عربي / English)
// الفكرة: الصفحات مكتوبة بالعربي أصلاً
// لو الزبون اختار English نبدل النصوص من القاموس ونقلب اتجاه الصفحة
// مهم: ينحمّل قبل theme.js بكل الصفحات، عشان الدالة t() تكون جاهزة لهم
// =====================================================

// 1) نقرا اللغة المحفوظة بالدفتر، ولو ما فيه شي نعتبرها عربي
const lang = localStorage.getItem("lang") || "ar";

// 2) القاموس: كل نص له مفتاح (اسم ثابت بالإنجليزي)
// وتحت كل مفتاح نسخة عربية (ar) ونسخة إنجليزية (en)
// بنزيد عليه مفاتيح بالخطوات الجاية
const translations = {
  home:     { ar: "الرئيسية", en: "Home" },
  products: { ar: "المنتجات", en: "Products" },
  social:   { ar: "تواصل اجتماعي", en: "Social" },
    // ===== الفوتر =====
  brand:      { ar: "حلول للتقنية", en: "Hulool Tech" },
  footerDesc: { ar: "أفضل الأجهزة التقنية بأسعار تنافسية وضمان أصلي.", en: "The best tech devices at competitive prices with genuine warranty." },
  links:      { ar: "روابط", en: "Links" },
  cart:       { ar: "السلة", en: "Cart" },
  contact:    { ar: "تواصل معنا", en: "Contact us" },
  copyright:  { ar: "© 2026 حلول للتقنية. جميع الحقوق محفوظة.", en: "© 2026 Hulool Tech. All rights reserved." },
    // ===== الرئيسية =====
  heroTitle: { ar: "كل اللي تحتاجه من التقنية، بمكان واحد", en: "Everything tech you need, in one place" },
  heroText:  { ar: "جوالات، سماعات، وشواحن أصلية بأسعار تنافسية وتوصيل سريع 🚚", en: "Genuine phones, headphones and chargers at great prices with fast delivery 🚚" },
  shopNow:   { ar: "تسوّق الحين", en: "Shop now" },
  ourProducts: { ar: "منتجاتنا", en: "Our products" },
  searchPh:  { ar: "ابحث عن المنتج...🔍", en: "Search for a product...🔍" },
    // ===== الترتيب والأقسام =====
  sortDefault: { ar: "الترتيب الافتراضي", en: "Default order" },
  sortLow:     { ar: "السعر: من الأقل للأعلى", en: "Price: low to high" },
  sortHigh:    { ar: "السعر: من الأعلى للأقل", en: "Price: high to low" },
  all:         { ar: "الكل", en: "All" },
  phones:      { ar: "جوالات", en: "Phones" },
  audio:       { ar: "سماعات", en: "Audio" },
  chargers:    { ar: "شواحن", en: "Chargers" },
  accessories: { ar: "إكسسوارات", en: "Accessories" },
    // ===== الحقيبة =====
  yourBag:    { ar: "سلتك", en: "Your bag" },
  couponPh:   { ar: "كود خصم", en: "Coupon code" },
  apply:      { ar: "تطبيق", en: "Apply" },
  totalLabel: { ar: "المجموع:", en: "Total:" },
  checkout:   { ar: "إتمام الطلب", en: "Checkout" },
    // ===== نصوص يكتبها JS =====
  emptyBag:  { ar: "سلتك فاضية", en: "Your bag is empty" },
  currency:  { ar: "ريال", en: "SAR" },
  couponOk:  { ar: "تم تطبيق خصم 10% ✅", en: "10% discount applied ✅" },
  couponBad: { ar: "الكود غير صحيح ❌", en: "Invalid code ❌" },
};

// 3) الدالة t (أول حرف من translate = ترجم)
// تعطيها مفتاح، وترجع لك النص باللغة الحالية
// بنستخدمها بعدين داخل ملفات JS، مثل رسالة "سلتك فاضية"
function t(key) {
  const entry = translations[key];
  if (!entry) return key; // المفتاح مو موجود بالقاموس؟ نرجعه زي ما هو عشان نلاحظ الغلط
  return entry[lang];
}

// 4) لو اللغة إنجليزي: نقلب الصفحة ونبدل النصوص
if (lang === "en") {
  // 4.1) documentElement = وسم html نفسه
  // نغير اتجاهه من اليمين لليسار، ولغته لـ en
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";

  // 4.2) نمسك كل عنصر عليه data-i18n، ونحط مكان نصه الترجمة من القاموس
  // مثال: data-i18n="home" ← يصير نصه Home
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });
    // 4.3) نفس الفكرة بس للنص الرمادي داخل الخانات (placeholder)
  // مثال: data-i18n-placeholder="searchPh" ← يصير النص الرمادي Search for a product
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}


// 5) رابط تبديل اللغة بالفوتر (id="lang-link")
// الضغط عليه يقلب اللغة، يحفظها بالدفتر، ويحدّث الصفحة
const langLink = document.getElementById("lang-link");

// if: عشان الكود ما يخرب بصفحة ما فيها الرابط
if (langLink) {

  // 5.1) نص الرابط يكون اللغة "الثانية" اللي تقدر تروح لها
  // لو الصفحة إنجليزي نكتب "العربية"، ولو عربي نكتب "English"
  if (lang === "en") {
    langLink.textContent = "🌐 العربية";
  } else {
    langLink.textContent = "🌐 English";
  }

  // 5.2) لما يضغط الرابط
  langLink.addEventListener("click", function (e) {
    e.preventDefault(); // نمنع الرابط من إنه يروح لـ # ويطلع فوق الصفحة

    // نحفظ اللغة العكسية: عربي ← en، إنجليزي ← ar
    if (lang === "en") {
      localStorage.setItem("lang", "ar");
    } else {
      localStorage.setItem("lang", "en");
    }

    // 5.3) نحدّث الصفحة، وأول ما تفتح lang.js يقرا اللغة الجديدة ويطبقها
    location.reload();
  });
}