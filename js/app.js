(function () {
  const app = document.getElementById('app');
  let restaurants = [];

  // Load data
  async function loadData() {
    try {
      const resp = await fetch('data/restaurants.json');
      restaurants = await resp.json();
      renderList();
    } catch (err) {
      app.innerHTML = '<p class="loading">Failed to load restaurant data. Make sure you\'re serving this from a local server (e.g. <code>npx serve .</code>).</p>';
      console.error(err);
    }
  }

  // Render the list of restaurants
  function renderList() {
    let html = '';
    restaurants.forEach((r, idx) => {
      html += `
        <div class="restaurant-card" onclick="showDetail(${idx})">
          <div class="name">${esc(r.name)}</div>
          <div class="cuisine">${esc(r.cuisine)}</div>
          <div class="address">${esc(r.address)}</div>
          <div class="meta">
            <span class="rating">★ ${r.rating}</span>
            <span class="review-count">(${r.review_count} reviews)</span>
            <span class="phone">${esc(r.phone)}</span>
            ${r.notes ? `<span class="user-note">📝 ${esc(r.notes)}</span>` : ''}
          </div>
        </div>
      `;
    });
    app.innerHTML = html;
  }

  // Render a single restaurant's detail view
  function showDetail(idx) {
    const r = restaurants[idx];
    let html = '<div class="detail-view">';

    // Header
    html += `
      <div class="detail-header">
        <h2>${esc(r.name)}</h2>
        <button class="back-btn" onclick="renderList()">← Back</button>
      </div>
    `;

    // Info
    html += `
      <div class="detail-info">
        <p><span class="label">Address:</span> <span class="value">${esc(r.address)}</span></p>
        <p><span class="label">Phone:</span> <span class="value"><a href="tel:${r.phone.replace(/\s/g, '')}">${esc(r.phone)}</a></span></p>
        <p><span class="label">Rating:</span> <span class="value">★ ${r.rating} (${r.review_count} reviews)</span></p>
        <p><span class="label">Cuisine:</span> <span class="value">${esc(r.cuisine)}</span></p>
      </div>
    `;

    // Hours
    html += '<div class="hours-grid">';
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(day => {
      const hours = r.hours[day];
      html += `<span class="day">${day}</span><span class="value ${hours === 'Closed' ? 'closed' : ''}">${esc(hours)}</span>`;
    });
    html += '</div>';

    // User notes
    if (r.notes) {
      html += `<div class="user-note-detail">📝 ${esc(r.notes)}</div>`;
    }

    // Map link
    html += `<a href="${r.maps_url}" class="map-link" target="_blank" rel="noopener">📍 Open in Google Maps</a>`;

    // Menu
    const menu = r.menu;
    for (const [section, items] of Object.entries(menu)) {
      if (section === 'Notes') {
        html += `<div class="restaurant-notes">${esc(items)}</div>`;
        continue;
      }
      html += `<div class="menu-section">`;
      html += `<div class="menu-section-title">${formatSection(section)}</div>`;

      if (Array.isArray(items)) {
        items.forEach(item => {
          html += '<div class="menu-item">';
          html += `<div class="menu-item-header">`;
          html += `<span class="menu-item-name">${esc(item.name)}</span>`;
          if (item.price) html += `<span class="menu-item-price">$${item.price.toFixed(2)}</span>`;
          if (item.price_range) html += `<span class="menu-item-price">${esc(item.price_range)}</span>`;
          html += `</div>`;
          if (item.notes) html += `<div class="menu-item-notes">${esc(item.notes)}</div>`;
          html += '</div>';
        });
      }
      html += '</div>';
    }

    html += '</div>';
    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Format section titles (e.g. "PANER" → "Paner", "FRIED IDLI CHAAT" → "Fried Idli Chaat")
  function formatSection(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  // Escape HTML
  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Init
  loadData();

  // Expose showDetail globally for onclick
  window.showDetail = showDetail;
})();
