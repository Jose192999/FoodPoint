console.log("FoodPoint Web iniciada");

document.addEventListener("DOMContentLoaded", function() {
    console.log("Todo cargado, activando FoodPoint...");

    //variables
    const mapa = document.getElementById('mapa-imagen');
    const contenedor = document.querySelector('.map-container');
    let clicX = 0;
    let clicY = 0;
    let marcadorTemporal = null;
    let fotoBase64 = null;

    //cargar marcadores guardados
    function cargarMarcadores() {
        let marcadores = JSON.parse(localStorage.getItem('FoodPoint_marcadores')) || [];
        console.log("Cargando " + marcadores.length + " marcadores");
        marcadores.forEach(m => {
            crearMarcadorVisual(m.x, m.y, m.nombre, m.descripcion, m.foto || null);
        });
        
        actualizarLista();
    }

    //detectar clic en mapa
    mapa.addEventListener('click', function(e){
        const rect = mapa.getBoundingClientRect();
        clicX = e.clientX - rect.left;
        clicY = e.clientY - rect.top;

        //marcador temporal
        if (marcadorTemporal) marcadorTemporal.remove();
        marcadorTemporal = document.createElement('div');
        marcadorTemporal.className = 'marcador-temporal';
        marcadorTemporal.style.left = clicX + 'px';
        marcadorTemporal.style.top = clicY + 'px';
        contenedor.appendChild(marcadorTemporal);

        //mostrar formulario flotante
        document.getElementById('formularioFlotante').classList.add('mostrar');
    });

    //cerrar formulario
    document.getElementById('cerrarFormulario').addEventListener('click', function() {
        document.getElementById('formularioFlotante').classList.remove('mostrar');
        if (marcadorTemporal) marcadorTemporal.remove();
        clicX = 0; clicY = 0;
    });

    //cerrar formulario haciendo click afuera
    document.getElementById('formularioFlotante').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('mostrar');
            if (marcadorTemporal) marcadorTemporal.remove();
            clicX = 0; clicY = 0;
        }
    });

    //enviar formulario
    document.getElementById('postForm').addEventListener('submit', function(e){
        e.preventDefault();

        const nombre = document.getElementById('name').value.trim();
        const descripcion = document.getElementById('description').value.trim();

        if (!nombre || !descripcion) {
            alert("Llena todos los campos");
            return;
        }

        if(clicX === 0 && clicY === 0) {
            alert("Primero haz clic en el mapa para elegir ubicación");
            return;
        }

        crearMarcadorVisual(clicX, clicY, nombre, descripcion, fotoBase64);
        guardarMarcador(clicX, clicY, nombre, descripcion, fotoBase64);

        document.getElementById('postForm').reset();
        document.getElementById('vistaPrevia').src = '';
        fotoBase64 = null;
        clicX = 0;
        clicY = 0;
        if (marcadorTemporal) marcadorTemporal.remove();
        document.getElementById('formularioFlotante').classList.remove('mostrar');

        actualizarLista();
    });

    //vista previa de la foto
    document.getElementById('fotoInput').addEventListener('change', function(e){
        const file = e.target.files[0];
        const img = document.getElementById('vistaPrevia');

        if(file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const img = document.getElementById('vistaPrevia');
                img.src = ev.target.result;
                img.style.display = 'block';
                fotoBase64 = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
        else {
            img.src = '';
            img.style.display = 'none';
            fotoBase64 = null;
        }
    });

    //crear marcador visual
    function crearMarcadorVisual(x, y, nombre, descripcion, foto = null){
        const marcador = document.createElement('div');
        marcador.className = 'marcador';
        marcador.style.left = x + 'px';
        marcador.style.top = y + 'px';

        const info = document.createElement('div');
        info.className = 'info-marcador';
        info.innerHTML = `
            <span class="cerrar-info" onclick="this.parentElement.style.display='none'">×</span>
            <h3>${nombre}</h3>
            <p>${descripcion}</p>
            ${foto ? `<img src="${foto}" style="width:100%; max-width:180px; border-radius:10px; margin-top:10px;">` : ''}
        `;
        info.style.left = (x + 20) + 'px';
        info.style.top = (y - 60) + 'px';

        marcador.addEventListener('click', function(e){
            e.stopPropagation();
            document.querySelectorAll('.info-marcador').forEach(i => i.style.display = 'none');
            info.style.display = 'block';
        });

        contenedor.appendChild(marcador);
        contenedor.appendChild(info);
    }
    
    //actualizar lista
    function actualizarLista() {
        const lista = document.getElementById('listaContenido');
        lista.innerHTML = '';

        const marcadores = JSON.parse(localStorage.getItem('FoodPoint_marcadores')) || [];

        if (marcadores.length === 0) {
            lista.innerHTML = '<p style="text-align:center; color:#999; padding:30px;">No hay puestos aún</p>';
            return;
        }

        marcadores.forEach((m, index) => {
            const item = document.createElement('div');
            item.className = 'puesto-item';
            item.innerHTML = `
                ${m.foto ? `<img src="${m.foto}" alt="${m.nombre}">` : '<div style="width:80px;height:80px;background:#eee;border-radius:12px;margin-right:15px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:12px;">Sin foto</div>'}
                <div class="puesto-info">
                    <h3>${m.nombre}</h3>
                    <p>${m.descripcion}</p>
                </div>
            `;

            item.addEventListener('click', () => {
                document.querySelectorAll('.info-marcador').forEach(i => i.style.display = 'none');
                const todasInfos = document.querySelectorAll('.info-marcador');
                if (todasInfos[index]) todasInfos[index].style.display = 'block';
            });
            lista.appendChild(item);
        });
    }

    //guardar 
    function guardarMarcador(x, y, nombre, descripcion, foto = null) {
        let marcadores = JSON.parse(localStorage.getItem('FoodPoint_marcadores')) || [];
        marcadores.push({ x, y, nombre, descripcion, foto });
        localStorage.setItem('FoodPoint_marcadores', JSON.stringify(marcadores));
    }

    //cargar marcadores
    cargarMarcadores();

    //borrar marcadores
    document.getElementById('borrarMarcadores').addEventListener('click', function(){
        localStorage.removeItem('FoodPoint_marcadores');
        document.querySelectorAll('.marcador, .info-marcador, .marcador-temporal').forEach(el => el.remove());
        if (marcadorTemporal) marcadorTemporal = null;
        alert('Mapa limpio');

        actualizarLista();
    });
});
