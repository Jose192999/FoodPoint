document.getElementById("loginform").addEventListener("submit", function(event) 
{
    event.preventDefault(); 
    
    const user = document.getElementById("userID").value;
    const pass = document.getElementById("contraID").value;

    const userPrueba = "jose";
    const contraPrueba = "1234";

    if (user === userPrueba && pass === contraPrueba) {
        window.location.href = "index.html";  
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});
