const input = document.getElementById("search");
const ghost = document.getElementById("ghost");
const results = document.getElementById("results");

let timer;
let controller;

input.addEventListener("input", () => {
  clearTimeout(timer);

  if (controller) controller.abort();
  controller = new AbortController();

  const q = input.value.trim();

  if (!q) {
    results.innerHTML = "";
    ghost.value = "";
    return;
  }

  timer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });

      const data = await res.json();

      results.innerHTML = "";
      data.forEach((r) => {
        const li = document.createElement("li");
        li.textContent = r;
        results.appendChild(li);
      });

      const first = data[0];

      if (first && first.toLowerCase().startsWith(q.toLowerCase())) {
        ghost.value = q + first.slice(q.length);
      } else {
        ghost.value = "";
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error(err);
    }
  }, 150);
});

input.addEventListener("keydown", (e) => {
  if ((e.key === "Tab" || e.key === "ArrowRight") && ghost.value) {
    e.preventDefault();
    input.value = ghost.value;
    ghost.value = "";
    results.innerHTML = "";
  }
});

results.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    input.value = e.target.textContent;
    ghost.value = "";
    results.innerHTML = "";
  }
});
