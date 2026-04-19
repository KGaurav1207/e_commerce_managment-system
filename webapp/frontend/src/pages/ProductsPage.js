import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const getFiltersFromSearchParams = (searchParams) => ({
  search: searchParams.get('search') || '',
  category: searchParams.get('category') || '',
  min_price: searchParams.get('min_price') || '',
  max_price: searchParams.get('max_price') || '',
  sort: searchParams.get('sort') || 'newest',
  page: Number(searchParams.get('page') || 1),
  limit: Number(searchParams.get('limit') || 12),
});

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);
  const filters = getFiltersFromSearchParams(searchParams);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        );
        const res = await api.get('/products', { params });
        if (ignore) return;
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      } catch {
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProducts();
    return () => { ignore = true; };
  }, [filters.search, filters.category, filters.min_price, filters.max_price, filters.sort, filters.page, filters.limit]);

  const updateFilters = (patch) => {
    const next = { ...filters, ...patch };
    const nextParams = {};
    Object.entries(next).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined && value !== 1 && !(key === 'limit' && value === 12)) {
        nextParams[key] = String(value);
      }
    });
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value, page: 1 });
  };

  const handleSort = e => handleFilterChange('sort', e.target.value);
  const handleCategory = (id) => handleFilterChange('category', id === filters.category ? '' : id);
  const handlePage = (p) => updateFilters({ page: p });

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div>
            {filters.sort === 'price_desc' && (
              <div className="deals-banner">
                <span className="deals-badge">HOT DEALS</span>
                <span className="deals-text">Best prices on top products!</span>
              </div>
            )}
            <h1 className="section-title">
              {filters.search ? `Results for "${filters.search}"` : 
               filters.sort === 'price_desc' ? 'Hot Deals' : 'All Products'}
            </h1>
            <p className="result-count">{total} products found</p>
          </div>
          <div className="sort-bar">
            <label>Sort by:</label>
            <select value={filters.sort} onChange={handleSort} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Best Rated</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className="filter-sidebar">
            <div className="filter-card">
              <h3 className="filter-title"><i className="fas fa-filter"></i> Filters</h3>

              {/* Search */}
              <div className="filter-section">
                <h4>Search</h4>
                <input type="text" className="form-control" placeholder="Search products..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="filter-section">
                <h4>Categories</h4>
                <div className="category-filters">
                  <button
                    className={`cat-filter-btn ${!filters.category ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', '')}
                  >All Categories</button>
                  {categories.map(c => (
                    <button
                      key={c.category_id}
                      className={`cat-filter-btn ${filters.category == c.category_id ? 'active' : ''}`}
                      onClick={() => handleCategory(String(c.category_id))}
                    >{c.name}</button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-range">
                  <input type="number" className="form-control" placeholder="Min ₹"
                    value={filters.min_price}
                    onChange={e => handleFilterChange('min_price', e.target.value)}
                  />
                  <span>—</span>
                  <input type="number" className="form-control" placeholder="Max ₹"
                    value={filters.max_price}
                    onChange={e => handleFilterChange('max_price', e.target.value)}
                  />
                </div>
                <button className="btn btn-primary btn-full btn-sm" style={{ marginTop: 10 }} type="button">
                  Apply
                </button>
              </div>

              <button className="btn btn-outline btn-full btn-sm"
                onClick={() => setSearchParams({})}>
                <i className="fas fa-times"></i> Clear Filters
              </button>
            </div>
          </aside>

          {/* Products Area */}
          <div className="products-area">
            {loading ? (
              <div className="spinner-wrapper"><div className="spinner"></div></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><i className="fas fa-box-open"></i></div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="product-list-grid">
                  {products.map(p => <ProductCard key={p.product_id} product={p} />)}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => handlePage(filters.page - 1)} disabled={filters.page === 1}>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`}
                        onClick={() => handlePage(p)}>{p}</button>
                    ))}
                    <button className="page-btn" onClick={() => handlePage(filters.page + 1)} disabled={filters.page === totalPages}>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
