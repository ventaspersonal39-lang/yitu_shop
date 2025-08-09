let productos = [];
let adminActivo = false;
let categoriaActual = 'inicio';
const ADMIN_KEY = "yitu2025"; // Cambia esto por tu clave secreta

// Configuración de categorías
const categoriasConfig = {
  inicio: {
    titulo: "Inicio",
    placeholderBusqueda: "Buscar en todo el catálogo"
  },
  perfumes: {
    titulo: "Perfumes",
    placeholderBusqueda: "Buscar en perfumes"
  },
  accesorios: {
    titulo: "Accesorios",
    placeholderBusqueda: "Buscar en accesorios"
  },
  hogar: {
    titulo: "Hogar",
    placeholderBusqueda: "Buscar en hogar"
  },
  tecnologia: {
    titulo: "Tecnología",
    placeholderBusqueda: "Buscar en tecnología"
  },
  redes: {
    titulo: "Redes Sociales",
    placeholderBusqueda: ""
  }
};

async function cargarDatos() {
  try {
    // Verificar parámetro admin en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    adminActivo = adminParam === ADMIN_KEY;
    
    if (adminActivo) {
      console.log("Modo administrador activado");
      // Agregar indicador visual
      document.body.classList.add('modo-admin');
    }

    const res = await fetch("data/productos.json");
    productos = await res.json();
    configurarNavegacion();
    mostrarCategoria('inicio');
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mostrarError();
  }
}

// Configurar eventos de navegación
function configurarNavegacion() {
  document.querySelectorAll('[data-seccion]').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      const seccion = e.target.getAttribute('data-seccion');
      mostrarCategoria(seccion);
    });
  });
}

function mostrarCategoria(categoria) {
  categoriaActual = categoria;
  const config = categoriasConfig[categoria] || categoriasConfig.inicio;
  
  const main = document.getElementById("contenido");
  main.innerHTML = `
    <h2 class="titulo-degradado">${config.titulo}</h2>
    ${config.placeholderBusqueda ? 
      `<input type="text" placeholder="${config.placeholderBusqueda}" 
              oninput="filtrarProductos(event)" />` : ''}
    <div class="productos" id="lista-productos"></div>
  `;

  if (categoria === 'inicio') {
    mostrarProductos(productos);
  } else if (categoria === 'redes') {
    mostrarRedesSociales();
  } else {
    const productosCategoria = productos.filter(p => p.categoria === categoria);
    mostrarProductos(productosCategoria);
  }
}

// Función para filtrar productos
function filtrarProductos(event) {
  const texto = event.target.value.toLowerCase().trim();
  let productosFiltrados = [];
  
  if (categoriaActual === 'inicio') {
    // Búsqueda global en todas las categorías
    productosFiltrados = productos.filter(p => 
      p.nombre.toLowerCase().includes(texto)
    );
    
    if (productosFiltrados.length === 0 && texto !== '') {
      mostrarMensajeNoEncontradoGlobal(texto);
      return;
    }
  } else {
    // Búsqueda específica por categoría
    productosFiltrados = productos.filter(p => 
      p.categoria === categoriaActual && 
      p.nombre.toLowerCase().includes(texto)
    );
    
    if (productosFiltrados.length === 0 && texto !== '') {
      const productoEnOtraCategoria = productos.find(p => 
        p.nombre.toLowerCase().includes(texto)
      );
      
      if (productoEnOtraCategoria) {
        mostrarMensajeEnOtraCategoria(texto, productoEnOtraCategoria.categoria);
      } else {
        mostrarMensajeNoEncontrado(texto);
      }
      return;
    }
  }
  
  mostrarProductos(productosFiltrados);
}

// Mensaje cuando no se encuentra en ninguna categoría
function mostrarMensajeNoEncontrado(busqueda) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = `
    <div class="sin-resultados">
      <h3>No encontramos "${busqueda}" en ${categoriasConfig[categoriaActual].titulo}</h3>
      <h3>Recuerda que somos una tienda nueva. Si el producto que buscas no aparece en nuestro catálogo, 
         comunícate directamente con nosotros para validar su disponibilidad.</h3>
      <a href="https://wa.me/message/ZNPKZEB3UMEZA1" class="btn-contacto" target="_blank">Contactar por WhatsApp</a>
    </div>
  `;
}

// Mensaje cuando no se encuentra globalmente
function mostrarMensajeNoEncontradoGlobal(busqueda) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = `
    <div class="sin-resultados">
      <h3>No encontramos "${busqueda}" en nuestro catálogo</h3>
      <h3>Recuerda que somos una tienda nueva. Si el producto que buscas no aparece, 
         comunícate directamente con nosotros para validar su disponibilidad.</h3>
      <a href="https://wa.me/message/ZNPKZEB3UMEZA1" class="btn-contacto" target="_blank">Contactar por WhatsApp</a>
    </div>
  `;
}

// Mensaje cuando se encuentra en otra categoría
function mostrarMensajeEnOtraCategoria(busqueda, categoria) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = `
    <div class="sin-resultados">
      <h3>No encontramos "${busqueda}" en ${categoriasConfig[categoriaActual].titulo}</h3>
      <h3>Pero existe en la categoría: ${categoriasConfig[categoria].titulo}</h3>
      <button onclick="mostrarCategoria('${categoria}')" class="btn-ver-categoria">
        Ver en ${categoriasConfig[categoria].titulo}
      </button>
    </div>
  `;
}

function mostrarProductos(productosMostrar, busqueda = '', sugerencias = []) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = "";

  productosMostrar.forEach(producto => {
    const rutaImagen = obtenerRutaImagen(producto.imagenes[0]);
    const card = document.createElement("div");
    card.classList.add("producto");
    
    // Agregar clase adicional si es admin
    if (adminActivo) {
      card.classList.add("producto-admin");
    }
    
    card.innerHTML = `
      <img src="${rutaImagen}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='img/imagen-no-disponible.jpg'" />
      <h3>${producto.nombre}</h3>
      <p class="precio">$${producto.precio.toLocaleString()}</p>
      ${adminActivo ? `
        <div class="info-admin">
          <p><strong>ID:</strong> ${producto.id}</p>
          <p><strong>Enlace:</strong> <a href="${producto.link || '#'}" target="_blank">${producto.link || 'No disponible'}</a></p>
        </div>
      ` : ''}
      <button onclick="verProducto(${producto.id})">Ver detalles</button>
    `;
    contenedor.appendChild(card);
  });
}

// Función auxiliar para obtener la ruta correcta de la imagen
function obtenerRutaImagen(img) {
  if (img.startsWith('http')) {
    return img; // URL externa
  } else if (img.startsWith('/img/')) {
    return img.substring(1); // Quita la barra inicial para ruta absoluta
  } else if (img.startsWith('img/')) {
    return img; // Ruta relativa ya correcta
  }
  return `img/${img}`; // Nombre de archivo simple
}

// Función para mostrar redes sociales
function mostrarRedesSociales() {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = `
    <div class="redes-sociales-layout">
      <!-- Columna izquierda - Redes sociales -->
      <div class="redes-columna">
        <div class="red-social-card">
          <h3>
           WhatsApp
           <img src="img/whatsapp_icon_pequeño.png" alt="WhatsApp" class="social-iconos">
          </h3>
          <p>Contáctanos directamente</p>
          <a href="https://wa.me/message/ZNPKZEB3UMEZA1" class="btn-red-social" target="_blank">Contactar</a>
        </div>
        
        <div class="red-social-card">
          <h3>
          Facebook
          <img src="img/facebook_icon_130940.png" alt="Facebook" class="social-iconos">
          </h3>
          <p>Visita nuestra página</p>
          <a href="https://web.facebook.com/yitu.shop/" class="btn-red-social" target="_blank">Visitar</a>
        </div>
        
        <div class="red-social-card">
          <h3>
          Instagram
          <img src="img/Instagram_icon-icons.com_66804.png" alt="Instagram" class="social-iconos">
          </h3>
          <p>Síguenos para novedades</p>
          <a href="https://www.instagram.com/yitu_shop/" class="btn-red-social" target="_blank">Seguir</a>
        </div>
        
        <div class="red-social-card">
          <h3>
          TikTok
          <img src="img/tiktok_logo_icon_186896.png" alt="TikTok" class="social-iconos">
          </h3>
          <p>Descubre nuestro contenido</p>
          <a href="https://www.tiktok.com/@yitu_shop?is_from_webapp=1&sender_device=pc" class="btn-red-social" target="_blank">Seguir</a>
        </div>
      </div>
      
      <!-- Columna derecha - Descripción -->
      <div class="descripcion-columna">
        <h2>Descripción</h2>
        <ul class="descripcion-lista">
          <li>Somos Yitu, una empresa dedicada a ofrecer productos de alta calidad y diseño exclusivo.</li>
          <li>Nuestro catálogo incluye accesorios, perfumes y artículos para el hogar.</li>
          <li>Productos seleccionados cuidadosamente para nuestros clientes.</li>
          <li>Envíos a todo el país con garantía de satisfacción.</li>
        </ul>
      </div>
    </div>
  `;
}



// Función para mostrar detalles del producto
function verProducto(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const modal = document.createElement("div");
  modal.classList.add("modal", "mostrar");
  modal.innerHTML = `
    <div class="modal-contenido">
      <span class="cerrar">&times;</span>
      <h2>${producto.nombre}</h2>
      
      <div class="galeria">
        ${producto.imagenes.map(img => {
          const rutaImagen = obtenerRutaImagen(img);
          return `<img src="${rutaImagen}" alt="${producto.nombre}" 
                  onerror="this.onerror=null; this.src='img/imagen-no-disponible.jpg'" />`;
        }).join('')}
      </div>
      
      <div class="detalles-producto">
        <p>${producto.descripcion.replace(/\n/g, "<br>")}</p>
        <a class="precio">$${producto.precio.toLocaleString()}</a>
        ${adminActivo ? `
          <div class="info-admin">
            <p><strong>ID:</strong> ${producto.id}</p>
            <p><strong>Enlace:</strong> <a href="${producto.link || '#'}" target="_blank">${producto.link || 'No disponible'}</a></p>
          </div>
        ` : ''}
        <p>Recuerda que todos nuestros envios son totalmente gratis y nuestros pagos contraentrega</p>
        <p>cominicate con nosotros para mas informacion</p>
        <a href="#" class="btn-red-social" id="whatsapp" target="_blank">
          <img src="img/whatsapp_icon_pequeño.png" alt="WhatsApp" class="social-icon">
          WhatsApp
        </a>
      </div>
    </div>
  `;

  // Evento para cerrar el modal
  const btnCerrar = modal.querySelector('.cerrar');
  btnCerrar.addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = 'auto';
  });

  // Cerrar al hacer clic fuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = 'auto';
    }
  });

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Cerrar con tecla ESC
  const cerrarConEsc = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', cerrarConEsc);
      document.body.style.overflow = 'auto';
    }
  };
  document.addEventListener('keydown', cerrarConEsc);
}

// Mostrar error
function mostrarError() {
  const main = document.getElementById("contenido");
  main.innerHTML = `
    <div class="error">
      <h2>Error al cargar el catálogo</h2>
      <p>Por favor, intenta recargar la página o contacta al soporte técnico.</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  // Crear botón hamburguesa
  const btn = document.createElement("button");
  btn.className = "menu-toggle";
  btn.innerHTML = "&#9776;"; // ☰
  document.querySelector("header").prepend(btn);

  // Crear menú lateral
  const menuLateral = document.createElement("div");
  menuLateral.className = "menu-lateral";
  menuLateral.innerHTML = `
    <ul class="menu-lateral-lista">
      <li><a href="#" data-seccion="inicio">Inicio</a></li>
      <li><a href="#" data-seccion="redes">Redes</a></li>
      <li class="item-categorias">
        <a href="#" id="toggle-categorias">Categorías ></a>
        <ul class="submenu-categorias">
          <li><a href="#" data-seccion="perfumes">Perfumes</a></li>
          <li><a href="#" data-seccion="accesorios">Accesorios</a></li>
          <li><a href="#" data-seccion="hogar">Hogar</a></li>
          <li><a href="#" data-seccion="tecnologia">Tecnología</a></li>
        </ul>
      </li>
    </ul>
  `;
  document.body.appendChild(menuLateral);

  // Crear overlay
  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  document.body.appendChild(overlay);

  const submenu = menuLateral.querySelector(".submenu-categorias");
  const toggleCategorias = document.getElementById("toggle-categorias");

  // Botón hamburguesa clic
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const abierto = menuLateral.classList.contains("abierto");

    if (abierto) {
      cerrarTodo();
    } else {
      menuLateral.classList.add("abierto");
      overlay.classList.add("visible");
      btn.innerHTML = "&times;";
    }
  });

  // Desplegar/cerrar subcategorías
  toggleCategorias.addEventListener("click", (e) => {
    e.preventDefault();
    submenu.classList.toggle("visible");
    toggleCategorias.innerHTML = submenu.classList.contains("visible")
      ? "Categorías ⯅"
      : "Categorías ⯆";
  });

  // Cerrar al hacer clic fuera del menú
  overlay.addEventListener("click", cerrarTodo);

  // Cerrar al hacer clic en una opción
  menuLateral.querySelectorAll("a[data-seccion]").forEach((enlace) => {
    enlace.addEventListener("click", cerrarTodo);
  });

  // Función cerrar menú completo
  function cerrarTodo() {
    menuLateral.classList.remove("abierto");
    overlay.classList.remove("visible");
    submenu.classList.remove("visible");
    toggleCategorias.innerHTML = "Categorías ⯆";
    btn.innerHTML = "&#9776;";
  }

  // Mostrar botón solo en móvil
  function actualizarBoton() {
    if (window.innerWidth <= 768) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
      cerrarTodo();
    }
  }

  window.addEventListener("resize", actualizarBoton);
  actualizarBoton();
});



// Iniciar la aplicación
window.onload = cargarDatos;