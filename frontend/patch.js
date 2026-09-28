const fs = require('fs');
const file = 'd:/ProyectoUni/SGSEG/frontend/src/pages/Sorteo.tsx';
let content = fs.readFileSync(file, 'utf8');
const search = `                              onClick={() => {
                                setPostulanteSeleccionado(postulante)
                                setAreaGanadora(null)
                                setCasoGanador(null)
                                setSorteoSuspendido(false)
                                setAsistenciaPresente(true)
                              }}`;
const replace = `                              onClick={() => {
                                setPostulanteSeleccionado(postulante)
                                setPasoActual(1)
                                setAreaGanadora(null)
                                setCasoGanador(null)
                                setRuletaGiroActivo(false)
                                setTiempoTerminado(false)
                                setSorteoSuspendido(false)
                                setAsistenciaPresente(true)
                                setGuardandoEnDb(false)
                                setGuardadoEnDbExitoso(false)
                                setCodigoActa('')
                                setHashActa('')
                                setCorreoDespachadoExitoso(false)
                              }}`;
content = content.replace(search.replace(/\r/g, ''), replace);
fs.writeFileSync(file, content);
console.log('Done');
