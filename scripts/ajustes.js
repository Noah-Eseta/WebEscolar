document.addEventListener('DOMContentLoaded', function() {
    const btnCerrar = document.getElementById('cerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', function() {
            localStorage.removeItem('cuenta');
            window.location.href = 'index.html';
        });
    }
});
