// File storage service (can be extended with S3, Cloudinary, etc.)
export interface UploadOptions {
  file: File;
  folder?: string;
  maxSize?: number; // in bytes
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB default

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { file, folder = 'uploads', maxSize = MAX_FILE_SIZE } = options;

  // Validate file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }

  try {
    // TODO: Implement actual file upload to cloud storage
    // For now, return mock data
    const filename = `${Date.now()}-${file.name}`;
    const url = `/uploads/${folder}/${filename}`;

    return {
      url,
      filename,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

export async function deleteFile(url: string): Promise<boolean> {
  try {
    // TODO: Implement actual file deletion from cloud storage
    console.log('Deleting file:', url);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
}

export function isPDFFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
