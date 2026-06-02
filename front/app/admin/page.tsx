'use client';

import { obtenerVillas } from '@/api/peticiones';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faSync, 
  faChevronLeft, 
  faChevronRight,
  faDatabase,
  faCity,
  faHome,
  faBuilding,
  faWarehouse,
  faUser,
  faChevronDown,
  faSignOutAlt,
  faIdCard,
  faEnvelope,
  faUserTag,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

// Types
interface FilterState {
  search: string;
  category: string;
  maxPrice: string;
  sortBy: string;
}

interface Project {
  id: number;
  titulo: string;
  categoria: string;
  precio: number;
  descripcion: string;
  icono: string;
  tags: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  tipoUsuario: string;
  nombreCompleto?: string;
}

// Mapeo de iconos
const getIcon = (iconName: string) => {
  switch(iconName) {
    case 'fa-city': return faCity;
    case 'fa-home': return faHome;
    case 'fa-building': return faBuilding;
    case 'fa-warehouse': return faWarehouse;
    default: return faHome;
  }
};

const AdminDashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    maxPrice: '',
    sortBy: ''
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const itemsPerPage = 10;

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("token");
      const storedUserData = localStorage.getItem("userData");
      
      if (!token || !storedUserData) {
        router.push("/login");
        return;
      }
      
      try {
        const user = JSON.parse(storedUserData);
        // Verificar que sea admin
        if (user.tipoUsuario?.toLowerCase() !== 'admin') {
          router.push("/usuario");
          return;
        }
        setUserData(user);
        
        // Verificar expiración del token
        const tokenExpiry = localStorage.getItem("tokenExpiry");
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
          handleLogout();
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        router.push("/login");
      }
    };
    
    loadUserData();
  }, [router]);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("tokenTimestamp");
    localStorage.removeItem("tokenExpiry");
    router.push("/login");
  };

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await obtenerVillas();
      const data = response.data;
      setProjects(data);
      applyFilters(data, filters);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const applyFilters = (data: Project[], currentFilters: FilterState) => {
    let filtered = [...data];

    // Apply text search
    if (currentFilters.search) {
      filtered = filtered.filter(project =>
        project.titulo.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
        project.descripcion.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }

    // Apply category filter
    if (currentFilters.category) {
      filtered = filtered.filter(project =>
        project.categoria === currentFilters.category
      );
    }

    // Apply price filter
    if (currentFilters.maxPrice) {
      filtered = filtered.filter(project =>
        project.precio <= parseFloat(currentFilters.maxPrice)
      );
    }

    // Apply sorting
    switch (currentFilters.sortBy) {
      case 'id_desc':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'alpha_asc':
        filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.precio - a.precio);
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    applyFilters(projects, filters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      category: '',
      maxPrice: '',
      sortBy: ''
    };
    setFilters(resetFilters);
    applyFilters(projects, resetFilters);
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!userData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0d0d0d',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Cargando sesión de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-mode">
      <aside className="sidebar">
        <div className="sidebar-title">
          <FontAwesomeIcon icon={faShieldAlt} /> ARK COMMAND
        </div>

        <div className="filter-section">
          <h4>Buscador Avanzado</h4>
          <form id="admin-search-form" onSubmit={(e) => e.preventDefault()}>
            <div className="filter-group">
              <label>Query de Texto</label>
              <input
                type="text"
                id="admin-search"
                placeholder="Nombre o palabra clave..."
                maxLength={50}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Categoría</label>
              <select
                id="admin-cat"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Moderno">Moderno</option>
                <option value="Minimalista">Minimalista</option>
                <option value="Industrial">Industrial</option>
                <option value="Clásico">Clásico</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Presupuesto Máximo ($)</label>
              <input
                type="number"
                id="admin-price"
                placeholder="Sin límite"
                max={10000000}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Ordenar por</label>
              <select
                id="admin-sort"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="">-- Seleccione --</option>
                <option value="id_desc">ID (Recientes)</option>
                <option value="alpha_asc">Nombre (A-Z)</option>
                <option value="price_asc">Precio: Bajo a Alto</option>
                <option value="price_desc">Precio: Alto a Bajo</option>
              </select>
            </div>

            <button
              type="button"
              id="apply-admin-filters"
              className="btn-search"
              onClick={handleSearch}
            >
              <FontAwesomeIcon icon={faSync} /> Ejecutar Consulta
            </button>

            <button
              type="button"
              id="reset-filters"
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid #444',
                color: '#888',
                marginTop: '10px',
                width: '100%',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}
            >
              Limpiar Filtros
            </button>
          </form>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ fontSize: '0.8rem', color: '#888' }}>
            Mostrando{' '}
            <span
              id="count-display"
              style={{ color: 'var(--admin-accent, #ff5e00)', fontWeight: 'bold' }}
            >
              {totalCount}
            </span>{' '}
            registros de la base de datos
          </div>

          <div className="pagination-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              id="prev-page"
              className="btn-nav"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                background: '#222',
                border: '1px solid #444',
                color: 'white',
                padding: '5px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span id="page-indicator" style={{ fontSize: '0.8rem', color: '#aaa' }}>
              Pág. {currentPage} de {totalPages || 1}
            </span>
            <button
              id="next-page"
              className="btn-nav"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                background: '#222',
                border: '1px solid #444',
                color: 'white',
                padding: '5px 10px',
                cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                borderRadius: '4px',
                opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className="user-info" ref={userMenuRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0'
              }}
            >
              <span className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faUser} />
                {userData.username || userData.nombreCompleto || 'ADMIN'}
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '0.7rem', transition: 'transform 0.3s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </span>
            </button>
            
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                width: '300px',
                background: '#1a1a1a',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                zIndex: 1000,
                overflow: 'hidden',
                border: '1px solid #333'
              }}>
                <div style={{
                  padding: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <FontAwesomeIcon icon={faCrown} />
                    <div style={{ fontWeight: 'bold' }}>
                      {userData.username || userData.nombreCompleto}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Administrador del Sistema
                  </div>
                </div>
                
                <div style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <FontAwesomeIcon icon={faIdCard} style={{ color: '#ff5e00', width: '20px' }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>ID de Administrador</div>
                      <div style={{ fontSize: '0.85rem', color: '#fff' }}>{userData.id || 'No disponible'}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#ff5e00', width: '20px' }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>Correo Electrónico</div>
                      <div style={{ fontSize: '0.85rem', color: '#fff' }}>{userData.email || 'No disponible'}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FontAwesomeIcon icon={faUserTag} style={{ color: '#ff5e00', width: '20px' }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>Rol</div>
                      <div style={{ fontSize: '0.85rem', color: '#ff5e00', fontWeight: 'bold' }}>Administrador</div>
                    </div>
                  </div>
                </div>
                
                <div style={{ height: '1px', background: '#333' }}></div>
                
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#ff5e00',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#222'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="content-scroll">
          {loading && (
            <div
              id="loader"
              className="loader-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '50px'
              }}
            >
              <div
                className="spinner"
                style={{
                  width: '50px',
                  height: '50px',
                  border: '5px solid rgba(255, 255, 255, 0.1)',
                  borderTop: '5px solid var(--admin-accent, #ff5e00)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '15px'
                }}
              />
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Accediendo al núcleo de datos...</p>
            </div>
          )}

          {!loading && (
            <>
              <div id="gridResultados" className="admin-grid">
                {currentProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="card-header">
                      <FontAwesomeIcon icon={getIcon(project.icono)} className="card-icon" />
                      <span className="card-id">#{project.id}</span>
                    </div>
                    <h3 className="card-title">{project.titulo}</h3>
                    <div className="card-category">{project.categoria}</div>
                    <p className="card-description">{project.descripcion}</p>
                    <div className="card-footer">
                      <span className="card-price">{formatPrice(project.precio)}</span>
                      <span className="card-tags">{project.tags}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div
                  id="no-results-msg"
                  className="no-results"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '50px',
                    textAlign: 'center'
                  }}
                >
                  <FontAwesomeIcon
                    icon={faDatabase}
                    style={{ fontSize: '3rem', marginBottom: '20px', color: '#333' }}
                  />
                  <p>QUERY_EMPTY: No se encontraron coincidencias.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--admin-accent, #ff5e00);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          padding: 20px;
        }

        .project-card {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #333;
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          border-color: var(--admin-accent, #ff5e00);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .card-icon {
          font-size: 1.5rem;
          color: var(--admin-accent, #ff5e00);
        }

        .card-id {
          font-size: 0.75rem;
          color: #666;
          font-family: monospace;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #fff;
        }

        .card-category {
          display: inline-block;
          background: #333;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          color: var(--admin-accent, #ff5e00);
          margin-bottom: 12px;
        }

        .card-description {
          font-size: 0.85rem;
          color: #aaa;
          line-height: 1.4;
          margin-bottom: 15px;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid #333;
        }

        .card-price {
          font-size: 1.1rem;
          font-weight: bold;
          color: var(--admin-accent, #ff5e00);
        }

        .card-tags {
          font-size: 0.7rem;
          color: #666;
          font-family: monospace;
        }

        .sidebar {
          width: 280px;
          background: #0d0d0d;
          border-right: 1px solid #222;
          padding: 20px;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }

        .main-content {
          margin-left: 280px;
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .top-bar {
          background: #0d0d0d;
          border-bottom: 1px solid #222;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .sidebar-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 30px;
          color: var(--admin-accent, #ff5e00);
        }

        .filter-section h4 {
          margin-bottom: 15px;
          color: #fff;
        }

        .filter-group {
          margin-bottom: 15px;
        }

        .filter-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.8rem;
          color: #aaa;
        }

        .filter-group input,
        .filter-group select {
          width: 100%;
          padding: 8px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          color: #fff;
        }

        .btn-search {
          width: 100%;
          padding: 10px;
          background: var(--admin-accent, #ff5e00);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        .btn-search:hover {
          opacity: 0.9;
        }

        .status-badge {
          background: #00ff00;
          color: #000;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;