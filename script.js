
function entrar() {
    const email = document.getElementById('correo').value;
    if (email === "enri290@gmail.com" || email === "dinamitagym00@gmail.com") {
        document.getElementById("moduloControl").classList.remove("hidden");
    } else {
        alert("Correo no autorizado");
    }
}

function registrar() {
    alert("Función de registro activa");
}

function verCalendario() {
    alert("Vista calendario");
}

function exportar() {
    alert("Exportando a PDF / Excel");
}
