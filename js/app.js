(function () {
  const app = document.getElementById('app');
  let restaurants = [];
  let activeFilters = { cuisine: [], location: [] };
  let _inputValue = '';

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

  // Get all unique tag values
  function getAllTagValues() {
    const allTags = new Set();
    restaurants.forEach(r => {
      (r.tags?.cuisine || []).forEach(c => allTags.add(c));
      (r.tags?.location || []).forEach(l => allTags.add(l));
    });
    return Array.from(allTags).sort();
  }

  // Determine if a tag is cuisine or location
  function getTagCategory(tag) {
    const cuisines = new Set();
    const locations = new Set();
    restaurants.forEach(r => {
      (r.tags?.cuisine || []).forEach(c => cuisines.add(c));
      (r.tags?.location || []).forEach(l => locations.add(l));
    });
    if (cuisines.has(tag)) return 'cuisine';
    if (locations.has(tag)) return 'location';
    return 'unknown';
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

  // Render the filter input + chips + cards (initial mount)
  function renderList() {
    const allTags = getAllTagValues();
    const filtered = filterRestaurants();
    const allActive = [...activeFilters.cuisine, ...activeFilters.location];
    let html = '';

    // Filter input (recreated each time with inline handlers)
    html += '<div class="filter-section">';
    html += `<input type="text" id="filter-input" class="filter-input" placeholder="Add filter (e.g. Chinese, Downtown)..." value="${esc(_inputValue)}" oninput="handleInput(event)" onkeydown="handleKeyDown(event)" onfocus="showDropdown()" onblur="hideDropdown()" />`;
    html += '<div id="suggestions" class="suggestions"></div>';
    html += '<div id="active-filters" class="active-filters"></div>';
    if (allActive.length > 0) {
      html += `<div class="filter-count" id="filter-count">${filtered.length} of ${restaurants.length} restaurants</div>`;
    } else {
      html += '<div id="filter-count" style="display:none"></div>';
    }
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

    // Render chips
    renderChips(allActive);
    // Render count
    updateFilterCount(filtered.length);
    // Render suggestions if input has text
    if (_inputValue.length > 0) {
      updateSuggestions(allTags);
    }
  }

  function renderChips(allActive) {
    const container = document.getElementById('active-filters');
    if (!container) return;
    container.innerHTML = allActive.map(tag => {
      const cat = getTagCategory(tag);
      const icon = cat === 'cuisine' ? '🍽' : '📍';
      return `<span class="chip" onclick="removeFilter('${esc(tag)}')">${icon} ${esc(tag)} <span class="chip-remove">×</span></span>`;
    }).join('');
  }

  function updateFilterCount(count) {
    const el = document.getElementById('filter-count');
    if (!el) return;
    el.textContent = `${count} of ${restaurants.length} restaurants`;
    el.style.display = activeFilters.cuisine.length > 0 || activeFilters.location.length > 0 ? 'block' : 'none';
  }

  function updateSuggestions(allTags) {
    const suggestionsEl = document.getElementById('suggestions');
    if (!suggestionsEl) return;
    const allActive = [...activeFilters.cuisine, ...activeFilters.location];
    const suggestions = allTags.filter(t =>
      !allActive.includes(t) && t.toLowerCase().includes(_inputValue.toLowerCase())
    );
    if (suggestions.length === 0) {
      suggestionsEl.innerHTML = '';
      return;
    }
    suggestionsEl.innerHTML = suggestions.map((s, i) => {
      const cat = getTagCategory(s);
      const icon = cat === 'cuisine' ? '🍽' : '📍';
      const highlighted = s.replace(
        new RegExp(`(${_inputValue.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')})`, 'gi'),
        '<mark>$1</mark>'
      );
      return `<div class="suggestion-item" data-index="${i}" onclick="selectSuggestion('${esc(s)}')" onmouseenter="highlightIndex(${i})">${icon} ${highlighted}</div>`;
    }).join('');
  }

  function handleInput(e) {
    _inputValue = e.target.value;
    updateSuggestions(getAllTagValues());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const val = e.target.value.trim();
      if (val) {
        const allTags = getAllTagValues();
        const allActive = [...activeFilters.cuisine, ...activeFilters.location];
        // Auto-select matching suggestion (exact or partial)
        const match = allTags.find(t =>
          !allActive.includes(t) && t.toLowerCase().includes(val.toLowerCase())
        );
        if (match) {
          addFilter(match);
        } else {
          addFilter(val);
        }
        _inputValue = '';
        e.target.value = '';
        e.target.blur();
        updateSuggestions(getAllTagValues());
      }
    }
  }

  function highlightIndex(idx) {
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === idx);
    });
  }

  function selectSuggestion(tag) {
    addFilter(tag);
    _inputValue = '';
    const input = document.getElementById('filter-input');
    if (input) {
      input.value = '';
      input.blur();
    }
    updateSuggestions(getAllTagValues());
  }

  function showDropdown() {
    updateSuggestions(getAllTagValues());
  }

  function hideDropdown() {
    setTimeout(() => {
      const sg = document.getElementById('suggestions');
      if (sg) sg.innerHTML = '';
    }, 200);
  }

  // Expose filter functions globally
  window.addFilter = function (tag) {
    const cat = getTagCategory(tag);
    if (cat === 'cuisine') {
      if (!activeFilters.cuisine.includes(tag)) activeFilters.cuisine.push(tag);
    } else if (cat === 'location') {
      if (!activeFilters.location.includes(tag)) activeFilters.location.push(tag);
    }
    renderList();
  };

  window.removeFilter = function (tag) {
    const idx = activeFilters.cuisine.indexOf(tag);
    if (idx >= 0) { activeFilters.cuisine.splice(idx, 1); }
    const idx2 = activeFilters.location.indexOf(tag);
    if (idx2 >= 0) { activeFilters.location.splice(idx2, 1); }
    renderList();
  };

  window.clearFilters = function () {
    activeFilters = { cuisine: [], location: [] };
    _inputValue = '';
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
