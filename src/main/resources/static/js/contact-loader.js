async function loadContactInfo() {
  try {
    const response = await fetch('/api/contact');
    if (!response.ok) return;
    
    const contact = await response.json();
    const phoneValue = contact.phone || '+91 90000 00000';
    const emailValue = contact.email || 'hello@yourcompany.com';
    const addressValue = contact.address || 'Pune, Maharashtra';
    const mapUrlValue = contact.mapUrl || 'https://maps.google.com/';
    const phoneDigits = phoneValue.replace(/\D/g, '');
    
    const phoneLink = document.getElementById('contactPhoneLink') || document.querySelector('a[href^="tel:"]');
    if (phoneLink) {
      phoneLink.href = `tel:${phoneDigits}`;
      phoneLink.textContent = phoneValue;
    }
    
    const emailLink = document.getElementById('contactEmailLink') || document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      emailLink.href = `mailto:${emailValue}`;
      emailLink.textContent = emailValue;
    }
    
    const whatsappLink = document.getElementById('contactWhatsappLink') || document.querySelector('a[href^="https://wa.me"]');
    if (whatsappLink) {
      whatsappLink.href = `https://wa.me/${phoneDigits}`;
    }
    
    const addressText = document.getElementById('contactAddressText');
    if (addressText) {
      addressText.textContent = addressValue;
    }
    
    const mapLink = document.getElementById('contactMapLink');
    if (mapLink) {
      mapLink.href = mapUrlValue;
      mapLink.textContent = mapUrlValue;
    }

    const callButton = document.querySelector('a.call[href^="tel:"]');
    if (callButton) {
      callButton.href = `tel:${phoneDigits}`;
    }
    
    const floatingWhatsapp = document.querySelector('a.floating-button[href^="https://wa.me"]');
    if (floatingWhatsapp) {
      floatingWhatsapp.href = `https://wa.me/${phoneDigits}`;
    }

    document.querySelectorAll('a[href^="https://wa.me"]').forEach((link) => {
      if (link !== floatingWhatsapp && link !== whatsappLink) {
        link.href = `https://wa.me/${phoneDigits}`;
      }
    });
  } catch (error) {
    console.log('Using default contact info');
  }
}

// Load contact info when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContactInfo);
} else {
  loadContactInfo();
}
