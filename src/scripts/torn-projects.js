const root = document.getElementById("featured-work");
const projects = JSON.parse(
  root.querySelector("#torn-project-data").textContent,
);
const section = root.querySelector(".sequence");
const list = root.querySelector(".project-list");
const select = root.querySelector("select");
const sheet = root.querySelector(".sheet");
const photo = sheet.querySelector("img");
const backing = root.querySelector(".backing");
const note = root.querySelector(".note");
const description = root.querySelector(".description");
const steps = root.querySelector(".steps");
const reduced = matchMedia("(prefers-reduced-motion:reduce)");
let active = -1;
function torn(seed, top = true, bottom = true) {
  let s = seed;
  const random = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points = [];
  for (let i = 0; i <= 26; i++)
    points.push(`${(i / 26) * 100}% ${top ? 2.2 + random() * 3.2 : 0}%`);
  for (let i = 26; i >= 0; i--)
    points.push(`${(i / 26) * 100}% ${bottom ? 97.8 - random() * 3.2 : 100}%`);
  return `polygon(${points.join(",")})`;
}
list
  .querySelectorAll("button")
  .forEach((button, i) => button.addEventListener("click", () => jump(i)));
function show(index) {
  if (index === active) return;
  active = index;
  const project = projects[index];
  list
    .querySelectorAll("button")
    .forEach((button, i) =>
      button.setAttribute("aria-current", String(i === index)),
    );
  select.value = index;
  photo.src = project.image;
  photo.alt = project.alt;
  root
    .querySelector(".art-preview")
    .setAttribute("aria-label", "Enlarge preview: " + project.title);
  sheet.style.clipPath = torn(17 + index * 31);
  backing.style.clipPath = torn(101 + index * 13, true, false);
  backing.style.background = project.paper;
  note.querySelector("p").textContent = project.label;
  note.querySelector(".tools").textContent = project.tools;
  note.querySelector("a").href = project.url;
  description.querySelector("h2").textContent = project.title;
  description.querySelector("p").textContent = project.summary;
  [...steps.children].forEach((span, i) =>
    span.classList.toggle("active", i <= index),
  );
  sheet.classList.remove("reveal");
  description.classList.remove("arrive");
  void sheet.offsetWidth;
  sheet.classList.add("reveal");
  description.classList.add("arrive");
}
function jump(index) {
  if (innerWidth <= 560) {
    show(index);
    return;
  }
  const top = section.getBoundingClientRect().top + scrollY;
  const span = section.offsetHeight - innerHeight;
  scrollTo({
    top: top + (span * (index + 0.5)) / projects.length,
    behavior: reduced.matches ? "instant" : "smooth",
  });
}
function followScroll() {
  if (innerWidth <= 560) return;
  const progress = Math.max(
    0,
    Math.min(
      1,
      -section.getBoundingClientRect().top /
        (section.offsetHeight - innerHeight),
    ),
  );
  show(
    Math.min(
      projects.length - 1,
      Math.floor(progress * projects.length * 0.999),
    ),
  );
}
select.addEventListener("change", () => show(Number(select.value)));
let scheduled = false;
addEventListener(
  "scroll",
  () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      followScroll();
    });
  },
  { passive: true },
);
addEventListener("resize", followScroll);
show(0);

const dialog = root.querySelector("dialog");
let previousOverflow = "";
root.querySelector(".art-preview").addEventListener("click", () => {
  const project = projects[active];
  dialog.querySelector("h3").textContent = project.title;
  dialog.querySelector("img").src = project.image;
  dialog.querySelector("img").alt = project.alt;
  dialog.querySelector("a").href = project.url;
  previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";
  dialog.showModal();
});
dialog.querySelector("button").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.documentElement.style.overflow = previousOverflow;
});
