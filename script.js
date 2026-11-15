//  =======   v2   =======



const productList = document.getElementById("product-list");
products.forEach(function (product) {
  productList.innerHTML += `
  <article class="product" data-category="${product.category}">
  <img src="${product.image}" alt="${product.name}">
    <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
    <p>${product.desc}</p>
    <span class="price">${product.price} ريال</span>
    <button data-id="${product.id}" data-price="${product.price}" data-name="${product.name}">أضف للسلة</button>
  </article>
`;

});




// ===== لون الازرار  =====
const buttons = document.querySelectorAll(".filter-btn");
const productCarts = document.querySelectorAll(".product");

buttons.forEach(function (btn) {
  btn.addEventListener("click", function () {

    const filter = btn.dataset.filter;
    buttons.forEach(function (b) {
      b.classList.remove("active")
    })
    btn.classList.add("active");

    productCarts.forEach(function (product) {
      if (filter === "all" || product.dataset.category === filter) {
        product.hidden = false;
      } else {
        product.hidden = true;
      }
    });
  });

});


// =====================================================
// السلة: زر "أضف للسلة" في الصفحة الرئيسية
// السلة محفوظة في localStorage (مثل دفتر مشترك بين كل الصفحات)
// كل ضغطة: نقرا الدفتر ← نعدّل ← نحفظ ← نحدّث الحقيبة اللي فوق
// =====================================================

// نمسك كل أزرار "أضف للسلة" اللي داخل كروت المنتجات
const addButtons = document.querySelectorAll(".product button");

addButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {

    // 1) نعرف وش المنتج اللي انضغط زره (من data-id)
    const id = Number(btn.dataset.id);
    const product = products.find(function (p) {
      return p.id === id;
    });

    // 2) نقرا السلة من الدفتر (لو فاضي نبدأ بسلة فاضية [])
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // 3) نشوف: هل المنتج موجود بالسلة من قبل؟
    const item = cart.find(function (c) {
      return c.id === id;
    });

    if (item) {
      // موجود: نزيد كميته بس
      item.qty += 1;
    } else {
      // جديد: نضيفه بكمية 1
      cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    // 4) نحفظ السلة بالدفتر، وبعدها نحدّث الحقيبة (الترتيب مهم: نكتب أول بعدين نقرا)
    localStorage.setItem("cart", JSON.stringify(cart));
    updateBag(); // موجودة في theme.js
  });
});