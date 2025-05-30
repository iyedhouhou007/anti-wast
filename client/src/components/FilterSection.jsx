import React, { useState } from 'react';
import './FilterSection.css';

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Algiers', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M-Sila', 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status', icon: 'filter_list' },
  { value: 'fresh', label: 'Fresh', icon: 'eco' },
  { value: 'day_old', label: 'Day Old', icon: 'schedule' },
  { value: 'stale', label: 'Stale', icon: 'warning' }
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types', icon: 'category' },
  { value: 'giveaway', label: 'Giveaway', icon: 'redeem' },
  { value: 'request', label: 'Request', icon: 'shopping_cart' }
];

export default function FilterSection({ filters, setFilters, onApply, onReset, animated }) {
  const [open, setOpen] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters({ status: '', type: '', province: '' });
    if (onReset) onReset();
  };

  const handleApply = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    if (onApply) onApply(cleanFilters);
  };

  return (
    <div className="filter-card">
      <div className="filter-card-header">
        <div className="filter-header-title">
          <span className="material-symbols-outlined">tune</span>
          Filter Products
        </div>
        <button
          className={`filter-toggle-btn ${open ? 'open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Collapse filters' : 'Expand filters'}
        >
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      </div>
      <div
        className={`filter-card-content${animated ? ' animated' : ''}`}
        style={animated ? {
          maxHeight: open ? 500 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)'
        } : {}}
      >
        {open && (
          <>
            <div className="filter-controls-grid">
              <div>
                <label>
                  <span className="material-symbols-outlined">inventory_2</span>
                  Status
                </label>
                <select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>
                  <span className="material-symbols-outlined">redeem</span>
                  Post Type
                </label>
                <select 
                  name="post_type" 
                  value={filters.post_type} 
                  onChange={handleChange}
                >
                  {TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>
                  <span className="material-symbols-outlined">location_on</span>
                  Province
                </label>
                <select 
                  name="province" 
                  value={filters.province} 
                  onChange={handleChange}
                >
                  <option value="">All Provinces</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-card-actions">
              <button 
                className="filter-btn filter-btn-outline" 
                onClick={handleReset}
              >
                <span className="material-symbols-outlined">restart_alt</span>
                Reset
              </button>
              <button 
                className="filter-btn filter-btn-primary" 
                onClick={handleApply}
              >
                <span className="material-symbols-outlined">check</span>
                Apply Filters
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}