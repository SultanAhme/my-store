const cart = JSON.parse(localStorage.getItem("cart")) || [];
const orderSummary = document.getElementById("order-summary");
const orderTotal = document.getElementById("order-total");
let total = 0;

cart.forEach(function (item) {
    orderSummary.innerHTML += `<li>${item.name} × ${item.qty} = ${item.price * item.qty} ريال</li>`;
    total += item.price * item.qty;
});

orderTotal.textContent = "المجموع: " + total + " ريال";

const form = document.getElementById("checkout-form");

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const city = document.getElementById("city").value.trim();
    const address = document.getElementById("address").value.trim();

    let isValid = true;

    document.getElementById("name-error").textContent = "";

    if (name === "") {
        document.getElementById("name-error").textContent = "اكتب اسمك";
        isValid = false;
    }
    document.getElementById("phone-error").textContent = "";

    if (phone.length !== 10 || !phone.startsWith("05")) {
        document.getElementById("phone-error").textContent = "الجوال لازم 10 أرقام ويبدأ بـ 05";
        isValid = false;
    }
    //
    document.getElementById("city-error").textContent = "";

    if (city === "") {
        document.getElementById("city-error").textContent = "اكتب مدينتك";
        isValid = false;
    }

    document.getElementById("address-error").textContent = "";

    if (address === "") {
        document.getElementById("address-error").textContent = "اكتب عنوانك";
        isValid = false;
    }

    if (!isValid) {
        return;
    }
    const orderNumber = Math.floor(Math.random() * 90000) + 10000;

   const order = {
    number: orderNumber,
    name: name,
    phone: phone,
    city: city,
    address: address,
    total: total
  };

    localStorage.setItem("lastOrder", JSON.stringify(order));
    localStorage.removeItem("cart");

    window.location.href = "success.html";
});