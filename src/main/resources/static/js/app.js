const PROJECTS_STORAGE_KEY = 'crm_projects';
const projectChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('construction-projects') : null;

function normalizeProject(item = {}) {
  return {
    ...item,
    id: item.id ?? item.projectId ?? item._id,
    title: item.title || item.name || 'Project',
    category: item.category || 'Construction',
    description: item.description || 'Project details available on request.',
    location: item.location || 'Not shared yet',
    budget: item.budget || 'Discuss during estimate',
    timeline: item.timeline || 'Depends on scope',
    beforeImage: item.beforeImage || item.before_image || '',
    afterImage: item.afterImage || item.after_image || '',
    imageUrl: item.imageUrl || item.image_url || '',
    videoUrl: item.videoUrl || item.video_url || ''
  };
}

function getProjectsFromStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.map(normalizeProject) : [];
  } catch (error) {
    return [];
  }
}

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const localProjects = getProjectsFromStorage();
  if (localProjects.length) {
    grid.innerHTML = localProjects.map(renderProject).join('');
  }

  try {
    const response = await fetch('/api/projects');
    const payload = await response.json();
    const apiProjects = Array.isArray(payload) ? payload.map(normalizeProject) : [];
    const mergedProjects = [...localProjects, ...apiProjects]
      .map(normalizeProject)
      .filter((item, index, array) => index === array.findIndex(candidate => String(candidate.id || candidate.title) === String(item.id || item.title)));
    const items = mergedProjects.length ? mergedProjects : getFeaturedProjects();
    grid.innerHTML = items.map(renderProject).join('');
  } catch (error) {
    const fallbackProjects = localProjects.length ? localProjects : getFeaturedProjects();
    grid.innerHTML = fallbackProjects.map(renderProject).join('');
  }
}

let projectsRefreshTimer = null;

function scheduleProjectsRefresh() {
  if (projectsRefreshTimer) {
    clearTimeout(projectsRefreshTimer);
  }
  projectsRefreshTimer = setTimeout(() => {
    loadProjects();
  }, 250);
}

function renderProject(item) {
  const image = item.afterImage || item.beforeImage || item.imageUrl || '/images/backgrounds/modern-house.jpg';
  const title = escapeHtml(item.title || 'Project');
  const category = escapeHtml(item.category || 'Construction');
  const description = escapeHtml(item.description || 'Project details available on request.');
  const location = escapeHtml(item.location || 'Not shared yet');
  const budget = escapeHtml(item.budget || 'Discuss during estimate');
  const timeline = escapeHtml(item.timeline || 'Depends on scope');
  return `
    <article class="card project-card" tabindex="0">
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
      imageUrl: '/images/backgrounds/modern-house.jpg'
    },
    {
      title: 'Office Interior',
      category: 'Interior Work',
      description: 'Clean workstations, ceiling detailing, and a bright finish that supports daily office use.',
      location: 'Mumbai',
      budget: '₹20–30 Lakhs',
      timeline: '8 weeks',
      imageUrl: '/images/backgrounds/modern-house.jpg'
    },
    {
      title: 'Home Build',
      category: 'House Construction',
      description: 'Full build with progress updates, strong structure work, and a careful handover process.',
      location: 'Nashik',
      budget: '₹80 Lakhs–1.2 Cr',
      timeline: '10 months',
      imageUrl: '/images/backgrounds/modern-house.jpg'
    },
    {
      title: 'Turnkey Project',
      category: 'Commercial Construction',
      description: 'Complete planning and execution with site coordination from the first drawing to the finish.',
      location: 'Navi Mumbai',
      budget: '₹1.5 Cr+',
      timeline: '12 months',
      imageUrl: '/images/backgrounds/modern-house.jpg'
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

function initializeProjectsPage() {
  loadProjects();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProjectsPage, { once: true });
} else {
  initializeProjectsPage();
}

window.addEventListener('pageshow', () => {
  initializeProjectsPage();
});

window.addEventListener('storage', (event) => {
  if (event.key === PROJECTS_STORAGE_KEY) {
    scheduleProjectsRefresh();
  }
});

projectChannel?.addEventListener('message', (event) => {
  if (event.data?.type === 'projects-updated') {
    scheduleProjectsRefresh();
  }
});

setInterval(() => {
  loadProjects();
}, 5000);
