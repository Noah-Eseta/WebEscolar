// Script para mostrar los datos del usuario según el rango
document.addEventListener('DOMContentLoaded', function() {
    const userInfo = document.getElementById('userInfo');
    const cuenta = JSON.parse(localStorage.getItem('cuenta'));
    if (!cuenta) {
        userInfo.innerHTML = '<div>No hay usuario autenticado.</div>';
        return;
    }
    let html = '';
    html += `<div><strong>Nombres:</strong> ${cuenta.nombres}</div>`;
    html += `<div><strong>Apellidos:</strong> ${cuenta.apellidos}</div>`;
    html += `<div><strong>DNI:</strong> ${cuenta.DNI}</div>`;
    if (cuenta.rango === 'estudiante') {
        html += `<div><strong>Código de estudiante:</strong> ${cuenta.codigo}</div>`;
    } else if (cuenta.rango === 'profesor') {
        html += `<div><strong>Código de profesor:</strong> ${cuenta.codigo}</div>`;
    } else if (cuenta.rango === 'administrador') {
        html += `<div><strong>Administrador</strong></div>`;
    }
    userInfo.innerHTML = html;
});
