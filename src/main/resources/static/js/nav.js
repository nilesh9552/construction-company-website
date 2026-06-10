const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

const translations = {
  en: {
    brand: 'Vighnaharta Construction & Interiors',
    nav: {
      Home: 'Home',
      About: 'About',
      Services: 'Services',
      Projects: 'Projects',
      Estimate: 'Estimate',
      Contact: 'Contact',
      Admin: 'Admin Panel',
      'Admin Panel': 'Admin Panel',
      Language: 'Language'
    },
    copy: {
      'आमच्या सेवा': 'Our Services',
      'अलीकडील कामे': 'Recent Work',
      'मला तुमचा प्रोजेक्ट पाहायचा आहे': 'I want to see your project',
      'तुमच्या घराच्या बांधकाम, Interior Design किंवा Renovation साठी आजच हमीशुदा अंदाज व quotation मिळवा.': 'Get a simple estimate for your home work today.',
      'Get Free Quote': 'Get Free Quote',
      'Why Choose Us?': 'Why Choose Us?',
      'Why clients trust us': 'Why people choose us',
      'Call Now': 'Call Now',
      'WhatsApp': 'WhatsApp',
      'Go to admin page': 'Go to admin page',
      'All rights reserved.': 'All rights reserved.'
    }
  },
  mr: {
    brand: 'Vighnaharta Construction & Interiors',
    nav: {
      Home: 'मुख्यपृष्ठ',
      About: 'आमच्याविषयी',
      Services: 'सेवा',
      Projects: 'प्रकल्प',
      Estimate: 'अंदाज',
      Contact: 'संपर्क',
      Admin: 'प्रशासन',
      'Admin Panel': 'प्रशासन पॅनेल',
      Language: 'भाषा'
    },
    copy: {
      'Our Services': 'आमच्या सेवा',
      'Recent Projects': 'अलीकडील कामे',
      'I would love to see your project': 'मला तुमचा प्रोजेक्ट पाहायचा आहे',
      'Get a reliable estimate and quotation for your home construction, interior design, or renovation today.': 'तुमच्या घराच्या कामासाठी आजच साधा अंदाज घ्या.',
      'Get Free Quote': 'मुफ्त कोटेशन मिळवा',
      'Why Choose Us?': 'आम्हाला का निवडावे?',
      'Why clients trust us': 'लोक आमचा विश्वास का करतात',
      'Call Now': 'आता फोन करा',
      'WhatsApp': 'व्हॉट्सअॅप',
      'Go to admin page': 'प्रशासन पृष्ठावर जा',
      'All rights reserved.': 'सर्व हक्क राखीव.'
    }
  },
  hi: {
    brand: 'Vighnaharta Construction & Interiors',
    nav: {
      Home: 'मुखपृष्ठ',
      About: 'हमारे बारे में',
      Services: 'सेवाएँ',
      Projects: 'परियोजनाएँ',
      Estimate: 'अनुमान',
      Contact: 'संपर्क',
      Admin: 'प्रशासन',
      'Admin Panel': 'प्रशासन पैनल',
      Language: 'भाषा'
    },
    copy: {
      'Our Services': 'हमारी सेवाएँ',
      'Recent Projects': 'हाल के काम',
      'I would love to see your project': 'मैं आपका प्रोजेक्ट देखना चाहता हूँ',
      'Get a reliable estimate and quotation for your home construction, interior design, or renovation today.': 'अपने घर के काम के लिए आज ही आसान अनुमान लें।',
      'Get Free Quote': 'मुफ़्त कोटेशन लें',
      'Why Choose Us?': 'हमें क्यों चुनें?',
      'Why clients trust us': 'लोग हम पर क्यों भरोसा करते हैं',
      'Call Now': 'अभी कॉल करें',
      'WhatsApp': 'व्हाट्सऐप',
      'Go to admin page': 'एडमिन पेज पर जाएँ',
      'All rights reserved.': 'सर्वाधिकार सुरक्षित।'
    }
  }
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceVisibleText(language) {
  const map = { ...translations[language].nav, ...translations[language].copy };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    if (!node.textContent || !node.textContent.trim()) return;

    let updated = node.textContent;
    Object.entries(map).forEach(([from, to]) => {
      updated = updated.replace(new RegExp(escapeRegExp(from), 'g'), to);
    });

    if (updated !== node.textContent) {
      node.textContent = updated;
    }
  });

  const brand = document.querySelector('.brand');
  if (brand) brand.textContent = translations[language].brand;

  document.querySelectorAll('.nav-link').forEach((link) => {
    const label = link.textContent.trim();
    if (translations[language].nav[label]) {
      link.textContent = translations[language].nav[label];
    }
  });

  document.querySelectorAll('.nav-cta').forEach((button) => {
    button.textContent = translations[language].nav['Admin Panel'];
  });
}

function ensureLanguageSelector() {
  const nav = document.querySelector('.nav');
  if (!nav || nav.querySelector('.lang-switch')) return;

  const currentLanguage = localStorage.getItem('siteLanguage') || 'en';
  const wrapper = document.createElement('div');
  wrapper.className = 'lang-switch-wrap';

  const label = document.createElement('label');
  label.className = 'lang-label';
  label.textContent = '🌐';

  const select = document.createElement('select');
  select.className = 'lang-switch';
  select.setAttribute('aria-label', 'Choose website language');
  select.innerHTML = [
    '<option value="en">EN</option>',
    '<option value="mr">MR</option>',
    '<option value="hi">HI</option>'
  ].join('');
  select.value = currentLanguage;

  select.addEventListener('change', (event) => {
    const nextLanguage = event.target.value;
    localStorage.setItem('siteLanguage', nextLanguage);
    replaceVisibleText(nextLanguage);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  nav.insertBefore(wrapper, nav.firstChild);
}

function addRevealEffects() {
  document.querySelectorAll('.reveal').forEach((element) => {
    element.classList.add('is-visible');
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }
}

function addSkeletonLoaders() {
  document.querySelectorAll('.cards, .projects-grid, .feature-grid').forEach((grid) => {
    if (grid.children.length === 0) {
      const placeholders = Array.from({ length: 3 }, () => {
        const card = document.createElement('article');
        card.className = 'card skeleton-card';
        return card;
      });
      placeholders.forEach((item) => grid.appendChild(item));
    }
  });
}

function setActiveLink() {
  const path = window.location.pathname;
  const hash = window.location.hash;
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isHomeLink = href === '/' || href === '#top';
    const isCurrentPage = href === path || (href === '/' && path === '/');
    const isHashMatch = hash && href.endsWith(hash);

    link.classList.toggle('active', isCurrentPage || isHashMatch || (isHomeLink && path === '/' && !hash));
  });
}

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initLanguage() {
  ensureLanguageSelector();
  const savedLanguage = localStorage.getItem('siteLanguage') || 'en';
  replaceVisibleText(savedLanguage);
  document.documentElement.lang = savedLanguage;
}

window.addEventListener('load', () => {
  initLanguage();
  setActiveLink();
  addRevealEffects();
  addSkeletonLoaders();
});
window.addEventListener('hashchange', setActiveLink);
initLanguage();
setActiveLink();
addRevealEffects();
addSkeletonLoaders();
