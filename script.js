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



// ===== الدارك مود =====

const themeBtn1 = document.getElementById("theme-btn");

themeBtn1.addEventListener("click", function () {
  document.body.classList.toggle("dark")


  if (document.body.classList.contains("dark")) {
    themeBtn1.textContent = '☀️';
    localStorage.setItem("theme", "dark");
  } else {
    themeBtn1.textContent = '🌙'
    localStorage.setItem("theme", "light");
  }
});


if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn1.textContent = '☀️';
}

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




// ===== السلة =====

const cartCount = document.getElementById("cart-count");
const addButtons = document.querySelectorAll(".product button");
const cartTotal = document.getElementById("cart-total");
const cartList = document.getElementById("cart-list");
let total = 0;
let count = 0;
let discount = 0;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
function renderCart() {
  cartList.innerHTML = "";
  count = 0;
  total = 0;

  cart.forEach(function (item) {
    cartList.innerHTML += `<li>
      ${item.name} × ${item.qty} = ${item.price * item.qty} ريال
      <button class="plus" data-id="${item.id}">+</button>
      <button class="minus" data-id="${item.id}">−</button>
    </li>`;

    count += item.qty;
    total += item.price * item.qty;
  });

  cartCount.textContent = "🛒" + count;
  const finalTotal = total - total * discount;
  cartTotal.textContent = finalTotal + " ريال";
  localStorage.setItem("cart", JSON.stringify(cart));
}
addButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const id = Number(btn.dataset.id);
    const product = products.find(function (p) {
      return p.id === id;
    });
    const item = cart.find(function (c) {
      return c.id === id;
    });

    if (item) {
      item.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    renderCart();
  });
});

cartList.addEventListener("click", function (e) {
  const id = Number(e.target.dataset.id);
  const item = cart.find(function (c) {
    return c.id === id;
  });
  if (!item) return;

  if (e.target.classList.contains("plus")) {
    item.qty += 1;
  }
  if (e.target.classList.contains("minus")) {
    item.qty -= 1;
  }

  if (item.qty === 0) {
    cart = cart.filter(function (c) {
      return c.id !== id;
    });
    renderCart();
  }
});
renderCart();


// ===== كود الخصم =====
const couponInput = document.getElementById("coupon-input");
const couponBtn = document.getElementById("coupon-btn");
const couponMsg = document.getElementById("coupon-msg");

couponBtn.addEventListener("click", function () {
  const code = couponInput.value.trim().toUpperCase();

  if (code === "SULTAN10") {
    discount = 0.1;
    couponMsg.textContent = "تم تطبيق خصم 10% ✅";
  } else {
    discount = 0;
    couponMsg.textContent = "الكود غير صحيح ❌";
  }
    renderCart();
});

// ===== البحث =====
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", function () {
  const word = searchInput.value;

  productCarts.forEach(function (card) {
    const name = card.querySelector("h3").textContent;

    if (name.includes(word)) {
      card.hidden = false;
    } else {
      card.hidden = true;
    }
  });
});


// ===== الترتيب =====
const sortSelect = document.getElementById("sort");

sortSelect.addEventListener("change", function () {
  const choice = sortSelect.value;
  const cards = Array.from(productCarts);

  cards.sort(function (a, b) {
    const priceA = Number(a.querySelector("button").dataset.price);
    const priceB = Number(b.querySelector("button").dataset.price);
    const idA = Number(a.querySelector("button").dataset.id);
    const idB = Number(b.querySelector("button").dataset.id);

    if (choice === "low") return priceA - priceB;
    if (choice === "high") return priceB - priceA;
    return idA - idB;
  });

  cards.forEach(function (card) {
    productList.appendChild(card);
  });
});


window.addEventListener("pageshow", function (event) {
  if (event.persisted) location.reload();
});