(function () {
  const app = document.getElementById('app');
  let restaurants = [];
  let activeFilters = { cuisine: [], location: [] };

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

  // Get all unique tags
  function getAllTags() {
    const cuisines = new Set();
    const locations = new Set();
    restaurants.forEach(r => {
      (r.tags?.cuisine || []).forEach(c => cuisines.add(c));
      (r.tags?.location || []).forEach(l => locations.add(l));
    });
    return { cuisines: Array.from(cuisines).sort(), locations: Array.from(locations).sort() };
  }

  // Filter restaurants based on active filters
  function filterRestaurants() {
    if (activeFilters.cuisine.length === 0 && activeFilters.location.length === 0) {
      return restaurants;
    }
    return restaurants.filter(r => {
      const rTags = r.tags || {};
      const rCuisine = rTags.cuisine || [];
      const rLocation = rTags.location || [];
      const cuisineMatch = activeFilters.cuisine.length === 0 || activeFilters.cuisine.some(f => rCuisine.includes(f));
      const locationMatch = activeFilters.location.length === 0 || activeFilters.location.some(f => rLocation.includes(f));
      return cuisineMatch && locationMatch;
    });
  }

  // Render the list of restaurants
  function renderList() {
    const tags = getAllTags();
    const filtered = filterRestaurants();
    let html = '';

    // Filter section
    html += '<div class="filter-section">';
    html += '<h3 class="filter-title">Filter by:</h3>';

    // Cuisine filters
    if (tags.cuisines.length > 0) {
      html += '<div class="filter-group">';
      html += '<span class="filter-group-label">Cuisine</span>';
      tags.cuisines.forEach(tag => {
        const checked = activeFilters.cuisine.includes(tag) ? 'checked' : '';
        html += `<label class="filter-checkbox"><input type="checkbox" onchange="toggleFilter('cuisine', '${tag}')" ${checked}>${esc(tag)}</label>`;
      });
      html += '</div>';
    }

    // Location filters
    if (tags.locations.length > 0) {
      html += '<div class="filter-group">';
      html += '<span class="filter-group-label">Location</span>';
      tags.locations.forEach(tag => {
        const checked = activeFilters.location.includes(tag) ? 'checked' : '';
        html += `<label class="filter-checkbox"><input type="checkbox" onchange="toggleFilter('location', '${tag}')" ${checked}>${esc(tag)}</label>`;
      });
      html += '</div>';
    }

    // Clear filters
    if (activeFilters.cuisine.length > 0 || activeFilters.location.length > 0) {
      html += '<button class="clear-filters" onclick="clearFilters()">Clear filters</button>';
    }

    html += `<div class="filter-count">${filtered.length} of ${restaurants.length} restaurants</div>`;
    html += '</div>';

    // Restaurant cards
    if (filtered.length === 0) {
      html += '<p class="no-results">No restaurants match your filters.</p>';
    } else {
      filtered.forEach((r, idx) => {
        const origIdx = restaurants.indexOf(r);
        html += `
          <div class="restaurant-card" onclick="showDetail(${origIdx})">
            <div class="name">${esc(r.name)}</div>
            <div class="cuisine">${esc(r.cuisine)}</div>
            <div class="tags">
              ${(r.tags?.cuisine || []).map(t => `<span class="tag tag-cuisine">${esc(t)}</span>`).join('')}
              ${(r.tags?.location || []).map(t => `<span class="tag tag-location">${esc(t)}</span>`).join('')}
            </div>
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
    }
    app.innerHTML = html;
  }

  // Expose filter functions globally
  window.toggleFilter = function (type, tag) {
    const arr = activeFilters[type];
    const idx = arr.indexOf(tag);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(tag);
    }
    renderList();
  };

  window.clearFilters = function () {
    activeFilters = { cuisine: [], location: [] };
    renderList();
  };

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

    // Tags
    if (r.tags) {
      html += '<div class="detail-tags">';
      if (r.tags.cuisine && r.tags.cuisine.length > 0) {
        html += '<span class="label">Tags:</span> ';
        html += r.tags.cuisine.map(t => `<span class="tag tag-cuisine">${esc(t)}</span>`).join(' ');
        if (r.tags.location && r.tags.location.length > 0) {
          r.tags.location.forEach(t => {
            html += `<span class="tag tag-location">${esc(t)}</span>`;
          });
        }
      }
      html += '</div>';
    }

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
