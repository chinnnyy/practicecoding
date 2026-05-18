const filters = document.querySelectorAll(".filter");
const menuCards = document.querySelectorAll(".menu-card");
const reserveForm = document.querySelector(".reserve-form");
const formMessage = document.querySelector(".form-message");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    menuCards.forEach((card) => {
      const shouldShow = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("hidden", !shouldShow);
    });
  });
});

reserveForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(reserveForm);
  const name = data.get("name").trim();
  const date = data.get("date");
  const guests = data.get("guests");

  formMessage.textContent = `Thanks, ${name}. Table request for ${guests} on ${date} received.`;
  reserveForm.reset();
});
