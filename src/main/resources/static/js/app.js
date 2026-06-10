async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  try {
    const response = await fetch('/api/projects');
    const projects = await response.json();
    grid.innerHTML = projects.length ? projects.map(renderProject).join('') : '<p class="muted">No project uploads yet.</p>';
  } catch (error) {
    grid.innerHTML = '<p class="muted">Unable to load project gallery.</p>';
  }
}

function renderProject(item) {
  const beforeImage = item.beforeImage || 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#0f172a"/><stop offset="1" stop-color="#1e293b"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#e5eefb" font-family="Arial" font-size="30">Construction project preview</text></svg>');
  return `
    <article class="card project-card">
      <img src="${beforeImage}" alt="Before image" />
      <div class="body">
        <p class="meta">${item.category}</p>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <p class="muted">${item.location ? `Location: ${item.location}` : ''}${item.budget ? ` • Budget: ${item.budget}` : ''}${item.timeline ? ` • Timeline: ${item.timeline}` : ''}</p>
        ${item.afterImage ? `<img src="${item.afterImage}" alt="After image" style="margin-top: .75rem;" />` : ''}
        ${item.videoUrl ? `<p style="margin-top:.75rem;"><a class="button" href="${item.videoUrl}" target="_blank">Watch video</a></p>` : ''}
      </div>
    </article>
  `;
}

loadProjects();
