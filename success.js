if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

const order = JSON.parse(localStorage.getItem("lastOrder"));
const successMessage = document.getElementById("success-message");

if (order) {
  successMessage.textContent = `شكراً ${order.name}، رقم طلبك #${order.number} بمجموع ${order.total} ريال. بنوصله لك في ${order.city} 🚚`;
} else {
  successMessage.textContent = "ما فيه طلب حالياً.";
}