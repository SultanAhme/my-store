

const cart = JSON.parse(localStorage.getItem("cart")) || [];
const orderSummary = document.getElementById("order-summary");
const orderTotal = document.getElementById("order-total");
let total = 0;

cart.forEach(function (item) {
    orderSummary.innerHTML += `<li>${item.name} × ${item.qty} = ${item.price * item.qty} ريال</li>`;
    total += item.price * item.qty;
});
const discount = Number(localStorage.getItem("discount")) || 0;
total = total - total * discount;
orderTotal.textContent = "المجموع: " + total + " ريال";
if (cart.length === 0) {
    orderSummary.innerHTML = "<li>سلتك فاضية 🛒</li>";
    orderTotal.textContent = "";
    document.getElementById("checkout-form").style.display = "none";
}
const form = document.getElementById("checkout-form");

form.addEventListener("submit", async function (event) {
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

      if (phone.length !== 10 || !phone.startsWith("05") || isNaN(phone)) {
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
 

    // ===============================================
    // إرسال الطلب للسيرفر بدل حفظه بالمتصفح بس
    // ===============================================

    // 1) نجهز "رأس" الطلب: نقول للسيرفر إن البيانات JSON
    const headers = { "Content-Type": "application/json" };

    // 2) لو الزبون مسجل دخول، نرسل كرته عشان السيرفر يربط الطلب بحسابه
    // ولو زائر ما فيه كرت، فيوصل الطلب بدون صاحب (وهذا عادي)
    const token = localStorage.getItem("token");
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    try {
        // 3) نرسل الطلب لشباك /api/orders بالسيرفر
        // cart: منتجات السلة اللي قريناها من localStorage بأول الملف
        // total: المجموع بعد الخصم اللي حسبناه فوق
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                name: name,
                phone: phone,
                city: city,
                address: address,
                items: cart,
                // نرسل كود الخصم (لو موجود) والسيرفر يحسب المجموع بنفسه
                coupon: localStorage.getItem("coupon")
            })
        });
        const data = await res.json();

        // 4) لو السيرفر رفض الطلب (مثلاً بيانات ناقصة) نعرض السبب ونوقف
        if (!res.ok) {
            alert(data.error);
            return;
        }

        // 5) نجح: نحفظ ملخص الطلب برقمه الحقيقي من القاعدة
        // صفحة النجاح (success.js) تقرا lastOrder وتعرض رقم الطلب منه
        const order = {
            number: data.orderId,
            name: name,
            phone: phone,
            city: city,
            address: address,
             // المجموع الحقيقي من السيرفر، مو اللي حسبه المتصفح
            total: data.total
        };
        localStorage.setItem("lastOrder", JSON.stringify(order));

        // 6) نفضّي السلة والخصم لأن الطلب خلص
        localStorage.removeItem("cart");
        localStorage.removeItem("coupon");
        // 7) نروح لصفحة النجاح
        window.location.href = "success.html";

    } catch (error) {
        // نوصل هنا لو السيرفر طافي أو ما قدرنا نوصله
        alert("ما قدرنا نرسل طلبك، تأكد إن السيرفر شغال وجرب مرة ثانية");
    }
});