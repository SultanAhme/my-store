//  =======   v2   =======
const products = [
  { id: 1, name: "سماعة لاسلكية", price: 199, category: "audio", image: "https://picsum.photos/300/200?1", desc: "صوت نقي وبطارية تدوم ٢٠ ساعة." },
  { id: 2, name: "ايفون 17 برو ماكس", price: 3500, category: "phones", image: "https://picsum.photos/300/200?2", desc: "يتوفر كاش او اقساط" },
  { id: 3, name: "شاحن تايب سي 30واط", price: 95, category: "chargers", image: "https://picsum.photos/300/200?3", desc: "شاحن من شركة ابل" },
  { id: 4, name: "بطارية ايفون", price: 15, category: "accessories", image: "https://picsum.photos/300/200?4", desc: "بطارية" },
  { id: 5, name: "سوارة من شاومي", price: 199, category: "accessories", image: "https://picsum.photos/300/200?5", desc: "سوارة ذكية" },
  { id: 6, name: "كفر جوال من سامسنج", price: 250, category: "accessories", image: "https://picsum.photos/300/200?6", desc: "كفر" }
];



const productList = document.getElementById("product-list");
products.forEach(function (product) {
  productList.innerHTML += `
  <article class="product" data-category="${product.category}">
  <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>${product.desc}</p>
    <span class="price">${product.price} ريال</span>
    <button data-id="${product.id}" data-price="${product.price}" data-name="${product.name}">أضف للسلة</button>
  </article>
`;

});


    

// ===== الدارك مود =====

const themeBtn1 = document.getElementById("theme-btn");

themeBtn1.addEventListener("click", function(){
    document.body.classList.toggle("dark")
    

    if (document.body.classList.contains("dark")){
        themeBtn1.textContent ='☀️';
        localStorage.setItem("theme","dark");
    }else{
        themeBtn1.textContent ='🌙'
        localStorage.setItem("theme","light");
    }
});


if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn1.textContent = '☀️';
}

// ===== لون الازرار  =====
const buttons = document.querySelectorAll(".filter-btn");
const productCarts = document.querySelectorAll(".product");

buttons.forEach(function (btn){
    btn.addEventListener("click", function(){

        const filter=btn.dataset.filter;
        buttons.forEach(function (b){
            b.classList.remove("active")
        })
        btn.classList.add("active");

productCarts.forEach(function(product){
    if (filter === "all" || product.dataset.category === filter){
        product.hidden = false;
    }else{
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

addButtons.forEach(function(btn){
    btn.addEventListener("click", function(){
        count +=1;
        cartCount.textContent = "🛒" + count;

        total += Number(btn.dataset.price);
        cartTotal.textContent = total + " ريال";

        const name = btn.dataset.name;
        cartList.innerHTML += "<li>" + name + " - " + btn.dataset.price + "ريال </li>"
    });
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