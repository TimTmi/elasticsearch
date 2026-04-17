const input = document.getElementById("search");
const ghost = document.getElementById("ghost");
const results = document.getElementById("results");

let timer;

input.addEventListener("input", () => {
  clearTimeout(timer);

  const q = input.value;

  if (!q) {
    results.innerHTML = "";
    ghost.value = "";
    return;
  }

  timer = setTimeout(async () => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    results.innerHTML = data.map((r) => `<li>${r}</li>`).join("");

    const first = data[0];

    if (first && first.toLowerCase().startsWith(q.toLowerCase())) {
      ghost.value = q + first.slice(q.length);
    } else {
      ghost.value = "";
    }
  }, 150);
});

input.addEventListener("keydown", (e) => {
  if ((e.key === "Tab" || e.key === "ArrowRight") && ghost.value) {
    e.preventDefault();
    input.value = ghost.value;
    ghost.value = "";
  }
});

results.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    input.value = e.target.textContent;
    ghost.value = "";
    results.innerHTML = "";
  }
});
