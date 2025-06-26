// Script para mostrar la información del curso y asistencias según el usuario
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', async function() {
    const cuenta = JSON.parse(localStorage.getItem('cuenta'));
    const cursoId = getQueryParam('id');
    const cursoInfoDiv = document.getElementById('cursoInfo');
    const asistenciasDiv = document.getElementById('asistencias');
    if (!cuenta || !cursoId) {
        cursoInfoDiv.innerHTML = '<div>No hay información para mostrar.</div>';
        return;
    }
    try {
        const response = await fetch('data/cursos.json');
        const cursos = await response.json();
        const curso = cursos.find(c => c.id === cursoId);
        if (!curso) {
            cursoInfoDiv.innerHTML = '<div>Curso no encontrado.</div>';
            return;
        }
        cursoInfoDiv.innerHTML = `<h2>${curso.nombre}</h2>`;
        if (cuenta.rango === 'estudiante') {
            const estudiante = curso.estudiantes.find(e => e.usuario === cuenta.usuario);
            if (estudiante) {
                cursoInfoDiv.innerHTML += `<p><strong>Semestre 1:</strong> ${estudiante.calificaciones.semestre1}</p>`;
                cursoInfoDiv.innerHTML += `<p><strong>Semestre 2:</strong> ${estudiante.calificaciones.semestre2}</p>`;
                // Asistencias
                asistenciasDiv.innerHTML = '<h3>Asistencias</h3>' + renderAsistencias(estudiante.asistencias);
            }
        } else if (cuenta.rango === 'profesor' || cuenta.rango === 'administrador') {
            cursoInfoDiv.innerHTML += '<h3>Estudiantes</h3>';
            curso.estudiantes.forEach(est => {
                cursoInfoDiv.innerHTML += `<div style='margin-bottom:1rem;'><strong>${est.usuario}</strong><br>Semestre 1: ${est.calificaciones.semestre1} | Semestre 2: ${est.calificaciones.semestre2}</div>`;
                asistenciasDiv.innerHTML += `<h4>Asistencias de ${est.usuario}</h4>` + renderAsistencias(est.asistencias);
            });
        }
    } catch (err) {
        cursoInfoDiv.innerHTML = '<div>Error al cargar el curso.</div>';
    }
});

function renderAsistencias(asistencias) {
    if (!asistencias || asistencias.length === 0) return '<div>No hay asistencias.</div>';
    return `<div class='asistencia-calendario'>` +
        asistencias.map(a => `<div class='asistencia-dia ${a.estado}'>${a.fecha.split('-')[2]}</div>`).join('') +
        '</div>';
}
