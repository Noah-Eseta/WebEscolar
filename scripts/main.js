// Lógica del formulario de inicio de sesión
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const user = document.getElementById('DNI').value;
        const pass = document.getElementById('contrasena').value;
        const errorDiv = document.getElementById('loginError');
        try {
            const response = await fetch('data/usuarios.json');
            const usuarios = await response.json();
            const cuenta = usuarios.find(u => u.usuario === user && u.contrasena === pass);
            if (cuenta) {
                errorDiv.textContent = '';
                localStorage.setItem('cuenta', JSON.stringify(cuenta));
                window.location.href = 'inicio.html';
            } else {
                errorDiv.textContent = 'Usuario o contraseña incorrectos.';
            }
        } catch (err) {
            errorDiv.textContent = 'Error al cargar usuarios.';
        }
    });
}
