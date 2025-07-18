// Script para mostrar las tarjetas de cursos y navegar a la página de detalles (curso.html)

document.addEventListener('DOMContentLoaded', async function() {
    const cuenta = JSON.parse(localStorage.getItem('cuenta'));
    const cursosContainer = document.getElementById('cursosContainer');
    if (!cuenta) {
        cursosContainer.innerHTML = '<div>No hay usuario autenticado.</div>';
        return;
    }
    try {
        const response = await fetch('data/cursos.json');
        const cursos = await response.json();
        let cursosAMostrar = [];
        if (cuenta.rango === 'estudiante') {
            cursosAMostrar = cursos.filter(curso => curso.estudiantes.some(e => e.usuario === cuenta.usuario));
        } else if (cuenta.rango === 'profesor') {
            cursosAMostrar = cursos.filter(curso => curso.profesor === cuenta.usuario);
        } else if (cuenta.rango === 'administrador') {
            cursosAMostrar = cursos;
        }
        if (cursosAMostrar.length === 0) {
            cursosContainer.innerHTML = '<div>No hay cursos para mostrar.</div>';
            return;
        }
        cursosContainer.innerHTML = cursosAMostrar.map(curso => {
            // Redirigir a detalle-curso.html si es estudiante, a curso.html si es profesor/admin
            const destino = cuenta.rango === 'estudiante' ? 'detalle-curso.html' : 'curso.html';
            return `
                <div class="curso-card" onclick="window.location.href='${destino}?id=${curso.id}'">
                    <h2>${curso.nombre}</h2>
                    <p>ID: ${curso.id}</p>
                </div>
            `;
        }).join('');
    } catch (err) {
        cursosContainer.innerHTML = '<div>Error al cargar cursos.</div>';
    }
});
