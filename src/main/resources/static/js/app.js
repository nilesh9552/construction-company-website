function normalizeProject(item = {}) {
  return {
    ...item,
    title: item.title || item.name || 'Project',
    category: item.category || 'Construction',
    description: item.description || 'Project details available on request.',
    location: item.location || 'Not shared yet',
    budget: item.budget || 'Discuss during estimate',
    timeline: item.timeline || 'Depends on scope',
    beforeImage: item.beforeImage || item.before_image || '',
    afterImage: item.afterImage || item.after_image || '',
    imageUrl: item.imageUrl || item.image_url || ''
  };
}

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  try {
    const response = await fetch('/api/projects');
    const payload = await response.json();
    const projects = Array.isArray(payload) ? payload.map(normalizeProject) : [];
    const items = projects.length ? projects : getFeaturedProjects();
    grid.innerHTML = items.map(renderProject).join('');
  } catch (error) {
    grid.innerHTML = getFeaturedProjects().map(renderProject).join('');
  }
}

function renderProject(item) {
  const image = item.afterImage || item.beforeImage || item.imageUrl || '/images/backgrounds/Modern%20House%20Design%20%F0%9F%8F%A1.jpg';
  const title = escapeHtml(item.title || 'Project');
  const category = escapeHtml(item.category || 'Construction');
  const description = escapeHtml(item.description || 'Project details available on request.');
  const location = escapeHtml(item.location || 'Not shared yet');
  const budget = escapeHtml(item.budget || 'Discuss during estimate');
  const timeline = escapeHtml(item.timeline || 'Depends on scope');
  return `
    <article class="card project-card reveal" tabindex="0">
      <div class="project-media">
        <img src="${image}" alt="${title} project photo" loading="lazy" />
        <span class="project-tag">${category}</span>
      </div>
      <div class="project-overlay">
        <p class="meta">${category}</p>
        <h3>${title}</h3>
        <p>${description}</p>
        <dl class="project-facts">
          <div><dt>Location</dt><dd>${location}</dd></div>
          <div><dt>Budget</dt><dd>${budget}</dd></div>
          <div><dt>Timeline</dt><dd>${timeline}</dd></div>
        </dl>
        ${item.videoUrl ? `<p class="project-action"><a class="button" href="${escapeAttribute(item.videoUrl)}" target="_blank" rel="noreferrer">Watch video</a></p>` : ''}
      </div>
    </article>
  `;
}

function getFeaturedProjects() {
  return [
    {
      title: 'Villa Renovation',
      category: 'Renovation',
      description: 'Fresh interior finish, new lighting, and updated layout planning for a modern family home.',
      location: 'Pune',
      budget: '₹45–60 Lakhs',
      timeline: '5 months',
      imageUrl: '/images/backgrounds/Modern%20House%20Design%20%F0%9F%8F%A1.jpg'
    },
    {
      title: 'Office Interior',
      category: 'Interior Work',
      description: 'Clean workstations, ceiling detailing, and a bright finish that supports daily office use.',
      location: 'Mumbai',
      budget: '₹20–30 Lakhs',
      timeline: '8 weeks',
      imageUrl: '/images/backgrounds/Modern%20House%20Design%20%F0%9F%8F%A1.jpg'
    },
    {
      title: 'Home Build',
      category: 'House Construction',
      description: 'Full build with progress updates, strong structure work, and a careful handover process.',
      location: 'Nashik',
      budget: '₹80 Lakhs–1.2 Cr',
      timeline: '10 months',
      imageUrl: '/images/backgrounds/Modern%20House%20Design%20%F0%9F%8F%A1.jpg'
    },
    {
      title: 'Turnkey Project',
      category: 'Commercial Construction',
      description: 'Complete planning and execution with site coordination from the first drawing to the finish.',
      location: 'Navi Mumbai',
      budget: '₹1.5 Cr+',
      timeline: '12 months',
      imageUrl: '/images/backgrounds/Modern%20House%20Design%20%F0%9F%8F%A1.jpg'
    }
  ];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

loadProjects();
