console.log("FoodPoint");

let map;
let clicLatLng = null;
let marcadorTemporal = null;
let fotoBase64 = null;
let miMarcador = null;   // puntito azul

document.addEventListener("DOMContentLoaded", function () {

    // 1. PRIMERO CREAMOS EL MAPA
    map = L.map('map').setView([32.52953165154265, -116.98741844848874], 17);

    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; Stadia Maps',
        maxZoom: 20
    }).addTo(map);

    // 2. CARGAMOS MARCADORES GUARDADOS
    cargarMarcadores();

    // 3. AHORA SÍ: UBICACIÓN AUTOMÁTICA (después de crear el mapa)
    intentarUbicacion();

    // 4. CLIC EN EL MAPA
    map.on('click', function (e) {
        clicLatLng = e.latlng;
        if (marcadorTemporal) marcadorTemporal.remove();
        marcadorTemporal = L.circleMarker(e.latlng, {
            radius: 14,
            color: '#ff0000',
            fillOpacity: 0.8,
            weight: 5
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

                // Ahora sí: el mapa YA existe → podemos moverlo
                map.setView([lat, lng], 18);

                // Quitar marcador anterior si existe
                if (miMarcador) miMarcador.remove();

                const iconoAzul = L.divIcon({
                    html: '<div style="background:#4285f4;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(66,133,244,0.4);animation:pulso-ubicacion 2s infinite;"></div>',
                    iconSize: [28, 28],
                    className: ''
                });

                miMarcador = L.marker([lat, lng], { icon: iconoAzul, zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup("<b style='color:#4285f4;'>¡Estás aquí!</b>")
                    .openPopup();
            },
            error => {
                console.log("Ubicación rechazada o no disponible");
                // Si falla, se queda en el TEC (ya está por defecto)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    // ==================== TODAS LAS DEMÁS FUNCIONES (igual que antes) ====================
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

    function guardarMarcador(lat, lng, nombre, descripcion, foto = null) {
        const marcadores = JSON.parse(localStorage.getItem('FoodPoint_marcadores') || '[]');
        marcadores.push({ lat, lng, nombre, descripcion, foto });
        localStorage.setItem('FoodPoint_marcadores', JSON.stringify(marcadores));
        actualizarLista();
    }

    function cargarMarcadores() {
        map.eachLayer(l => {
            if (l instanceof L.Marker && l !== miMarcador) map.removeLayer(l);
            if (l instanceof L.CircleMarker) map.removeLayer(l);
        });
        const marcadores = JSON.parse(localStorage.getItem('FoodPoint_marcadores') || '[]');
        marcadores.forEach(m => crearMarcadorVisual(m.lat, m.lng, m.nombre, m.descripcion, m.foto));
        actualizarLista();
    }

    function actualizarLista() {
        const lista = document.getElementById('listaContenido');
        lista.innerHTML = '';
        const marcadores = JSON.parse(localStorage.getItem('FoodPoint_marcadores') || '[]');
        if (marcadores.length === 0) {
            lista.innerHTML = '<p style="text-align:center;color:#999;padding:50px;font-size:18px;">No hay puestos aún<br>Haz clic en el mapa para agregar el primero</p>';
            return;
        }
        marcadores.forEach(m => {
            lista.innerHTML += `<div class="puesto-item">
                ${m.foto ? `<img src="${m.foto}" alt="${m.nombre}">` : '<div style="width:80px;height:80px;background:#eee;border-radius:12px;"></div>'}
                <div class="puesto-info"><h3>${m.nombre}</h3><p>${m.descripcion}</p></div>
            </div>`;
        });
    }

    // Formulario, foto, borrar todo… (todo igual que antes)
    document.getElementById('cerrarFormulario').onclick = () => {
        document.getElementById('formularioFlotante').classList.remove('mostrar');
        if (marcadorTemporal) marcadorTemporal.remove();
        marcadorTemporal = null;
        clicLatLng = null;
    };

    document.getElementById('formularioFlotante').onclick = e => {
        if (e.target === e.currentTarget) {
            document.getElementById('formularioFlotante').classList.remove('mostrar');
            if (marcadorTemporal) marcadorTemporal.remove();
            marcadorTemporal = null;
            clicLatLng = null;
        }
    };

    document.getElementById('postForm').onsubmit = e => {
        e.preventDefault();
        const nombre = document.getElementById('name').value.trim();
        const desc = document.getElementById('description').value.trim();
        if (!nombre || !desc || !clicLatLng) return alert("Faltan datos");

        crearMarcadorVisual(clicLatLng.lat, clicLatLng.lng, nombre, desc, fotoBase64);
        guardarMarcador(clicLatLng.lat, clicLatLng.lng, nombre, desc, fotoBase64);

        e.target.reset();
        document.getElementById('vistaPrevia').style.display = 'none';
        fotoBase64 = null;
        if (marcadorTemporal) marcadorTemporal.remove();
        document.getElementById('formularioFlotante').classList.remove('mostrar');
        actualizarLista();
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

    document.getElementById('borrarMarcadores').onclick = () => {
        localStorage.removeItem('FoodPoint_marcadores');
        cargarMarcadores();
    };
});