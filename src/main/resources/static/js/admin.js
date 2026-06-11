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
    localStorage.setItem(STORAGE_KEYS.visits, JSON.stringify([
      { id: 1, client: 'Asha K.', date: '2026-06-10', time: '11:30', message: 'Need site survey for home extension.', status: 'Pending' }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.content)) {
    localStorage.setItem(STORAGE_KEYS.content, JSON.stringify({ homepage: 'Premium construction and interior solutions for homes and offices.', about: 'We deliver transparent project planning, quality, and client-first service.', hero: 'Build better spaces with confidence.', cta: 'Get a free quote today.' }));
  }
}

function getLocal(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderDashboard() {
  const leads = getLocal(STORAGE_KEYS.leads);
  const visits = getLocal(STORAGE_KEYS.visits);
  const projects = getLocal(STORAGE_KEYS.projects).concat(getLocal('/api/projects') || []);
  const cards = [
    ['Total Leads', leads.length, 'All client inquiries'],
    ['New Leads', leads.filter(item => item.status === 'New').length, 'Fresh inquiries'],
    ['Projects Count', projects.length, 'Active + completed work'],
    ['Site Visits', visits.length, 'Scheduled visits'],
    ['Website Visitors', 128 + leads.length * 5, 'Estimated monthly traffic'],
    ['Recent Activity', '3 updates today', 'Leads + content changes']
  ];
  dashboardCards.innerHTML = cards.map(([label, value, note]) => `<article class="card"><p class="eyebrow">${label}</p><h3>${value}</h3><p class="muted">${note}</p></article>`).join('');
}

function renderLeads() {
  const leads = getLocal(STORAGE_KEYS.leads);
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

function updateLeadStatus(id, status) {
  const leads = getLocal(STORAGE_KEYS.leads);
  saveLocal(STORAGE_KEYS.leads, leads.map(item => item.id === id ? { ...item, status } : item));
  renderLeads();
  renderDashboard();
}

async function loadAdminItems() {
  if (!list) return;
  const response = await fetch('/api/projects');
  const apiItems = await response.json();
  const localItems = getLocal(STORAGE_KEYS.projects);
  const items = [...localItems, ...apiItems];
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
  const localItems = getLocal(STORAGE_KEYS.projects).filter(item => String(item.id || item.title) !== projectId);
  saveLocal(STORAGE_KEYS.projects, localItems);

  const numericId = Number(projectId);
  if (Number.isFinite(numericId) && String(numericId) === projectId) {
    try {
      const response = await fetch(`/api/projects/${numericId}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 404) {
        throw new Error('Delete failed');
      }
    } catch (error) {
      status.textContent = 'Project removed from local cache, but server delete failed.';
    }
  }

  await loadAdminItems();
}

function renderServices() {
  const services = getLocal(STORAGE_KEYS.services);
  serviceList.innerHTML = services.map(item => `<article class="card"><h3>${item.name}</h3><p>${item.description}</p><button class="button" onclick="deleteService(${item.id})">Delete</button></article>`).join('');
}

function deleteService(id) {
  const services = getLocal(STORAGE_KEYS.services).filter(item => item.id !== id);
  saveLocal(STORAGE_KEYS.services, services);
  renderServices();
}

function renderTestimonials() {
  const testimonials = getLocal(STORAGE_KEYS.testimonials);
  testimonialList.innerHTML = testimonials.map(item => `<article class="card"><h3>${item.name}</h3><p>${item.text}</p>${item.video ? `<p><a class="button" href="${item.video}" target="_blank">Watch video</a></p>` : ''}</article>`).join('');
}

function renderContacts() {
  const contacts = getLocal(STORAGE_KEYS.contacts);
  contactPreview.textContent = `Phone: ${contacts.phone || ''} • Email: ${contacts.email || ''} • Address: ${contacts.address || ''}`;
}

function renderVisits() {
  const visits = getLocal(STORAGE_KEYS.visits);
  visitList.innerHTML = visits.map(item => `<article class="card"><h3>${item.client}</h3><p>${item.date} ${item.time}</p><p>${item.message}</p><p class="muted">Status: ${item.status}</p><div class="cta-row"><button class="button" onclick="changeVisitStatus(${item.id}, 'Accepted')">Accept</button><button class="button" onclick="changeVisitStatus(${item.id}, 'Rejected')">Reject</button><button class="button" onclick="changeVisitStatus(${item.id}, 'Completed')">Complete</button></div></article>`).join('');
}

function changeVisitStatus(id, status) {
  const visits = getLocal(STORAGE_KEYS.visits).map(item => item.id === id ? { ...item, status } : item);
  saveLocal(STORAGE_KEYS.visits, visits);
  renderVisits();
  renderDashboard();
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

async function loadHeroBackground() {
  try {
    const response = await fetch('/api/projects/hero-background');
    if (!response.ok) return;
    const data = await response.json();
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
  const status = document.getElementById('heroBackgroundStatus');
  const file = input?.files?.[0];

  if (!file) {
    status.textContent = 'Please choose an image first.';
    return;
  }

  status.textContent = 'Uploading hero background...';
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/projects/hero-background', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    applyHeroBackground(data.imageUrl || '');
    updateHeroPreview(data.imageUrl || '');
    localStorage.setItem(STORAGE_KEYS.heroBackground, data.imageUrl || '');
    status.textContent = 'Homepage background image updated successfully.';
  } catch (error) {
    status.textContent = 'Unable to upload the hero background image.';
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
renderContacts();
renderVisits();
renderContent();
loadAdminItems();

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  status.textContent = 'Saving project...';
  try {
    const response = await fetch('/api/projects', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Failed to save');
    const saved = await response.json();
    const localProjects = getLocal(STORAGE_KEYS.projects);
    saveLocal(STORAGE_KEYS.projects, [...localProjects, { id: saved.id || Date.now(), ...Object.fromEntries(formData.entries()), location: formData.get('location') || '', budget: formData.get('budget') || '', timeline: formData.get('timeline') || '' }]);
    status.textContent = 'Project saved successfully.';
    form.reset();
    await loadAdminItems();
  } catch (error) {
    status.textContent = 'Something went wrong while saving the project.';
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

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  saveLocal(STORAGE_KEYS.contacts, {
    phone: document.getElementById('contactPhone').value || '+91 90000 00000',
    email: document.getElementById('contactEmail').value || 'hello@yourcompany.com',
    address: document.getElementById('contactAddress').value || 'Pune, Maharashtra',
    map: document.getElementById('contactMap').value || 'https://maps.google.com/'
  });
  renderContacts();
});

visitForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const visits = getLocal(STORAGE_KEYS.visits);
  visits.unshift({ id: Date.now(), client: document.getElementById('visitClient').value, date: document.getElementById('visitDate').value, time: document.getElementById('visitTime').value, message: document.getElementById('visitMessage').value, status: 'Pending' });
  saveLocal(STORAGE_KEYS.visits, visits);
  visitForm.reset();
  renderVisits();
  renderDashboard();
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
