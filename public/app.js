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
      data.forEach((game) => {
        const li = document.createElement("li");

        li.textContent = game.name;
        li.dataset.genre = game.genre;
        li.dataset.year = game.year;

        results.appendChild(li);
      });

      const first = data[0];

      if (first && first.name.toLowerCase().startsWith(q.toLowerCase())) {
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
    const name = e.target.textContent;
    const genre = e.target.dataset.genre;
    const year = e.target.dataset.year;

    alert(`${name}\nGenre: ${genre}\nYear: ${year}`);
  }
});
