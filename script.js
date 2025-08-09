let productos = [];
let adminActivo = false;
let categoriaActual = 'inicio';

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

// Cargar datos iniciales
async function cargarDatos() {
  try {
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

// Mostrar categoría seleccionada
function mostrarCategoria(categoria) {
  categoriaActual = categoria;
  const config = categoriasConfig[categoria] || categoriasConfig.inicio;
  
  const main = document.getElementById("contenido");
  main.innerHTML = `
    <h2>${config.titulo}</h2>
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
  const texto = event.target.value.toLowerCase();
  let productosFiltrados = [];
  
  if (categoriaActual === 'inicio') {
    productosFiltrados = productos.filter(p => 
      p.nombre.toLowerCase().includes(texto)
    );
  } else {
    productosFiltrados = productos.filter(p => 
      p.categoria === categoriaActual && 
      p.nombre.toLowerCase().includes(texto)
    );
    
    if (productosFiltrados.length === 0 && texto.trim() !== '') {
      const enOtrasCategorias = productos.filter(p => 
        p.nombre.toLowerCase().includes(texto)
      );
      
      if (enOtrasCategorias.length > 0) {
        mostrarProductos([], texto, enOtrasCategorias);
        return;
      }
    }
  }
  
  mostrarProductos(productosFiltrados, texto);
}

// Mostrar productos (con manejo de no resultados)
function mostrarProductos(productosMostrar, busqueda = '', sugerencias = []) {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = "";

  if (productosMostrar.length === 0) {
    if (busqueda && sugerencias.length > 0) {
      let html = `
        <div class="sin-resultados">
          <p>No encontramos "${busqueda}" en ${categoriasConfig[categoriaActual].titulo}</p>
          <p>Pero tenemos estos productos en otras categorías:</p>
          <div class="sugerencias">
      `;
      
      sugerencias.forEach(producto => {
        const rutaImagen = obtenerRutaImagen(producto.imagenes[0]);
        html += `
          <div class="sugerencia">
            <img src="${rutaImagen}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='img/imagen-no-disponible.jpg'" />
            <div>
              <h3>${producto.nombre}</h3>
              <p class="categoria">${categoriasConfig[producto.categoria].titulo}</p>
              <button onclick="mostrarCategoria('${producto.categoria}')">
                Ver en ${categoriasConfig[producto.categoria].titulo}
              </button>
            </div>
          </div>
        `;
      });
      
      html += `</div></div>`;
      contenedor.innerHTML = html;
    } else {
      contenedor.innerHTML = `
        <div class="sin-resultados">
          <p>No hay productos disponibles en esta categoría.</p>
          ${busqueda ? `<p>No encontramos resultados para "${busqueda}".</p>` : ''}
        </div>
      `;
    }
    return;
  }

  // Mostrar productos normales
  productosMostrar.forEach(producto => {
    const rutaImagen = obtenerRutaImagen(producto.imagenes[0]);
    const card = document.createElement("div");
    card.classList.add("producto");
    card.innerHTML = `
      <img src="${rutaImagen}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='img/imagen-no-disponible.jpg'" />
      <h3>${producto.nombre}</h3>
      <p class="precio">$${producto.precio.toLocaleString()}</p>
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
    <div class="redes-sociales">
      <div class="red-social">
        <h3>WhatsApp</h3>
        <p>Contáctanos directamente</p>
        <a href="#" class="btn-red">Contactar</a>
      </div>
      <div class="red-social">
        <h3>Instagram</h3>
        <p>Síguenos para novedades</p>
        <a href="#" class="btn-red">Seguir</a>
      </div>
      
      <div class="red-social">
      <a href="#" id="facebook" target="_blank">
        <img src="img/facebook_icon_130940.png" alt="Facebook" class="social-icon">
        Facebook
      </a>
        <p>Visita nuestra página</p>
        <a href="#" class="btn-red">Visitar</a>
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
        <p>${producto.descripcion}</p>
        <p class="precio">$${producto.precio.toLocaleString()}</p>
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

// Iniciar la aplicación
window.onload = cargarDatos;