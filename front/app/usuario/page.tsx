'use client';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSlidersH, 
  faMapMarkerAlt, 
  faMagic, 
  faChartLine, 
  faDraftingCompass, 
  faRobot,
  faChevronDown,
  faSignOutAlt,
  faIdCard,
  faEnvelope,
  faUserTag
} from '@fortawesome/free-solid-svg-icons';

// Types
interface FormData {
  location: string;
  floors: number;
  style: string;
  bedrooms: number;
  bathrooms: number;
  extras: string[];
}

interface EstimationResult {
  totalPrice: number;
  materialCost: string;
  buildTime: string;
  landCost: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  tipoUsuario: string;
  nombreCompleto?: string;
}

const ConfiguradorIA = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLLIElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    location: '',
    floors: 1,
    style: 'Moderno',
    bedrooms: 2,
    bathrooms: 1,
    extras: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [estimation, setEstimation] = useState<EstimationResult>({
    totalPrice: 0,
    materialCost: 'Pendiente',
    buildTime: 'Pendiente',
    landCost: 'Pendiente'
  });

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
        setUserData(user);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          extras: [...prev.extras, value]
        };
      } else {
        return {
          ...prev,
          extras: prev.extras.filter(extra => extra !== value)
        };
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      setEstimation({
        totalPrice: data.totalPrice,
        materialCost: data.materialCost,
        buildTime: data.buildTime,
        landCost: data.landCost
      });
    } catch (error) {
      console.error('Error generating estimation:', error);
      
      const basePrice = 15000;
      const floorMultiplier = formData.floors * 1.2;
      const bedroomCost = formData.bedrooms * 80000;
      const bathroomCost = formData.bathrooms * 50000;
      const styleMultiplier = formData.style === 'Moderno' ? 1.1 : 
                            formData.style === 'Minimalista' ? 1.0 : 0.9;
      const extrasCost = formData.extras.length * 45000;
      
      const estimatedTotal = (basePrice * floorMultiplier + bedroomCost + bathroomCost + extrasCost) * styleMultiplier;
      
      setEstimation({
        totalPrice: estimatedTotal,
        materialCost: `$${(estimatedTotal * 0.6).toLocaleString()} MXN`,
        buildTime: `${Math.ceil(formData.floors * 4 + formData.bedrooms * 2 + formData.extras.length * 0.5)} meses`,
        landCost: `$${(estimatedTotal * 0.3).toLocaleString()} MXN`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getRolNombre = (tipoUsuario?: string) => {
    switch(tipoUsuario?.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'usuario':
        return 'Usuario';
      default:
        return tipoUsuario || 'No especificado';
    }
  };

  if (!userData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="container nav-flex">
          <div className="nav-brand">
            <span className="brand-text">
              ARK <span className="color-orange">AI</span>
            </span>
          </div>
          <ul className="nav-links">
            <li><a href="/">Inicio</a></li>
            <li><a href="#configurador">Configurador</a></li>
            <li ref={userMenuRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem'
                }}
              >
                <FontAwesomeIcon icon={faUser} /> 
                {userData.username || userData.nombreCompleto || 'Mi Cuenta'}
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '0.8rem', transition: 'transform 0.3s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  width: '280px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '15px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {userData.username || userData.nombreCompleto}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                      {getRolNombre(userData.tipoUsuario)}
                    </div>
                  </div>
                  
                  <div style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <FontAwesomeIcon icon={faIdCard} style={{ color: '#667eea', width: '20px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#999' }}>ID de Usuario</div>
                        <div style={{ fontSize: '0.85rem', color: '#333' }}>{userData.id || 'No disponible'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <FontAwesomeIcon icon={faEnvelope} style={{ color: '#667eea', width: '20px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#999' }}>Correo Electrónico</div>
                        <div style={{ fontSize: '0.85rem', color: '#333' }}>{userData.email || 'No disponible'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FontAwesomeIcon icon={faUserTag} style={{ color: '#667eea', width: '20px' }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#999' }}>Tipo de Usuario</div>
                        <div style={{ fontSize: '0.85rem', color: '#333' }}>{getRolNombre(userData.tipoUsuario)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ height: '1px', background: '#f0f0f0' }}></div>
                  
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
                      color: '#c33',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <header className="hero configurador-hero">
        <div className="container">
          <h1 className="section-title">Configurador Inteligente de Vivienda</h1>
          <p className="tagline">
            Personaliza tu hogar y deja que nuestra IA calcule cada detalle por ti.
          </p>
        </div>
      </header>

      <main id="configurador" className="container diseno-container">
        <div className="grid-diseno">
          <section className="card form-card">
            <h3>
              <FontAwesomeIcon icon={faSlidersH} className="color-orange" /> Características del Proyecto
            </h3>
            <p className="form-instruction">
              Proporcione los detalles básicos para iniciar la estimación.
            </p>

            <form id="house-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ubicación (Municipio/Zona)</label>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="input-icon" />
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="Ej. San Juan del Río, Qro."
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número de Pisos</label>
                  <input
                    type="number"
                    name="floors"
                    className="form-input"
                    min="1"
                    max="3"
                    value={formData.floors}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estilo de Diseño</label>
                  <select
                    name="style"
                    className="form-input"
                    value={formData.style}
                    onChange={handleInputChange}
                  >
                    <option>Moderno</option>
                    <option>Minimalista</option>
                    <option>Rústico</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Habitaciones</label>
                  <input
                    type="number"
                    name="bedrooms"
                    className="form-input"
                    min="1"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Baños Totales</label>
                  <input
                    type="number"
                    name="bathrooms"
                    className="form-input"
                    min="1"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenidades y Extras</label>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      value="Piscina"
                      onChange={handleCheckboxChange}
                    /> Piscina
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Terraza"
                      onChange={handleCheckboxChange}
                    /> Terraza
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Garaje"
                      onChange={handleCheckboxChange}
                    /> Garaje
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Áreas Verdes"
                      onChange={handleCheckboxChange}
                    /> Áreas Verdes
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Jacuzzi"
                      onChange={handleCheckboxChange}
                    /> Jacuzzi
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                <FontAwesomeIcon icon={faMagic} /> 
                {isLoading ? 'Generando propuesta...' : 'Generar Propuesta con IA'}
              </button>
            </form>
          </section>

          <section className="results-panel">
            <div className="card result-card">
              <h3>
                <FontAwesomeIcon icon={faChartLine} className="color-orange" /> Estimación de Inversión
              </h3>
              <div className="price-display">
                <span className="label">Presupuesto Integral Estimado:</span>
                <span className="value" id="total-price">
                  {estimation.totalPrice > 0 
                    ? formatCurrency(estimation.totalPrice) 
                    : '$0.00 MXN'}
                </span>
              </div>

              <ul className="feature-list">
                <li>
                  <strong>Materiales y Obra:</strong> 
                  <span id="mat-cost">{estimation.materialCost}</span>
                </li>
                <li>
                  <strong>Tiempo de Obra:</strong> 
                  <span id="build-time">{estimation.buildTime}</span>
                </li>
                <li>
                  <strong>Costo del Terreno:</strong> 
                  <span id="land-cost">{estimation.landCost}</span>
                </li>
                <li>
                  <strong>Instalaciones (E/H):</strong> Estimado incluido
                </li>
              </ul>
            </div>

            <div className="card canvas-card">
              <h3>
                <FontAwesomeIcon icon={faDraftingCompass} className="color-orange" /> Plano Conceptual
              </h3>
              <div className="ai-loader" style={{ 
                display: isLoading ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FontAwesomeIcon 
                  icon={faRobot} 
                  className="animate-spin"
                  style={{ fontSize: '2rem' }}
                />
                <p>Generando plano conceptual con IA...</p>
              </div>
              
              {!isLoading && estimation.totalPrice > 0 && (
                <div className="conceptual-plan">
                  <p style={{ textAlign: 'center', color: '#888' }}>
                    Plano conceptual generado según los parámetros seleccionados
                  </p>
                </div>
              )}
              
              {!isLoading && estimation.totalPrice === 0 && (
                <div className="ai-loader" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <FontAwesomeIcon 
                    icon={faRobot} 
                    style={{ fontSize: '2rem', opacity: 0.5 }}
                  />
                  <p>Esperando parámetros para trazar el diseño...</p>
                </div>
              )}
              <p className="disclaimer">
                *Este es un plano conceptual preliminar generado por IA.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="nav-brand" style={{ marginBottom: '20px' }}>
            <span className="brand-text">
              ARK <span className="color-orange">AI</span>
            </span>
          </div>
          <p>Transformando la planeación residencial con Inteligencia Artificial.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '20px' }}>
            &copy; 2024 ARK AI. Software de planeación y diseño inteligente.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
      `}</style>
    </>
  );
};

export default ConfiguradorIA;