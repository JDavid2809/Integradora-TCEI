import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Función para subir archivo desde el servidor
export async function uploadToCloudinary(
  file: Buffer | string,
  options?: {
    folder?: string;
    resourceType?: 'image' | 'raw' | 'auto';
    publicId?: string;
  }
) {
  const uploadOptions = {
    folder: options?.folder || 'tareas',
    resource_type: options?.resourceType || 'auto' as const,
    public_id: options?.publicId,
  };

  return new Promise<{ url: string; publicId: string; format: string; bytes: number }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else {
      // Si es una URL o base64
      cloudinary.uploader.upload(file, uploadOptions)
        .then((result: UploadApiResponse) => {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        })
        .catch(reject);
    }
  });
}

// Función para eliminar archivo
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'raw' = 'raw') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

// Configuración del cliente (para subidas directas desde el navegador)
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

// Tipos para los archivos subidos
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  originalName: string;
}

// Validar tipo de archivo
export function isValidFileType(mimeType: string): boolean {
  const allowedTypes = [
    // Imágenes
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documentos
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  return allowedTypes.includes(mimeType);
}

// Obtener tipo de recurso para Cloudinary
export function getResourceType(mimeType: string): 'image' | 'raw' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  return 'raw'; // PDFs, docs, etc.
}
