console.log("صفحة المنتج شغالة ✅");
const params = new URLSearchParams(location.search);
const id = Number(params.get("id"));
console.log(id);
const product = products.find(p => p.id === id);
console.log(product);
const details = document.getElementById("product-details");
if (product) {
details.innerHTML = `
<img src="${product.image}" alt="${product.name}">
  <h1>${product.name}</h1>
  <p>${product.price} ريال</p>
  <p>${product.desc}</p>
  <button id="add-btn">أضف للسلة 🛒</button>
`
document.getElementById("add-btn").addEventListener("click", function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find(i => i.id === product.id);

  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  this.textContent = "انضاف ✅";
});
;

}
 else {
  details.innerHTML = `<p>المنتج غير موجود 😕</p><a href="index.html">رجوع للمتجر</a>`;
}