const form = document.getElementById('projectForm');
const status = document.getElementById('statusMessage');
const list = document.getElementById('adminList');
const leadForm = document.getElementById('leadForm');
const leadList = document.getElementById('leadList');
const serviceForm = document.getElementById('serviceForm');
const serviceList = document.getElementById('serviceList');
const testimonialForm = document.getElementById('testimonialForm');
const testimonialList = document.getElementById('testimonialList');
const contactForm = document.getElementById('contactForm');
const contactPreview = document.getElementById('contactPreview');
const visitForm = document.getElementById('visitForm');
const visitList = document.getElementById('visitList');
const contentForm = document.getElementById('contentForm');
const dashboardCards = document.getElementById('dashboardCards');
const currentHeroPreview = document.getElementById('currentHeroPreview');
const heroPreviewStatus = document.getElementById('heroPreviewStatus');
const projectChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('construction-projects') : null;

const STORAGE_KEYS = {
  leads: 'crm_leads',
  heroBackground: 'crm_hero_bg',
  services: 'crm_services',
  testimonials: 'crm_testimonials',
  contacts: 'crm_contacts',
  visits: 'crm_visits',
  content: 'crm_content',
  projects: 'crm_projects'
};

let visitsCache = [];

function normalizeProject(item = {}) {
  return {
    ...item,
    id: item.id ?? item.projectId ?? item._id,
    title: item.title || item.name || 'Project',
    category: item.category || 'Construction',
    description: item.description || 'Project details available on request.',
    location: item.location || '',
    budget: item.budget || '',
    timeline: item.timeline || '',
    beforeImage: item.beforeImage || item.before_image || '',
    afterImage: item.afterImage || item.after_image || '',
    videoUrl: item.videoUrl || item.video_url || ''
  };
}

function getProjectsFromStorage() {
  return (getLocal(STORAGE_KEYS.projects) || []).map(normalizeProject);
}

function seedDefaults() {
  if (!localStorage.getItem(STORAGE_KEYS.leads)) {
    localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify([
      { id: 1, name: 'Rahul M.', phone: '9000000001', location: 'Pune', budget: '₹45–60 Lakhs', message: 'Needs villa renovation and premium interior work.', status: 'New' },
      { id: 2, name: 'Priya S.', phone: '9000000002', location: 'Mumbai', budget: '₹20–30 Lakhs', message: 'Asked for office interior and lighting design.', status: 'Contacted' }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.services)) {
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify([
      { id: 1, name: 'House Construction', description: 'New homes, structures, and premium finishes.' },
      { id: 2, name: 'Interior Work', description: 'Designer interiors, modular work, texture, and lighting.' }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.testimonials)) {
    localStorage.setItem(STORAGE_KEYS.testimonials, JSON.stringify([
      { id: 1, name: 'Anil D.', text: 'Excellent work quality and very smooth project updates.', video: '' }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.contacts)) {
    localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify({ phone: '+91 90000 00000', email: 'hello@yourcompany.com', address: 'Pune, Maharashtra', map: 'https://maps.google.com/' }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.visits)) {
    localStorage.setItem(STORAGE_KEYS.visits, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.content)) {
    localStorage.setItem(STORAGE_KEYS.content, JSON.stringify({ homepage: 'Premium construction and interior solutions for homes and offices.', about: 'We deliver transparent project planning, quality, and client-first service.', hero: 'Build better spaces with confidence.', cta: 'Get a free quote today.' }));
  }
}

function getLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    return [];
  }
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderDashboard() {
  const leads = getLocal(STORAGE_KEYS.leads);
  const visits = visitsCache.length ? visitsCache : getLocal(STORAGE_KEYS.visits);
  const projects = getProjectsFromStorage().concat(getLocal('/api/projects') || []);
  const cards = [
    ['Total Leads', leads.length, 'All client inquiries'],
    ['New Leads', leads.filter(item => item.status === 'New').length, 'Fresh inquiries'],
    ['Projects Count', projects.length, 'Active + completed work'],
    ['Site Visits', visits.length, 'Scheduled visits'],
    ['Website Visitors', 128 + leads.length * 5, 'Estimated monthly traffic'],
    ['Recent Activity', '3 updates today', 'Leads + content changes']
  ];
  if (dashboardCards) {
    dashboardCards.innerHTML = cards.map(([label, value, note]) => `<article class="card"><p class="eyebrow">${label}</p><h3>${value}</h3><p class="muted">${note}</p></article>`).join('');
  }
}

function renderLeads() {
  const leads = getLocal(STORAGE_KEYS.leads);
  if (!leadList) return;
  leadList.innerHTML = leads.map(item => `
    <article class="card">
      <h3>${item.name}</h3>
      <p class="muted">${item.phone} • ${item.location}</p>
      <p>${item.message}</p>
      <p>Budget: ${item.budget} • Status: <strong>${item.status}</strong></p>
      <div class="cta-row"><button class="button" onclick="updateLeadStatus(${item.id}, 'Contacted')">Contacted</button><button class="button" onclick="updateLeadStatus(${item.id}, 'Quotation Sent')">Quote</button></div>
    </article>
  `).join('');
}

function updateLeadStatus(id, nextStatus) {
  const leads = getLocal(STORAGE_KEYS.leads);
  saveLocal(STORAGE_KEYS.leads, leads.map(item => item.id === id ? { ...item, status: nextStatus } : item));
  renderLeads();
  renderDashboard();
}

async function loadAdminItems() {
  if (!list) return;

  let apiItems = [];
  try {
    const response = await fetch('/api/projects');
    if (response.ok) {
      apiItems = await response.json();
    }
  } catch (error) {
    apiItems = [];
  }

  const localItems = getProjectsFromStorage();
  const items = [...localItems, ...apiItems]
    .map(normalizeProject)
    .filter((item, index, array) => index === array.findIndex(candidate => String(candidate.id || candidate.title) === String(item.id || item.title)));

  list.innerHTML = items.length ? items.map(item => `
    <article class="card">
      <h3>${item.title}</h3>
      <p class="muted">${item.category}</p>
      <p>${item.description}</p>
      <p class="muted">${item.location ? `Location: ${item.location}` : ''}${item.budget ? ` • Budget: ${item.budget}` : ''}${item.timeline ? ` • Timeline: ${item.timeline}` : ''}</p>
      <div class="grid">${item.beforeImage ? `<img src="${item.beforeImage}" alt="Before image" />` : ''}${item.afterImage ? `<img src="${item.afterImage}" alt="After image" />` : ''}</div>
      ${item.videoUrl ? `<p><a class="button" href="${item.videoUrl}" target="_blank">Open video</a></p>` : ''}
      <button class="button" onclick="deleteProject('${item.id || item.title}')">Delete</button>
    </article>
  `).join('') : '<p class="muted">No project entries yet.</p>';
  renderDashboard();
}

async function deleteProject(id) {
  const projectId = String(id);
  const localItems = getProjectsFromStorage().filter(item => String(item.id || item.title) !== projectId);
  saveLocal(STORAGE_KEYS.projects, localItems);

  const numericId = Number(projectId);
  if (Number.isFinite(numericId) && String(numericId) === projectId) {
    try {
      const response = await fetch(`/api/projects/${numericId}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) {
        throw new Error('Delete failed');
      }
    } catch (error) {
      if (status) {
        status.textContent = 'Project removed from local cache, but server delete failed.';
      }
    }
  }

  await loadAdminItems();
}

function renderServices() {
  const services = getLocal(STORAGE_KEYS.services);
  if (!serviceList) return;
  serviceList.innerHTML = services.map(item => `<article class="card"><h3>${item.name}</h3><p>${item.description}</p><button class="button" onclick="deleteService(${item.id})">Delete</button></article>`).join('');
}

function deleteService(id) {
  const services = getLocal(STORAGE_KEYS.services).filter(item => item.id !== id);
  saveLocal(STORAGE_KEYS.services, services);
  renderServices();
}

function renderTestimonials() {
  const testimonials = getLocal(STORAGE_KEYS.testimonials);
  if (!testimonialList) return;
  testimonialList.innerHTML = testimonials.map(item => `<article class="card"><h3>${item.name}</h3><p>${item.text}</p>${item.video ? `<p><a class="button" href="${item.video}" target="_blank">Watch video</a></p>` : ''}</article>`).join('');
}

function renderContacts() {
  const contacts = getLocal(STORAGE_KEYS.contacts);
  if (contactPreview) {
    contactPreview.textContent = `Phone: ${contacts.phone || ''} • Email: ${contacts.email || ''} • Address: ${contacts.address || ''}`;
  }
}

async function loadContactsFromAPI() {
  try {
    const response = await fetch('/api/contact');
    if (!response.ok) return;
    const data = await response.json();
    document.getElementById('contactPhone').value = data.phone || '+91 90000 00000';
    document.getElementById('contactEmail').value = data.email || 'hello@yourcompany.com';
    document.getElementById('contactAddress').value = data.address || 'Pune, Maharashtra';
    document.getElementById('contactMap').value = data.mapUrl || 'https://maps.google.com/';
    renderContacts();
  } catch (error) {
    console.log('Using default contact info');
  }
}

function renderVisits() {
  if (!visitList) return;
  const visits = visitsCache.length ? visitsCache : getLocal(STORAGE_KEYS.visits);
  visitList.innerHTML = visits.length ? visits.map(item => `
    <article class="card">
      <h3>${item.clientName || item.client || 'Visit booking'}</h3>
      <p class="muted">${item.phone || ''}${item.email ? ` • ${item.email}` : ''}</p>
      <p>${item.visitDate || item.date || ''}${item.visitTime || item.time ? ` ${item.visitTime || item.time}` : ''}</p>
      <p>${item.siteAddress || item.address || ''}</p>
      <p>${item.message || ''}</p>
      <p class="muted">Status: ${item.status || 'Pending'}</p>
      <div class="cta-row"><button class="button" onclick="changeVisitStatus(${item.id}, 'Accepted')">Accept</button><button class="button" onclick="changeVisitStatus(${item.id}, 'Rejected')">Reject</button><button class="button" onclick="changeVisitStatus(${item.id}, 'Completed')">Complete</button></div>
    </article>
  `).join('') : '<p class="muted">No site visit bookings yet.</p>';
}

function changeVisitStatus(id, nextStatus) {
  fetch(`/api/visits/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: nextStatus })
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Update failed');
      }
      const saved = await response.json();
      visitsCache = visitsCache.map(item => item.id === saved.id ? saved : item);
      renderVisits();
      renderDashboard();
    })
    .catch(() => {
      const visits = getLocal(STORAGE_KEYS.visits).map(item => item.id === id ? { ...item, status: nextStatus } : item);
      saveLocal(STORAGE_KEYS.visits, visits);
      renderVisits();
      renderDashboard();
    });
}

async function loadVisitsFromAPI() {
  try {
    const response = await fetch('/api/visits');
    if (!response.ok) return;
    visitsCache = await response.json();
    saveLocal(STORAGE_KEYS.visits, visitsCache);
    renderVisits();
    renderDashboard();
  } catch (error) {
    visitsCache = getLocal(STORAGE_KEYS.visits);
  }
}

function applyHeroBackground(url) {
  if (!url) return;
  document.documentElement.style.setProperty('--hero-bg-url', `url('${url}')`);
  localStorage.setItem(STORAGE_KEYS.heroBackground, url);
}

function updateHeroPreview(url) {
  if (!currentHeroPreview || !heroPreviewStatus) return;

  if (url) {
    currentHeroPreview.hidden = false;
    currentHeroPreview.src = url;
    heroPreviewStatus.textContent = 'This is the current homepage hero image.';
    return;
  }

  currentHeroPreview.hidden = true;
  currentHeroPreview.removeAttribute('src');
  heroPreviewStatus.textContent = 'No hero image selected yet.';
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function loadHeroBackground() {
  try {
    const response = await fetch('/api/projects/hero-background');
    if (!response.ok) return;
    const data = await parseResponseBody(response);
    if (data?.imageUrl) {
      applyHeroBackground(data.imageUrl);
      updateHeroPreview(data.imageUrl);
    } else {
      updateHeroPreview('');
    }
  } catch (error) {
    const savedHeroBackground = localStorage.getItem(STORAGE_KEYS.heroBackground);
    if (savedHeroBackground) {
      applyHeroBackground(savedHeroBackground);
      updateHeroPreview(savedHeroBackground);
    }
  }
}

async function uploadHeroBackground() {
  const input = document.getElementById('heroBackgroundInput');
  const heroStatus = document.getElementById('heroBackgroundStatus');
  const file = input?.files?.[0];

  if (!file) {
    heroStatus.textContent = 'Please choose an image first.';
    return;
  }

  heroStatus.textContent = 'Uploading hero background...';
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/projects/hero-background', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });
    const data = await parseResponseBody(response);
    if (!response.ok) throw new Error(data?.message || data?.error || response.statusText || 'Upload failed');
    applyHeroBackground(data.imageUrl || '');
    updateHeroPreview(data.imageUrl || '');
    localStorage.setItem(STORAGE_KEYS.heroBackground, data.imageUrl || '');
    heroStatus.textContent = 'Homepage background image updated successfully.';
  } catch (error) {
    heroStatus.textContent = error?.message || 'Unable to upload the hero background image.';
  }
}

function renderContent() {
  const content = getLocal(STORAGE_KEYS.content);
  document.getElementById('homepageContent').value = content.homepage || '';
  document.getElementById('aboutContent').value = content.about || '';
  document.getElementById('heroText').value = content.hero || '';
  document.getElementById('ctaText').value = content.cta || '';
}

seedDefaults();
loadHeroBackground();
updateHeroPreview(localStorage.getItem(STORAGE_KEYS.heroBackground) || '');
renderDashboard();
renderLeads();
renderServices();
renderTestimonials();
loadContactsFromAPI();
loadVisitsFromAPI();
renderContent();
loadAdminItems();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  if (status) {
    status.textContent = 'Saving project...';
  }
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });
    const data = await parseResponseBody(response);
    if (!response.ok) {
      throw new Error(data?.message || data?.error || response.statusText || 'Failed to save the project');
    }
    const localProjects = getProjectsFromStorage();
    const savedProject = normalizeProject({
      id: data.id || Date.now(),
      ...data,
      location: formData.get('location') || '',
      budget: formData.get('budget') || '',
      timeline: formData.get('timeline') || '',
      videoUrl: formData.get('videoUrl') || ''
    });
    const projectList = [savedProject, ...localProjects.filter(item => String(item.id || item.title) !== String(savedProject.id || savedProject.title))];
    saveLocal(STORAGE_KEYS.projects, projectList);
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projectList));
    projectChannel?.postMessage({ type: 'projects-updated', project: savedProject });
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.projects }));
    if (status) {
      status.textContent = 'Project saved successfully.';
    }
    form.reset();
    await loadAdminItems();
  } catch (error) {
    const message = error?.message || 'Something went wrong while saving the project.';
    if (status) {
      status.textContent = message;
    }
    console.error('Project save error:', message, error);
  }
});

leadForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const leads = getLocal(STORAGE_KEYS.leads);
  leads.unshift({ id: Date.now(), name: formData.get('name'), phone: formData.get('phone'), location: formData.get('location'), budget: formData.get('budget'), message: formData.get('message'), status: formData.get('status') || 'New' });
  saveLocal(STORAGE_KEYS.leads, leads);
  leadForm.reset();
  renderLeads();
  renderDashboard();
});

serviceForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const services = getLocal(STORAGE_KEYS.services);
  services.unshift({ id: Date.now(), name: document.getElementById('serviceName').value, description: document.getElementById('serviceDesc').value });
  saveLocal(STORAGE_KEYS.services, services);
  serviceForm.reset();
  renderServices();
});

testimonialForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const testimonials = getLocal(STORAGE_KEYS.testimonials);
  testimonials.unshift({ id: Date.now(), name: document.getElementById('reviewName').value, text: document.getElementById('reviewText').value, video: document.getElementById('reviewVideo').value });
  saveLocal(STORAGE_KEYS.testimonials, testimonials);
  testimonialForm.reset();
  renderTestimonials();
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const contactData = {
    phone: document.getElementById('contactPhone').value || '+91 90000 00000',
    email: document.getElementById('contactEmail').value || 'hello@yourcompany.com',
    address: document.getElementById('contactAddress').value || 'Pune, Maharashtra',
    mapUrl: document.getElementById('contactMap').value || 'https://maps.google.com/'
  };

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (response.ok) {
      saveLocal(STORAGE_KEYS.contacts, contactData);
      renderContacts();
      alert('Contact information updated successfully!');
    } else {
      throw new Error('Failed to save');
    }
  } catch (error) {
    console.error('Error saving contact:', error);
    alert('Error saving contact information');
  }
});

visitForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const booking = {
    clientName: document.getElementById('visitClient').value,
    phone: document.getElementById('visitPhone').value,
    email: document.getElementById('visitEmail').value,
    visitDate: document.getElementById('visitDate').value,
    visitTime: document.getElementById('visitTime').value,
    siteAddress: document.getElementById('visitAddress').value,
    message: document.getElementById('visitMessage').value,
    status: 'Pending'
  };

  fetch('/api/visits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(booking)
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to save');
      }
      const saved = await response.json();
      visitsCache.unshift(saved);
      saveLocal(STORAGE_KEYS.visits, visitsCache);
      visitForm.reset();
      renderVisits();
      renderDashboard();
    })
    .catch(() => {
      const visits = getLocal(STORAGE_KEYS.visits);
      visits.unshift({ id: Date.now(), ...booking });
      saveLocal(STORAGE_KEYS.visits, visits);
      visitForm.reset();
      renderVisits();
      renderDashboard();
    });
});

document.getElementById('heroBackgroundUpload')?.addEventListener('click', uploadHeroBackground);

contentForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  saveLocal(STORAGE_KEYS.content, {
    homepage: document.getElementById('homepageContent').value,
    about: document.getElementById('aboutContent').value,
    hero: document.getElementById('heroText').value,
    cta: document.getElementById('ctaText').value
  });
  renderContent();
});
