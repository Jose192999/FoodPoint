let map;
let clicLatLng = null;
let marcadorTemporal = null;
let fotoBase64 = null;
let miMarcador = null;
let marcadoresConInfo = [];  // { marker, id }

document.addEventListener("DOMContentLoaded", function () {

    map = L.map('map').setView([32.5295, -116.9874], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    cargarMarcadores();
    intentarUbicacion();

    map.on('click', e => {
        clicLatLng = e.latlng;
        if (marcadorTemporal) marcadorTemporal.remove();
        marcadorTemporal = L.circleMarker(e.latlng, { radius: 14, color: '#ff0000', fillOpacity: 0.8, weight: 5 }).addTo(map);
        document.getElementById('formularioFlotante').classList.add('mostrar');
    });

    function intentarUbicacion() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(pos => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 18);
            if (miMarcador) miMarcador.remove();
            miMarcador = L.marker([pos.coords.latitude, pos.coords.longitude], {
                icon: L.divIcon({
                    html: '<div style="background:#4285f4;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(66,133,244,0.4);"></div>',
                    iconSize: [28,28], className: ''
                })
            }).addTo(map).bindPopup("¡Estás aquí!").openPopup();
        });
    }

    function crearMarcadorVisual(lat, lng, nombre, descripcion, foto = null) {
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({ html: '<div class="custom-marker"></div>', iconSize: [30,30], className: '' })
        }).addTo(map);
        let popup = `<b style="font-size:18px;color:#ff6b35;">${nombre}</b><br>${descripcion}`;
        if (foto) popup += `<br><img src="${foto}" style="width:100%;max-width:220px;border-radius:12px;margin-top:10px;">`;
        marker.bindPopup(popup, {maxWidth: 280});
        return marker;
    }

    async function guardarMarcador(lat, lng, nombre, descripcion, foto = null) {
        try {
            await fetch('http://localhost:3000/puestos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({lat, lng, nombre, descripcion, foto})
            });
            cargarMarcadores();
        } catch { alert("Error al guardar"); }
    }

    async function cargarMarcadores() {
        map.eachLayer(l => {
            if ((l instanceof L.Marker && l !== miMarcador) || l instanceof L.CircleMarker) map.removeLayer(l);
        });
        marcadoresConInfo = [];

        try {
            const res = await fetch('http://localhost:3000/puestos');
            const puestos = await res.json();

            puestos.forEach(p => {
                const marker = crearMarcadorVisual(p.lat, p.lng, p.nombre, p.descripcion, p.foto);
                marcadoresConInfo.push({ marker: marker, id: p._id });
            });

            actualizarLista(puestos);

        } catch (err) {
            console.log("Backend apagado");
        }
    }

    // LISTA CON BOTONES REALES (ESTO SÍ FUNCIONA)
    function actualizarLista(puestos) {
    const lista = document.getElementById('listaContenido');
    lista.innerHTML = '';

    if (puestos.length === 0) {
        lista.innerHTML = '<p style="text-align:center;color:#999;padding:50px;">No hay puestos aún<br>Haz clic en el mapa para agregar uno</p>';
        return;
    }

    puestos.forEach(puesto => {
        const info = marcadoresConInfo.find(m => m.id === puesto._id);
        if (!info) return;

        const div = document.createElement('div');
        div.className = 'puesto-item';  // ← vuelve al estilo original
        div.style.cursor = 'pointer';

        div.innerHTML = `
            ${puesto.foto ? `<img src="${puesto.foto}" alt="${puesto.nombre}">` : '<div style="width:80px;height:80px;background:#eee;border-radius:12px;"></div>'}
            <div class="puesto-info">
                <h3>${puesto.nombre}</h3>
                <p>${puesto.descripcion}</p>
            </div>
            <span style="margin-left:auto;color:#ff6b35;font-weight:bold;">Ver en mapa →</span>
        `;

        // EL CLICK QUE NUNCA FALLA
        div.onclick = () => {
            map.flyTo([puesto.lat, puesto.lng], 19, { duration: 1.0 });
            setTimeout(() => info.marker.openPopup(), 600);
        };

        lista.appendChild(div);
    });
}

    // FORMULARIO Y DEMÁS
    document.getElementById('postForm').onsubmit = async e => {
        e.preventDefault();
        const nombre = document.getElementById('name').value.trim();
        const desc = document.getElementById('description').value.trim();
        if (!nombre || !desc || !clicLatLng) return alert("Faltan datos");
        await guardarMarcador(clicLatLng.lat, clicLatLng.lng, nombre, desc, fotoBase64);
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
        marcadorTemporal = null; clicLatLng = null;
    };

    document.getElementById('borrarMarcadores').onclick = async () => {
        if (confirm("¿Borrar TODOS los puestos?")) {
            await fetch('http://localhost:3000/puestos', {method: 'DELETE'});
            cargarMarcadores();
        }
    };

});