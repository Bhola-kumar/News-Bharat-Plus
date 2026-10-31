/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const MAX_SOURCE_FILE_SIZE = 20 * 1024 * 1024;
const MAX_COMPRESSED_FILE_SIZE = 5 * 1024 * 1024;

export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.80
): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WEBP image.');
  }
  if (file.size > MAX_SOURCE_FILE_SIZE) {
    throw new Error('Image is too large. Choose a file smaller than 20 MB.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('The browser could not prepare this image.');
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        result => result ? resolve(result) : reject(new Error('The browser could not compress this image.')),
        'image/jpeg',
        quality
      );
    });
    if (blob.size > MAX_COMPRESSED_FILE_SIZE) {
      throw new Error('Compressed image is too large for storage. Choose a smaller image.');
    }
    return blob;
  } catch (error) {
    if (error instanceof Error && error.name === 'EncodingError') {
      throw new Error('The selected image could not be decoded. Try another image.');
    }
    throw error;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
