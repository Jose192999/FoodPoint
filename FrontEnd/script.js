console.log("FoodPoint con SQL Server");

let map;
let clicLatLng = null;
let marcadorTemporal = null;
let fotoBase64 = null;
let miMarcador = null;

document.addEventListener("DOMContentLoaded", function () {

    // CREAR MAPA
    map = L.map('map').setView([32.5295, -116.9874], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 20
    }).addTo(map);

    // CARGAR PUESTOS DESDE SQL SERVER AL INICIAR
    cargarMarcadores();

    // UBICACIÓN AUTOMÁTICA
    intentarUbicacion();

    // CLIC EN EL MAPA
    map.on('click', function (e) {
        clicLatLng = e.latlng;
        if (marcadorTemporal) marcadorTemporal.remove();
        marcadorTemporal = L.circleMarker(e.latlng, {
            radius: 14, color: '#ff0000', fillOpacity: 0.8, weight: 5
        }).addTo(map);
        document.getElementById('formularioFlotante').classList.add('mostrar');
    });

    // ==================== UBICACIÓN AUTOMÁTICA ====================
    function intentarUbicacion() {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                map.setView([lat, lng], 18);

                if (miMarcador) miMarcador.remove();
                const iconoAzul = L.divIcon({
                    html: '<div style="background:#4285f4;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(66,133,244,0.4);animation:pulso-ubicacion 2s infinite;"></div>',
                    iconSize: [28, 28],
                    className: ''
                });

                miMarcador = L.marker([lat, lng], { icon: iconoAzul, zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup("¡Estás aquí!")
                    .openPopup();
            },
            () => console.log("Ubicación rechazada")
        );
    }

    // ==================== CREAR MARCADOR VISUAL ====================
    function crearMarcadorVisual(lat, lng, nombre, descripcion, foto = null) {
        const icono = L.divIcon({
            html: '<div class="custom-marker"></div>',
            iconSize: [30, 30],
            className: ''
        });
        const marker = L.marker([lat, lng], { icon: icono }).addTo(map);
        let contenido = `<b style="font-size:18px;color:#ff6b35;">${nombre}</b><br>${descripcion}`;
        if (foto) contenido += `<br><img src="${foto}" style="width:100%;max-width:220px;border-radius:12px;margin-top:10px;">`;
        marker.bindPopup(contenido, { maxWidth: 280 });
    }

    // ==================== GUARDAR EN SQL SERVER ====================
    async function guardarMarcador(lat, lng, nombre, descripcion, foto = null) {
        try {
            await fetch('http://localhost:3000/puestos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng, nombre, descripcion, foto })
            });
            // RECARGAR MAPA Y LISTA DESPUÉS DE GUARDAR
            cargarMarcadores();
        } catch (err) {
            alert("Error al guardar");
        }
    }

    // CARGAR DESDE MONGODB (limpia y vuelve a dibujar todo)
    async function cargarMarcadores() {
        // Limpiar marcadores antiguos (excepto el puntito azul)
        map.eachLayer(l => {
            if ((l instanceof L.Marker && l !== miMarcador) || l instanceof L.CircleMarker) {
                map.removeLayer(l);
            }
        });

        try {
            const res = await fetch('http://localhost:3000/puestos');
            const puestos = await res.json();

            puestos.forEach(p => {
                crearMarcadorVisual(p.lat, p.lng, p.nombre, p.descripcion, p.foto);
            });

            // ACTUALIZAR LA LISTA DE ABAJO
            actualizarLista(puestos);
        } catch (err) {
            console.log("Backend apagado");
        }
    }

    // NUEVA FUNCIÓN PARA ACTUALIZAR LA LISTA
    function actualizarLista(puestos) {
        const lista = document.getElementById('listaContenido');
        lista.innerHTML = '';

        if (puestos.length === 0) {
            lista.innerHTML = '<p style="text-align:center;color:#999;padding:50px;">No hay puestos aún<br>Haz clic en el mapa para agregar uno</p>';
            return;
        }

        puestos.forEach(p => {
            lista.innerHTML += `
                <div class="puesto-item">
                    ${p.foto ? `<img src="${p.foto}" alt="${p.nombre}">` : '<div style="width:80px;height:80px;background:#eee;border-radius:12px;"></div>'}
                    <div class="puesto-info">
                        <h3>${p.nombre}</h3>
                        <p>${p.descripcion}</p>
                    </div>
                </div>`;
        });
    }

    document.getElementById('postForm').onsubmit = async e => {
        e.preventDefault();
        const nombre = document.getElementById('name').value.trim();
        const desc = document.getElementById('description').value.trim();
        if (!nombre || !desc || !clicLatLng) return alert("Faltan datos");

        await guardarMarcador(clicLatLng.lat, clicLatLng.lng, nombre, desc, fotoBase64);

        // Limpiar formulario
        e.target.reset();
        document.getElementById('vistaPrevia').style.display = 'none';
        fotoBase64 = null;
        if (marcadorTemporal) marcadorTemporal.remove();
        document.getElementById('formularioFlotante').classList.remove('mostrar');
    };

    document.getElementById('fotoInput').onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
                document.getElementById('vistaPrevia').src = ev.target.result;
                document.getElementById('vistaPrevia').style.display = 'block';
                fotoBase64 = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('cerrarFormulario').onclick = () => {
        document.getElementById('formularioFlotante').classList.remove('mostrar');
        if (marcadorTemporal) marcadorTemporal.remove();
        marcadorTemporal = null;
        clicLatLng = null;
    };

    // ==================== BORRAR TODO ====================
    document.getElementById('borrarMarcadores').onclick = async () => {
        if (confirm("¿Borrar TODOS los puestos de la base de datos?")) {
            try {
                await fetch('http://localhost:3000/puestos', { method: 'DELETE' });
                cargarMarcadores();
            } catch (err) {
                alert("Error al borrar");
            }
        }
    };
});