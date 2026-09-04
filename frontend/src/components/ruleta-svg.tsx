'use client';

import React from 'react';

export interface SectorRuleta {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
}

interface RuletaSvgProps {
  sectores: SectorRuleta[];
  anguloRotacion: number;
  girando: boolean;
  tamano?: number;
  faseLabel?: string;
}

const PALETA_COLORES_INSTITUCIONAL = [
  '#9E1B32', // UTEPSA Crimson
  '#0F172A', // Slate 900
  '#1E3A8A', // Deep Navy
  '#B91C1C', // Red 700
  '#334155', // Slate 700
  '#831843', // Rose 900
  '#1E293B', // Dark Slate
  '#B45309', // Amber 700
];

/**
 * Convierte coordenadas polares a cartesianas en el viewBox SVG.
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Genera el path SVG del sector circular (arco de pastel).
 */
function describirArco(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

/**
 * Componente visual de Ruleta interactiva con sectores etiquetados y puntero reglamentario.
 */
export const RuletaSvg: React.FC<RuletaSvgProps> = ({
  sectores,
  anguloRotacion,
  girando,
  tamano = 340,
  faseLabel,
}) => {
  const cx = 200;
  const cy = 200;
  const radio = 180;
  const numSectores = Math.max(sectores.length, 1);
  const anguloSector = 360 / numSectores;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Puntero Indicador Superior (12 en punto) con sombra */}
      <div className="absolute -top-3 z-30 flex flex-col items-center drop-shadow-md">
        <div className="size-4 rounded-full bg-crimson border-2 border-white shadow-sm" />
        <div className="size-0 -mt-1 border-x-8 border-t-14 border-x-transparent border-t-crimson" />
      </div>

      {/* Contenedor SVG de la Rueda giratoria */}
      <div
        className="relative flex items-center justify-center rounded-full p-2 bg-gradient-to-b from-neutral-200 to-neutral-400 shadow-xl border-4 border-neutral-300"
        style={{ width: tamano, height: tamano }}
      >
        <svg
          viewBox="0 0 400 400"
          className="size-full rounded-full transition-transform duration-[3200ms] cubic-bezier(0.12, 0.8, 0.2, 1)"
          style={{
            transform: `rotate(${anguloRotacion}deg)`,
            filter: girando ? 'blur(0.5px)' : 'none',
          }}
          role="img"
          aria-label={`Ruleta de sorteo: ${faseLabel || 'Opciones disponibles'}`}
        >
          {/* Anillo exterior decorativo */}
          <circle cx={cx} cy={cy} r={radio + 4} fill="none" stroke="#64748B" strokeWidth="3" />

          {/* Sectores de la Ruleta */}
          {sectores.map((sector, index) => {
            const startAngle = index * anguloSector;
            const endAngle = (index + 1) * anguloSector;
            const midAngle = startAngle + anguloSector / 2;
            const color =
              sector.color ||
              PALETA_COLORES_INSTITUCIONAL[index % PALETA_COLORES_INSTITUCIONAL.length];

            // Posición del texto dentro del sector (a 60% del radio)
            const textPos = polarToCartesian(cx, cy, radio * 0.62, midAngle);
            const textRotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;

            // Truncar label si es muy largo para que quepa en el sector
            const maxChars = numSectores > 5 ? 18 : 26;
            const labelTexto =
              sector.label.length > maxChars
                ? `${sector.label.slice(0, maxChars - 2)}...`
                : sector.label;

            return (
              <g key={sector.id || index}>
                {/* Cuña de color */}
                <path
                  d={describirArco(cx, cy, radio, startAngle, endAngle)}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-colors hover:brightness-110"
                />

                {/* Texto legible rotado hacia el centro */}
                <g transform={`translate(${textPos.x}, ${textPos.y}) rotate(${textRotation})`}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize={numSectores > 6 ? '9.5' : numSectores > 4 ? '11' : '13'}
                    fontWeight="700"
                    className="tracking-tight select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  >
                    {labelTexto}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Anillo de separación central */}
          <circle cx={cx} cy={cy} r="46" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="38" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

          {/* Centro institucional UTEPSA */}
          <circle cx={cx} cy={cy} r="28" fill="#9E1B32" />
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="800"
            className="tracking-wider uppercase pointer-events-none"
          >
            UTEPSA
          </text>
          <text
            x={cx}
            y={cy + 9}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FEE2E2"
            fontSize="7"
            fontWeight="600"
            className="pointer-events-none uppercase"
          >
            SGSEG
          </text>
        </svg>
      </div>

      {/* Insignia inferior indicadora de fase */}
      {faseLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-surface px-3 py-1 text-[11px] font-semibold text-neutral-700 shadow-2xs">
          <span className="size-2 rounded-full bg-crimson animate-pulse" />
          {faseLabel}
        </span>
      )}
    </div>
  );
};
