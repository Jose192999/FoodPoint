#FoodPoint 
"FoodPoint" es una pagina web diseñada para conectar a los usuarios con los mejores lugares para comer cera de su ubicacion.
Nos permite explorar restaurantes, puestos de comida rapida, ver menus, etc.

#Caracteristicas principales
-Integracion de Maps
-Buscar comida cercana

#Tecnologias utilizadas
-HTML5
-CSS3
-JavaScript
-VS code
-GitHub
-Node.js
-MongoDB

#Como ejecutar el proyecto?
una vez creada tu cuenta de github y enlazada a tu computadora realiza lo siguiente:
-Crea una carpeta nueva: "FoodPoinPrincipal" por ejemplo.
-Entra a la terminal CMD de la carpeta y escribe lo siguiente:
(git clone https://github.com/Jose192999/FoodPoint.git)

#Como ver el proyecto?
1. En VS code, agrega la extension llamada "Live Preview" de Microsoft.
2. Busca el archivo index.html (dentro de la carpeta FrontEnd) y da click derecho.
3. Selecciona la opcion que dice "Show Preview".
4. Listo.

#Estructura actual del proyecto
FoodPoint/
    -FrontEnd/
         -index.html ---Pagina solo para administradores
         -style.css  ---Estilo de la pagina
         -script.js  ---Logica 
         -bienvenida.html ---Es la pagina de incio
         -bienvenida.css  ---Estilo de la pagina de incio
         -indexUser.html  ---Pagina solo para usuarios
         -login.html      ---Pagina de login
         -loginstyle.css  ---Estilo de login
         -login.js        ---Logica de login
    -BackEnd/
         -node_modules/   ---Modulos de node
         -package.json    ---Ayuda con la conexion del servidor
         -server.js       ---Conexion con mongo + sentencias
    -README.md  ---Documentacion del proyecto