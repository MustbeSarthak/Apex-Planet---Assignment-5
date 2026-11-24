function getUser() {
  try { return JSON.parse(localStorage.getItem("blog_user")); } catch (_) { return null; }
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("blog_token") && getUser());
}

function saveSession(data) {
  localStorage.setItem("blog_token", data.token);
  localStorage.setItem("blog_user", JSON.stringify(data.user));
}

function logout() {
  localStorage.removeItem("blog_token");
  localStorage.removeItem("blog_user");
  window.location.href = "/index.html";
}

function escapeHtml(value) {
  const span = document.createElement("span");
  span.textContent = value ?? "";
  return span.innerHTML;
}

function renderNav() {
  const host = document.querySelector("[data-auth-nav]");
  if (!host) return;
  const user = getUser();
  host.innerHTML = user
    ? `<a class="button button-small" href="/editor.html">Write</a><button class="button button-ghost button-small" type="button" data-logout>Log out</button>`
    : `<a class="button button-ghost button-small" href="/login.html">Log in</a><a class="button button-small" href="/register.html">Register</a>`;
  host.querySelector("[data-logout]")?.addEventListener("click", logout);
}

function setLoading(button, loading, label = "Submitting") {
  if (!button) return;
  button.disabled = loading;
  button.textContent = loading ? label : button.dataset.label || "Submit";
}

function showMessage(element, message, type = "error") {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
  element.hidden = false;
}

function initTheme() {
  const saved = localStorage.getItem("blog_theme");
  const theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  const button = document.querySelector("[data-theme-toggle]");
  if (button) button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
}

function bindTheme() {
  const button = document.querySelector("[data-theme-toggle]");
  button?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("blog_theme", next);
    button.setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} theme`);
  });
}

function initShell() {
  initTheme();
  bindTheme();
  renderNav();
}
