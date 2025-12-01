//verificar usuario
document.getElementById("loginform").addEventListener("submit", function(event) {
    event.preventDefault(); 

    const user = document.getElementById("userID").value.trim();
    const pass = document.getElementById("contraID").value;

    if (user === "usuario" && pass === "1234") {
        window.location.href = "indexUser.html"; 
    }
    else if (user === "jose" && pass === "joseluis89") {
        window.location.href = "index.html";  
    }
    else {
        alert("Usuario o contraseña incorrectos");
        document.getElementById("userID").value = "";
        document.getElementById("contraID").value = "";
    }
});
