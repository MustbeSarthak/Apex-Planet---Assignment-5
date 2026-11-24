document.addEventListener("DOMContentLoaded", () => {
  initShell();
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "post") initPostPage();
  if (page === "editor") initEditor();
  if (page === "login") initLogin();
  if (page === "register") initRegister();
});

async function initHome() {
  const grid = document.querySelector("[data-post-grid]");
  const status = document.querySelector("[data-list-status]");
  const search = document.querySelector("[data-search]");
  const category = document.querySelector("[data-category]");
  const sort = document.querySelector("[data-sort]");
  const pagination = document.querySelector("[data-pagination]");
  let page = 1;

  async function load() {
    grid.innerHTML = "";
    status.hidden = false;
    status.textContent = "Loading posts...";
    try {
      const params = new URLSearchParams({
        page, limit: "6", sort: sort.value,
        ...(search.value ? { search: search.value } : {}),
        ...(category.value ? { category: category.value } : {})
      });
      const data = await apiRequest(`/posts?${params}`);
      status.hidden = data.posts.length > 0;
      if (!data.posts.length) status.textContent = "No posts found.";
      grid.innerHTML = data.posts.map((post) => `
        <article class="post-card">
          <a class="post-card-image" href="/post.html?id=${post._id}" aria-label="${escapeHtml(post.title)}">
            <img src="${escapeHtml(postImage(post))}" alt="Cover image for ${escapeHtml(post.title)}" width="900" height="500" loading="lazy">
          </a>
          <div class="post-card-body">
            <span class="eyebrow">${escapeHtml(post.category)}</span>
            <h2><a href="/post.html?id=${post._id}">${escapeHtml(post.title)}</a></h2>
            <p>${escapeHtml(post.content).slice(0, 150)}...</p>
            <div class="post-meta"><span>${escapeHtml(post.author?.name || "Unknown")}</span><span>${formatDate(post.createdAt)}</span></div>
          </div>
        </article>`).join("");
      pagination.innerHTML = "";
      for (let i = 1; i <= data.pages; i++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `page-button${i === data.page ? " active" : ""}`;
        button.textContent = i;
        button.addEventListener("click", () => { page = i; load(); });
        pagination.appendChild(button);
      }
    } catch (error) {
      status.textContent = error.message;
      status.hidden = false;
    }
  }

  search.addEventListener("input", () => { clearTimeout(search.timer); search.timer = setTimeout(() => { page = 1; load(); }, 350); });
  category.addEventListener("change", () => { page = 1; load(); });
  sort.addEventListener("change", () => { page = 1; load(); });
  load();
}

async function initPostPage() {
  const id = new URLSearchParams(location.search).get("id");
  const host = document.querySelector("[data-post]");
  const status = document.querySelector("[data-post-status]");
  if (!id) { status.textContent = "Post not found."; status.hidden = false; return; }

  try {
    const post = await apiRequest(`/posts/${id}`);
    const user = getUser();
    const isAuthor = user && post.author?._id === user.id;
    const liked = post.likes?.some((item) => (item._id || item) === user?.id);
    host.innerHTML = `
      <article class="article">
        <header class="article-header">
          <span class="eyebrow">${escapeHtml(post.category)}</span>
          <h1>${escapeHtml(post.title)}</h1>
          <div class="post-meta"><span>By ${escapeHtml(post.author?.name || "Unknown")}</span><span>${readingTime(post.content)} min read</span><span>${formatDate(post.createdAt)}</span></div>
          ${isAuthor ? `<div class="article-actions"><a class="button button-small" href="/editor.html?id=${post._id}">Edit</a><button class="button button-danger button-small" type="button" data-delete-post>Delete</button></div>` : ""}
        </header>
        ${post.coverImage ? `<img class="article-cover" src="${escapeHtml(postImage(post))}" alt="Cover image for ${escapeHtml(post.title)}" width="900" height="500" loading="lazy">` : ""}
        <div class="article-content">${escapeHtml(post.content).replace(/\n/g, "<br>")}</div>
        <button class="like-button ${liked ? "liked" : ""}" type="button" data-like ${isLoggedIn() ? "" : "disabled"} aria-pressed="${liked}">
          <span aria-hidden="true">♥</span> <span data-like-count>${post.likes?.length || 0}</span>
        </button>
        ${isLoggedIn() ? "" : '<p class="muted">Log in to like or comment.</p>'}
      </article>
      <section class="comments" aria-labelledby="comments-heading">
        <h2 id="comments-heading">Comments</h2>
        <div data-comment-status class="form-message" hidden></div>
        ${isLoggedIn() ? `<form id="comment-form" class="comment-form"><label for="comment-text">Add a comment</label><textarea id="comment-text" name="text" rows="3" required maxlength="1000"></textarea><button class="button" type="submit" data-comment-submit>Post comment</button></form>` : ""}
        <div data-comments></div>
      </section>`;

    host.querySelector("[data-delete-post]")?.addEventListener("click", async () => {
      if (!confirm("Delete this post? This cannot be undone.")) return;
      try { await apiRequest(`/posts/${id}`, { method: "DELETE" }); location.href = "/index.html"; }
      catch (error) { alert(error.message); }
    });
    host.querySelector("[data-like]")?.addEventListener("click", async (event) => {
      try {
        const result = await apiRequest(`/posts/${id}/like`, { method: "POST" });
        event.currentTarget.classList.toggle("liked", result.liked);
        event.currentTarget.setAttribute("aria-pressed", String(result.liked));
        host.querySelector("[data-like-count]").textContent = result.likes;
      } catch (error) { alert(error.message); }
    });

    loadComments(id);
    document.querySelector("#comment-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("[data-comment-submit]");
      const status = host.querySelector("[data-comment-status]");
      setLoading(button, true, "Posting...");
      try {
        await apiRequest(`/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ text: event.currentTarget.elements.text.value }) });
        event.currentTarget.reset();
        showMessage(status, "Comment posted.", "success");
        loadComments(id);
      } catch (error) { showMessage(status, error.message); }
      finally { setLoading(button, false); button.dataset.label = "Post comment"; }
    });
    status.hidden = true;
  } catch (error) {
    status.textContent = error.message;
    status.hidden = false;
  }
}

async function loadComments(postId) {
  const container = document.querySelector("[data-comments]");
  if (!container) return;
  const user = getUser();
  container.innerHTML = "<p>Loading comments...</p>";
  try {
    const comments = await apiRequest(`/posts/${postId}/comments`);
    container.innerHTML = comments.length ? comments.map((comment) => `
      <article class="comment">
        <div><strong>${escapeHtml(comment.author?.name || "Unknown")}</strong><time>${formatDate(comment.createdAt)}</time></div>
        <p>${escapeHtml(comment.text)}</p>
        ${user?.id === comment.author?._id ? `<button class="text-button" type="button" data-delete-comment="${comment._id}">Delete</button>` : ""}
      </article>`).join("") : "<p>No comments yet.</p>";
    container.querySelectorAll("[data-delete-comment]").forEach((button) => button.addEventListener("click", async () => {
      if (!confirm("Delete this comment?")) return;
      try { await apiRequest(`/comments/${button.dataset.deleteComment}`, { method: "DELETE" }); loadComments(postId); }
      catch (error) { alert(error.message); }
    }));
  } catch (error) { container.innerHTML = `<p class="form-message">${escapeHtml(error.message)}</p>`; }
}

async function initEditor() {
  if (!isLoggedIn()) { location.href = "/login.html"; return; }
  const form = document.querySelector("#post-form");
  const status = document.querySelector("[data-editor-status]");
  const id = new URLSearchParams(location.search).get("id");
  if (id) {
    try {
      const post = await apiRequest(`/posts/${id}`);
      if (post.author._id !== getUser().id) { location.href = "/post.html?id=" + id; return; }
      form.elements.title.value = post.title;
      form.elements.content.value = post.content;
      form.elements.category.value = post.category;
      form.elements.coverImage.value = post.coverImage;
      document.querySelector("[data-editor-title]").textContent = "Edit post";
    } catch (error) { showMessage(status, error.message); }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    setLoading(button, true, id ? "Saving..." : "Publishing...");
    const body = {
      title: form.elements.title.value,
      content: form.elements.content.value,
      category: form.elements.category.value,
      coverImage: form.elements.coverImage.value
    };
    try {
      const post = await apiRequest(id ? `/posts/${id}` : "/posts", {
        method: id ? "PUT" : "POST", body: JSON.stringify(body)
      });
      location.href = `/post.html?id=${post._id}`;
    } catch (error) { showMessage(status, error.message); setLoading(button, false); }
  });
}

function initLogin() {
  initAuthForm("login");
}
function initRegister() {
  initAuthForm("register");
}

function initAuthForm(mode) {
  if (isLoggedIn()) { location.href = "/index.html"; return; }
  const form = document.querySelector("#auth-form");
  const status = document.querySelector("[data-auth-status]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage(status, "Enter a valid email address");
      return;
    }
    if (password.length < 8) {
      showMessage(status, "Password must be at least 8 characters");
      return;
    }
    if (mode === "register" && form.elements.name.value.trim().length < 2) {
      showMessage(status, "Name must be at least 2 characters");
      return;
    }

    setLoading(button, true, mode === "register" ? "Creating account..." : "Logging in...");
    const body = mode === "register"
      ? { name: form.elements.name.value.trim(), email, password }
      : { email, password };
    try {
      const data = await apiRequest(`/auth/${mode}`, { method: "POST", body: JSON.stringify(body) });
      saveSession(data);
      location.href = "/index.html";
    } catch (error) {
      showMessage(status, error.message);
      setLoading(button, false);
    }
  });
}
