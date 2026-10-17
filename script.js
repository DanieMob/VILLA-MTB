
document.addEventListener("DOMContentLoaded", () => {

    const paneles = [
        {
            boton: "botonRuta",
            informacion: "informacionRuta",
            textoMostrar: "Ver información de rutas",
            textoOcultar: "Ocultar información de rutas"
        },
        {
            boton: "botonGaleria",
            informacion: "informacionGaleria",
            textoMostrar: "Ver información de la galería",
            textoOcultar: "Ocultar información de la galería"
        },
        {
            boton: "botonContacto",
            informacion: "informacionContacto",
            textoMostrar: "Ver información de contacto",
            textoOcultar: "Ocultar información de contacto"
        },
        {
            boton: "botonSobre",
            informacion: "informacionSobre",
            textoMostrar: "Conocer más",
            textoOcultar: "Mostrar menos"
        },

        {
            boton: "botonRutas",
            informacion: "Ruta1",
            textoMostrar: "Ver ruta completa",
            textoOcultar: "Ocultar información de ruta"

        },
        {
            boton: "botonRutas2",
            informacion: "Ruta2",
            textoMostrar: "Ver ruta completa",
            textoOcultar: "Ocultar información de ruta"
        },

        {
            boton: "botonRutas3",
            informacion: "Ruta3",
            textoMostrar: "Ver ruta completa",
            textoOcultar: "Ocultar información de ruta"    
        },

         {
            boton: "botonRutas4",
            informacion: "Ruta4",
            textoMostrar: "Ver ruta completa",
            textoOcultar: "Ocultar información de ruta"
         },

         { 
            boton: "botonGaleria",
            informacion: "galeria1",
            textoMostrar: "Ver más galería",
            textoOcultar: "Ocultar información de la galería"
         },

        {
            boton: "botonGaleria2",
            informacion: "galeria2",
            textoMostrar: "Ver más galería",
            textoOcultar: "Ocultar información de la galería"
        },

        {
            boton: "botonGaleria3",
            informacion: "galeria3",
            textoMostrar: "Ver más galería",
            textoOcultar: "Ocultar información de la galería"
        },

        {
            boton: "botonGaleria4",
            informacion: "galeria4",
            textoMostrar: "Ver más galería",
            textoOcultar: "Ocultar información de la galería"
        }

    ];

    paneles.forEach((panel) => {
        const boton = document.getElementById(panel.boton);
        const informacion = document.getElementById(panel.informacion);

        if (!boton || !informacion) {
            return;
        }

        boton.addEventListener("click", () => {
            const mostrar = informacion.hidden;

            informacion.hidden = !mostrar;

            boton.textContent = mostrar
                ? panel.textoOcultar
                : panel.textoMostrar;
        });
    });

});




/* =========================================
   BUSCADOR GLOBAL DE VILLA MTB
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const buscador = document.getElementById("busquedaGlobal");

    if (!buscador) {
        return;
    }

    const paginas = [
        "index.html",
        "rutas.html",
        "galerias.html",
        "contacto.html"
    ];

    // Tarjetas de la página que está abierta.
    const tarjetasLocales = Array.from(
        document.querySelectorAll("article")
    );

    // Contenedor donde aparecerán los resultados globales.
    const resultados = document.createElement("section");

    resultados.id = "resultadosBusqueda";
    resultados.hidden = true;
    resultados.setAttribute("aria-live", "polite");

    resultados.style.width = "90%";
    resultados.style.maxWidth = "1100px";
    resultados.style.margin = "20px auto";
    resultados.style.padding = "20px";
    resultados.style.backgroundColor = "#222";
    resultados.style.color = "white";
    resultados.style.borderRadius = "12px";

    const navegacion = document.querySelector("nav");

    if (navegacion) {
        navegacion.insertAdjacentElement("afterend", resultados);
    } else {
        document.body.prepend(resultados);
    }

    let ultimaBusqueda = 0;

    function normalizar(texto) {
        return texto
            .toLocaleLowerCase("es")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    async function buscarEnTodoElSitio(consulta) {

        const numeroBusqueda = ++ultimaBusqueda;
        const termino = normalizar(consulta);

        // Sin texto, se restauran todas las tarjetas.
        if (!termino) {

            tarjetasLocales.forEach((tarjeta) => {
                tarjeta.hidden = false;
            });

            resultados.hidden = true;
            resultados.replaceChildren();

            return;
        }

        resultados.hidden = false;
        resultados.replaceChildren();

        const titulo = document.createElement("h2");
        titulo.textContent = "Resultados de búsqueda";
        resultados.appendChild(titulo);

        const mensaje = document.createElement("p");
        mensaje.textContent = "Buscando...";
        resultados.appendChild(mensaje);

        // Filtrar las tarjetas de la página actual.
        tarjetasLocales.forEach((tarjeta) => {

            const contenido = normalizar(tarjeta.textContent);

            tarjeta.hidden = !contenido.includes(termino);

        });

        // Consultar las cuatro páginas.
        const consultas = paginas.map(async (pagina) => {

            try {

                const respuesta = await fetch(pagina);

                if (!respuesta.ok) {
                    return [];
                }

                const html = await respuesta.text();

                const documento = new DOMParser().parseFromString(
                    html,
                    "text/html"
                );

                const tarjetas = Array.from(
                    documento.querySelectorAll("article")
                );

                return tarjetas
                    .filter((tarjeta) =>
                        normalizar(tarjeta.textContent).includes(termino)
                    )
                    .map((tarjeta) => {

                        const encabezado = tarjeta.querySelector(
                            "h1, h2, h3, h4"
                        );

                        return {
                            pagina: pagina,
                            titulo: encabezado
                                ? encabezado.textContent.trim()
                                : documento.title,
                            texto: tarjeta.textContent
                                .replace(/\s+/g, " ")
                                .trim()
                        };

                    });

            } catch (error) {

                console.error(
                    "No se pudo consultar " + pagina,
                    error
                );

                return [];
            }

        });

        const grupos = await Promise.all(consultas);

        // Ignorar resultados de búsquedas anteriores.
        if (numeroBusqueda !== ultimaBusqueda) {
            return;
        }

        const encontrados = grupos.flat();

        resultados.replaceChildren();
        resultados.appendChild(titulo);

        if (encontrados.length === 0) {

            const sinResultados = document.createElement("p");

            sinResultados.textContent =
                "No se encontraron coincidencias.";

            resultados.appendChild(sinResultados);

            return;
        }

        const lista = document.createElement("ul");

        encontrados.forEach((resultado) => {

            const elemento = document.createElement("li");
            elemento.style.marginBottom = "15px";

            const enlace = document.createElement("a");

            enlace.href =
                resultado.pagina +
                "?buscar=" + encodeURIComponent(consulta);

            enlace.textContent =
                resultado.titulo + " (" + resultado.pagina + ")";

            enlace.style.color = "white";
            enlace.style.fontWeight = "bold";

            elemento.appendChild(enlace);

            const descripcion = document.createElement("p");

            descripcion.textContent =
                resultado.texto.length > 180
                    ? resultado.texto.slice(0, 180) + "..."
                    : resultado.texto;

            elemento.appendChild(descripcion);
            lista.appendChild(elemento);

        });

        resultados.appendChild(lista);
    }

    buscador.addEventListener("input", () => {
        buscarEnTodoElSitio(buscador.value);
    });

    // Si se llega desde un resultado de otra página,
    // recuperar automáticamente el término buscado.
    const parametros = new URLSearchParams(window.location.search);
    const busquedaInicial = parametros.get("buscar");

    if (busquedaInicial) {
        buscador.value = busquedaInicial;
        buscarEnTodoElSitio(busquedaInicial);
    }

});
