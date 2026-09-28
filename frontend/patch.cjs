const fs = require('fs');
const file = 'd:/ProyectoUni/SGSEG/frontend/src/pages/Sorteo.tsx';
let content = fs.readFileSync(file, 'utf8');

// Also handle CRLF / LF conversion correctly.
// The file might use CRLF, we want to replace correctly.
// A more robust replacement:
const searchLines = [
  "onClick={() => {",
  "setPostulanteSeleccionado(postulante)",
  "setAreaGanadora(null)",
  "setCasoGanador(null)",
  "setSorteoSuspendido(false)",
  "setAsistenciaPresente(true)",
  "}}"
];

const replacementLines = [
  "onClick={() => {",
  "                                setPostulanteSeleccionado(postulante)",
  "                                setPasoActual(1)",
  "                                setAreaGanadora(null)",
  "                                setCasoGanador(null)",
  "                                setRuletaGiroActivo(false)",
  "                                setTiempoTerminado(false)",
  "                                setSorteoSuspendido(false)",
  "                                setAsistenciaPresente(true)",
  "                                setGuardandoEnDb(false)",
  "                                setGuardadoEnDbExitoso(false)",
  "                                setCodigoActa('')",
  "                                setHashActa('')",
  "                                setCorreoDespachadoExitoso(false)",
  "                              }}"
];

// Let's just find the index of the first line
let lines = content.split(/\r?\n/);
let foundIdx = -1;

for (let i = 0; i < lines.length - 6; i++) {
  if (lines[i].includes(searchLines[0]) &&
      lines[i+1].includes(searchLines[1]) &&
      lines[i+2].includes(searchLines[2]) &&
      lines[i+3].includes(searchLines[3]) &&
      lines[i+4].includes(searchLines[4]) &&
      lines[i+5].includes(searchLines[5]) &&
      lines[i+6].includes(searchLines[6])) {
    foundIdx = i;
    break;
  }
}

if (foundIdx !== -1) {
  const ws = lines[foundIdx].match(/^\s*/)[0];
  const newLines = replacementLines.map((l, idx) => idx === 0 ? ws + l : l);
  lines.splice(foundIdx, 7, ...newLines);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Successfully replaced!');
} else {
  console.log('Not found');
}
