"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiUser,
  FiLock,
  FiLogIn,
  FiUserPlus,
  FiAlertCircle,
  FiSearch,
  FiCpu,
  FiDollarSign,
  FiZap,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// Tipos de datos
interface SearchItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  searchData: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPro?: boolean;
  buttonText: string;
  buttonClass: string;
}

interface CarouselItem {
  id: number;
  image: string;
  title: string;
  description: string;
}

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [showNoResults, setShowNoResults] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showCardInfo, setShowCardInfo] = useState<string | null>(null);

  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  // Datos de ejemplo para el carrusel
  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      image: "/1.png",
      title: "Diseño Generado por IA",
      description: "Arquitectura moderna con integración inteligente",
    },
    {
      id: 2,
      image: "/2.png",
      title: "Planos Estructurales",
      description: "Visualización 3D de tus proyectos",
    },
    {
      id: 3,
      image: "/3.png",
      title: "Presupuestos Automatizados",
      description: "Costos actualizados en tiempo real",
    },
  ];

  // Datos de búsqueda
  const searchItems: SearchItem[] = [
    {
      id: "ia",
      title: "Motor de IA Avanzado",
      description:
        "Generación de planos personalizados basados en tus necesidades de terreno y estilo.",
      icon: <FiCpu className="card-icon" />,
      searchData: "cerebro mente algoritmos diseño arquitectura inteligente",
    },
    {
      id: "costos",
      title: "Costos Reales",
      description:
        "Calculamos materiales y mano de obra con precios actualizados de tu zona geográfica.",
      icon: <FiDollarSign className="card-icon" />,
      searchData: "dinero presupuesto cotizacion finanzas materiales costos",
    },
    {
      id: "automation",
      title: "Automatización n8n",
      description:
        "Agentes inteligentes que gestionan tus cotizaciones y contacto con proveedores.",
      icon: <FiZap className="card-icon" />,
      searchData: "webhook n8n integracion flujo trabajo proveedores automatizacion",
    },
  ];

  // Datos de precios
  const pricingPlans: PricingPlan[] = [
    {
      id: "basic",
      name: "Plan Básico",
      price: "$0",
      period: "/mes",
      features: [
        "✓ 1 Diseño conceptual",
        "✓ Estimado general de costos",
        "✗ Planos estructurales",
      ],
      buttonText: "Empezar Gratis",
      buttonClass: "btn-secondary-dark",
    },
    {
      id: "pro",
      name: "ARK AI PRO",
      price: "$49",
      period: "/mes",
      features: [
        "✓ Diseños ilimitados con IA",
        "✓ Desglose de materiales real",
        "✓ Soporte 24/7 con Agente",
      ],
      isPro: true,
      buttonText: "Suscribirse Ahora",
      buttonClass: "btn-primary",
    },
  ];

  // Manejo de búsqueda
  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim();
    let foundCount = 0;

    searchItems.forEach((item) => {
      const element = document.getElementById(`card-${item.id}`);
      if (element) {
        if (term === "" || item.searchData.toLowerCase().includes(term)) {
          element.style.display = "";
          foundCount++;
        } else {
          element.style.display = "none";
        }
      }
    });

    pricingPlans.forEach((plan) => {
      const element = document.getElementById(`plan-${plan.id}`);
      if (element) {
        if (
          term === "" ||
          plan.name.toLowerCase().includes(term) ||
          plan.features.some((f) => f.toLowerCase().includes(term))
        ) {
          element.style.display = "";
          foundCount++;
        } else {
          element.style.display = "none";
        }
      }
    });

    if (term !== "") {
      setSearchStatus(`🔍 Encontrados ${foundCount} resultado(s) para "${term}"`);
      setShowNoResults(foundCount === 0);
    } else {
      setSearchStatus("");
      setShowNoResults(false);
    }
  };

  // Efecto de scroll
  useEffect(() => {
    const handleScroll = () => {
      // Navbar scroll effect
      setScrolled(window.scrollY > 100);

      // Secciones visibles
      const sections = ["beneficios", "precios", "carousel"];
      sections.forEach((section) => {
        const element = sectionsRef.current[section];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight - 100) {
            setVisibleSections((prev) =>
              prev.includes(section) ? prev : [...prev, section]
            );
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Ejecutar al inicio

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Manejo del carrusel
  const nextSlide = () => {
    setActiveCarouselIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setActiveCarouselIndex(
      (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  // Manejo de clic en cards
  const handleCardClick = (cardId: string) => {
    if (showCardInfo === cardId) {
      setShowCardInfo(null);
    } else {
      setShowCardInfo(cardId);
      setTimeout(() => {
        setShowCardInfo(null);
      }, 3000);
    }
  };

  return (
    <div className="ark-ai-container">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-flex">
          <div className="nav-brand">
            <span className="brand-text">
              ARK <span className="color-orange">AI</span>
            </span>
          </div>

          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                id="global-search"
                placeholder="Busca planos, estilos, costos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button id="search-btn" onClick={handleSearch}>
                <FiSearch />
              </button>
            </div>
          </div>

          <ul className="nav-links">
            <li>
              <a href="#inicio" className="nav-link">
                Inicio
              </a>
            </li>
            <li>
              <a href="#beneficios" className="nav-link">
                Beneficios
              </a>
            </li>
            <li>
              <a href="#precios" className="nav-link">
                Precios
              </a>
            </li>
            <li>
              <a href="/login" className="nav-btn-outline">
                <FiUser /> Ingresar
              </a>
            </li>
            <li>
              <a href="/registro" className="nav-btn-solid">
                Empezar
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="inicio" className="hero-section">
        <div className="container hero-content">
          <div className="hero-text-area">
            <div className="badge">IA Generativa 2026</div>
            <h1>
              Diseña tu hogar con el poder de la <span className="color-orange">IA</span>
            </h1>
            <p className="tagline">
              Planeación inteligente, presupuestos locales exactos y planos
              conceptuales en segundos.
            </p>
            <div className="hero-btns">
              <a href="/registro" className="btn-primary">
                Registrarse Gratis
              </a>
              <a href="#precios" className="btn-secondary">
                Ver Planes
              </a>
            </div>
          </div>
          <div className="hero-image-area">
            <div
              className="main-logo-hero"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05) rotate(2deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              <Image
                src="/logo.jpeg"
                alt="ARK AI Logo"
                width={400}
                height={350}
                className="logo-image"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {/* Search Status */}
          {searchStatus && (
            <div className="search-status" style={{ display: "block" }}>
              {searchStatus}
            </div>
          )}

          {showNoResults && (
            <div className="no-results-msg">
              <FiAlertCircle />
              <p>No encontramos nada relacionado con tu búsqueda.</p>
            </div>
          )}

          {/* Carousel Section */}
          <section
            id="carousel-section"
            ref={(el) => {
              sectionsRef.current["carousel"] = el;
            }}
            className={`section ${visibleSections.includes("carousel") ? "visible" : ""}`}
          >
            <h2 className="section-title">PROYECTOS DESTACADOS</h2>
            <div className="carousel-container" ref={carouselRef}>
              <div className="carousel">
                <div className="carousel-inner">
                  {carouselItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`carousel-item ${
                        index === activeCarouselIndex ? "active" : ""
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={800}
                        height={500}
                        className="carousel-image"
                      />
                      <div className="carousel-caption">
                        <h5>{item.title}</h5>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="carousel-control-prev" onClick={prevSlide}>
                  <FiChevronLeft />
                </button>
                <button className="carousel-control-next" onClick={nextSlide}>
                  <FiChevronRight />
                </button>
                <div className="carousel-indicators">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === activeCarouselIndex ? "active" : ""}`}
                      onClick={() => setActiveCarouselIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Beneficios Section */}
          <section
            id="beneficios"
            ref={(el) => {
              sectionsRef.current["beneficios"] = el;
            }}
            className={`section ${visibleSections.includes("beneficios") ? "visible" : ""}`}
          >
            <h2 className="section-title">¿POR QUÉ ELEGIR ARK AI?</h2>
            <div className="grid">
              {searchItems.map((item) => (
                <div
                  key={item.id}
                  id={`card-${item.id}`}
                  className={`card search-item ${hoveredCard === item.id ? "hovered" : ""}`}
                  data-search={item.searchData}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleCardClick(item.id)}
                >
                  {item.icon}
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {showCardInfo === item.id && (
                    <div className="card-info">
                      ✨ ¡Gracias por tu interés! Nuestro equipo se pondrá en
                      contacto pronto.
                    </div>
                  )}
                  <div className="tooltip-text">¡Haz clic para más información!</div>
                </div>
              ))}
            </div>
          </section>

          {/* Precios Section */}
          <section
            id="precios"
            ref={(el) => {
              sectionsRef.current["precios"] = el;
            }}
            className={`section ${visibleSections.includes("precios") ? "visible" : ""}`}
          >
            <h2 className="section-title">ACCESO TOTAL A LA IA</h2>
            <div className="pricing-container">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  id={`plan-${plan.id}`}
                  className={`pricing-card search-item ${plan.isPro ? "pro" : ""} ${
                    hoveredCard === plan.id ? "hovered" : ""
                  }`}
                  onMouseEnter={() => setHoveredCard(plan.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleCardClick(plan.id)}
                >
                  {plan.isPro && <div className="popular-badge">RECOMENDADO</div>}
                  <div className="pricing-header">
                    <h3>{plan.name}</h3>
                    <div className="price">
                      {plan.price} <span>{plan.period}</span>
                    </div>
                  </div>
                  <ul className="pricing-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <a
                    href="/registro"
                    className={plan.buttonClass}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {plan.buttonText} <FiArrowRight />
                  </a>
                  {showCardInfo === plan.id && (
                    <div className="card-info">
                      ✨ ¡Excelente elección! Completa tu registro para acceder.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <h2>ARK AI – El futuro de la construcción</h2>
          <p>Únete a la revolución digital en arquitectura.</p>
          <div className="footer-button">
            <a href="/registro" className="cta-button">
              Presentar Prototipo Pro <FiArrowRight />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}