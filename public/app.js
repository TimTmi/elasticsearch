const input = document.getElementById("search");
const results = document.getElementById("results");

let timer;

input.addEventListener("input", () => {
  clearTimeout(timer);

  const q = input.value;
  if (!q) {
    results.innerHTML = "";
    return;
  }

  timer = setTimeout(async () => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    results.innerHTML = data.map((r) => `<li>${r}</li>`).join("");
  }, 150);
});
