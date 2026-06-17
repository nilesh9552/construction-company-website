const visitForm = document.getElementById('visitForm');

visitForm?.addEventListener('submit', async (event) => {
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

  const submitButton = visitForm.querySelector('button[type="submit"]');
  const originalText = submitButton?.textContent || 'Book Visit';

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    const response = await fetch('/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(booking)
    });

    if (!response.ok) {
      throw new Error('Save failed');
    }

    visitForm.reset();
    alert('Your visit request has been sent. We will contact you soon.');
  } catch (error) {
    alert('Sorry, we could not send your visit request right now. Please try again.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
});