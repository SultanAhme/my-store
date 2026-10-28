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
const products = document.querySelectorAll(".product");

buttons.forEach(function (btn){
    btn.addEventListener("click", function(){

        const filter=btn.dataset.filter;
        buttons.forEach(function (b){
            b.classList.remove("active")
        })
        btn.classList.add("active");

products.forEach(function(product){
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





