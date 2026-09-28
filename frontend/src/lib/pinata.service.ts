import axios from 'axios';

export interface PinataUploadResult {
  ipfsHash: string;
  pinSize: number;
  timestamp: string;
  gatewayUrl: string;
  isSimulated?: boolean;
}

export interface PinataAuthResult {
  authenticated: boolean;
  message: string;
  status?: number;
}

// Admite tanto variables con prefijo VITE_ (estándar Vite) como sin prefijo
const rawJwt =
  import.meta.env.VITE_PINATA_JWT ||
  (import.meta.env as any).PINATA_JWT ||
  '';

const rawApiKey =
  import.meta.env.VITE_PINATA_API_KEY ||
  (import.meta.env as any).PINATA_API_KEY ||
  '';

const rawApiSecret =
  import.meta.env.VITE_PINATA_API_SECRET ||
  (import.meta.env as any).PINATA_API_SECRET ||
  '';

const rawGateway =
  import.meta.env.VITE_PINATA_GATEWAY ||
  (import.meta.env as any).PINATA_GATEWAY ||
  'https://gateway.pinata.cloud/ipfs/';

export const PINATA_JWT = rawJwt.trim();
export const PINATA_API_KEY = rawApiKey.trim();
export const PINATA_API_SECRET = rawApiSecret.trim();

/**
 * Normaliza la URL del gateway de Pinata para asegurar protocolo https:// y terminación /ipfs/
 */
export function getNormalizedGateway(): string {
  let g = rawGateway.trim();
  if (!g) {
    return 'https://gateway.pinata.cloud/ipfs/';
  }
  if (!g.startsWith('http://') && !g.startsWith('https://')) {
    g = `https://${g}`;
  }
  // Si no contiene la ruta /ipfs, agregarla
  if (!g.includes('/ipfs')) {
    g = g.endsWith('/') ? `${g}ipfs/` : `${g}/ipfs/`;
  } else if (!g.endsWith('/')) {
    g = `${g}/`;
  }
  return g;
}

/**
 * Verifica si las credenciales de Pinata están provistas en las variables de entorno.
 */
export function isPinataConfigured(): boolean {
  return Boolean(PINATA_JWT || (PINATA_API_KEY && PINATA_API_SECRET));
}

/**
 * Valida la autenticación contra los servidores de Pinata Cloud.
 */
export async function testPinataAuth(): Promise<PinataAuthResult> {
  if (!isPinataConfigured()) {
    return {
      authenticated: false,
      message: 'No se encontraron claves de Pinata en las variables de entorno (VITE_PINATA_JWT o VITE_PINATA_API_KEY).',
    };
  }

  try {
    const headers: Record<string, string> = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_API_SECRET;
    }

    const resp = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
      headers,
      timeout: 8000,
    });

    return {
      authenticated: true,
      message: resp.data.message || 'Conexión con Pinata IPFS verificada exitosamente.',
      status: resp.status,
    };
  } catch (err: any) {
    const msg =
      err.response?.data?.error?.details ||
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Error de autenticación';
    return {
      authenticated: false,
      message: `Error al conectar con Pinata: ${msg}`,
      status: err.response?.status,
    };
  }
}

/**
 * Sube un archivo anexo a la red IPFS a través de la API de Pinata.
 */
export async function uploadFileToPinata(file: File): Promise<PinataUploadResult> {
  const gateway = getNormalizedGateway();

  if (!isPinataConfigured()) {
    console.warn(
      '[Pinata IPFS] No se detectaron credenciales VITE_PINATA_JWT en .env. ' +
      'Generando CID de simulación estructurada.'
    );
    const mockHash = `bafkrei${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const gatewayUrl = `${gateway}${mockHash}`;
    return {
      ipfsHash: mockHash,
      pinSize: file.size,
      timestamp: new Date().toISOString(),
      gatewayUrl,
      isSimulated: true,
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      sistema: 'SGSEG',
      tipo: 'anexo_caso_estudio',
      fechaSubida: new Date().toISOString(),
    },
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };

  if (PINATA_JWT) {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`;
  } else {
    headers['pinata_api_key'] = PINATA_API_KEY;
    headers['pinata_secret_api_key'] = PINATA_API_SECRET;
  }

  const response = await axios.post<{
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
  }>('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers,
    timeout: 60000,
  });

  const { IpfsHash, PinSize, Timestamp } = response.data;
  const gatewayUrl = `${gateway}${IpfsHash}`;

  return {
    ipfsHash: IpfsHash,
    pinSize: PinSize,
    timestamp: Timestamp,
    gatewayUrl,
    isSimulated: false,
  };
}
