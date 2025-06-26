// Script para mostrar la información del curso y calificaciones por semestre
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', async function() {
    const cuenta = JSON.parse(localStorage.getItem('cuenta'));
    const cursoId = getQueryParam('id');
    const tablaNotasDiv = document.getElementById('tablaNotasContainer');
    if (!cuenta || !cursoId) {
        tablaNotasDiv.innerHTML = '<div>No hay información para mostrar.</div>';
        return;
    }
    try {
        const response = await fetch('data/cursos.json');
        const cursos = await response.json();
        const curso = cursos.find(c => c.id === cursoId);
        if (!curso) {
            tablaNotasDiv.innerHTML = '<div>Curso no encontrado.</div>';
            document.getElementById('asistenciaCalendarioContainer').innerHTML = '';
            return;
        }
        // Mostrar asistencias
        function renderCalendario(estudiante, editable) {
            const hoy = new Date();
            const year = hoy.getFullYear();
            const month = hoy.getMonth();
            const diasMes = new Date(year, month + 1, 0).getDate();
            let dias = [];
            for (let d = 1; d <= diasMes; d++) {
                const fecha = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const asistencia = estudiante.asistencias?.find(a => a.fecha === fecha);
                dias.push({
                    fecha,
                    estado: asistencia ? asistencia.estado : null
                });
            }
            let html = `<div class='asistencia-calendario'>`;
            dias.forEach((dia, idx) => {
                let clase = 'asistencia-dia';
                if (dia.estado === 'asistio') clase += ' asistio';
                else if (dia.estado === 'tarde') clase += ' tarde';
                else if (dia.estado === 'falto') clase += ' falto';
                html += `<div class='${clase}' data-idx='${idx}' data-fecha='${dia.fecha}'>${idx+1}</div>`;
            });
            html += `</div>`;
            if (editable) {
                html += `<div class='asistencia-controles'>
                    <button class='btn-asistencia' data-estado='asistio'>Asistió</button>
                    <button class='btn-asistencia' data-estado='tarde'>Tarde</button>
                    <button class='btn-asistencia' data-estado='falto'>Faltó</button>
                </div>`;
            }
            return html;
        }
        // Estudiante: solo ve su propio calendario
        if (cuenta.rango === 'estudiante') {
            const estudiante = curso.estudiantes.find(e => e.usuario === cuenta.usuario);
            if (estudiante) {
                tablaNotasDiv.innerHTML = `<p><strong>Semestre 1:</strong> ${estudiante.calificaciones.semestre1}</p>`;
                tablaNotasDiv.innerHTML += `<p><strong>Semestre 2:</strong> ${estudiante.calificaciones.semestre2}</p>`;
                document.getElementById('asistenciaCalendarioContainer').innerHTML = renderCalendario(estudiante, false);
            } else {
                tablaNotasDiv.innerHTML = '';
                document.getElementById('asistenciaCalendarioContainer').innerHTML = '';
            }
        } else if (cuenta.rango === 'profesor' || cuenta.rango === 'administrador') {
            // Cargar usuarios antes de renderizar
            const usuariosResp = await fetch('data/usuarios.json');
            const usuarios = await usuariosResp.json();
            // Agregar título arriba de la tabla de calificaciones
            let tituloNotas = `<div class='titulo-notas'>Calificación del semestre</div>`;
            let tabla = tituloNotas + `<form id='formNotas'><table class='tabla-notas'>`;
            tabla += `<thead><tr><th>Nombre</th><th>Apellidos</th><th>Semestre 1</th><th>Semestre 2</th></tr></thead><tbody>`;
            curso.estudiantes.forEach((est, idx) => {
                const user = usuarios.find(u => u.usuario === est.usuario);
                tabla += `<tr>
                    <td>${user ? user.nombres : est.usuario}</td>
                    <td>${user ? user.apellidos : ''}</td>
                    <td><input type='number' name='sem1_${idx}' value='${est.calificaciones.semestre1}' min='0' max='20' required></td>
                    <td><input type='number' name='sem2_${idx}' value='${est.calificaciones.semestre2}' min='0' max='20' required></td>
                </tr>`;
            });
            tabla += `</tbody></table><button type='submit' class='btn-guardar'>Guardar cambios</button></form>`;
            tablaNotasDiv.innerHTML = tabla;
            // Mostrar calendario de asistencias para el primer estudiante (puedes mejorar para seleccionar estudiante)
            let estudianteSeleccionado = 0;
            function renderAsistenciaProfesor() {
                const est = curso.estudiantes[estudianteSeleccionado];
                const user = usuarios.find(u => u.usuario === est.usuario);
                let nombre = user ? user.nombres + ' ' + user.apellidos : est.usuario;
                // Unir el selector y el título de asistencias en una sola línea
                let selectorYTitulo = `<div class='asistencias-header'>
                    <div class='select-estudiante-container' style='margin-bottom:0;'>
                        <label for='selectEst'>Seleccionar estudiante: </label>
                        <select id='selectEst'>
                            ${curso.estudiantes.map((e,i)=>{
                                const u = usuarios.find(u=>u.usuario===e.usuario);
                                return `<option value='${i}' ${i===estudianteSeleccionado?'selected':''}>${u?u.nombres+' '+u.apellidos:e.usuario}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class='asistencias-titulo' style='margin:0 0 0 1.5rem;'><strong>Asistencias de: ${nombre}</strong></div>
                </div>`;
                let html = selectorYTitulo;
                html += renderCalendario(est, true);
                document.getElementById('asistenciaCalendarioContainer').innerHTML = html;
            }
            renderAsistenciaProfesor();
            document.getElementById('selectEst').addEventListener('change',function(){
                estudianteSeleccionado = parseInt(this.value);
                renderAsistenciaProfesor();
            });
            // Manejo de clicks en calendario y botones
            let diaSeleccionado = null;
            document.getElementById('asistenciaCalendarioContainer').addEventListener('click',function(e){
                if(e.target.classList.contains('asistencia-dia')){
                    // Seleccionar día
                    this.querySelectorAll('.asistencia-dia').forEach(d=>d.classList.remove('selected'));
                    e.target.classList.add('selected');
                    diaSeleccionado = e.target.getAttribute('data-fecha');
                }
                if(e.target.classList.contains('btn-asistencia') && diaSeleccionado){
                    const estado = e.target.getAttribute('data-estado');
                    const est = curso.estudiantes[estudianteSeleccionado];
                    let asis = est.asistencias.find(a=>a.fecha===diaSeleccionado);
                    if(asis){
                        asis.estado = estado;
                    }else{
                        est.asistencias.push({fecha:diaSeleccionado,estado});
                    }
                    renderAsistenciaProfesor();
                    diaSeleccionado = null;
                }
            });
            document.getElementById('formNotas').addEventListener('submit', function(e) {
                e.preventDefault();
                // Actualizar las notas en el objeto curso
                curso.estudiantes.forEach((est, idx) => {
                    est.calificaciones.semestre1 = parseInt(this[`sem1_${idx}`].value);
                    est.calificaciones.semestre2 = parseInt(this[`sem2_${idx}`].value);
                });
                // Guardar en localStorage (simulación)
                localStorage.setItem('cursos_editados', JSON.stringify(curso));
                alert('Notas actualizadas (solo en memoria/localStorage).');
            });
        }
    } catch (err) {
        tablaNotasDiv.innerHTML = '<div>Error al cargar el curso.</div>';
    }
});
