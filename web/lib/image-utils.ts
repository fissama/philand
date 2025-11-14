/**
 * Compress and resize image to base64
 * @param file - Image file to compress
 * @param maxSize - Maximum dimension (width/height) in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise<string> - Base64 encoded image
 */
export async function compressImage(
  file: File,
  maxSize: number = 200,
  quality: number = 0.75 // Reduced from 0.8 for better compression
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { 
          alpha: false, // Disable alpha for better performance
          willReadFrequently: false 
        });
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Calculate new dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        // Set canvas size to exact dimensions needed
        canvas.width = maxSize;
        canvas.height = maxSize;
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, maxSize, maxSize);
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Center the image
        const x = (maxSize - width) / 2;
        const y = (maxSize - height) / 2;
        
        // Draw image
        ctx.drawImage(img, x, y, width, height);
        
        // Try WebP first (best compression), fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          // Check if WebP is supported and size is reasonable
          if (webpData.indexOf('data:image/webp') === 0) {
            // Check if compressed size is acceptable (< 100KB)
            if (webpData.length < 100000) {
              resolve(webpData);
              return;
            }
            // If too large, try with lower quality
            const webpLowQuality = canvas.toDataURL('image/webp', quality * 0.7);
            if (webpLowQuality.length < 100000) {
              resolve(webpLowQuality);
              return;
            }
          }
          // Fallback to JPEG with aggressive compression
          const jpegData = canvas.toDataURL('image/jpeg', quality * 0.8);
          resolve(jpegData);
        } catch (error) {
          // Final fallback to JPEG
          resolve(canvas.toDataURL('image/jpeg', quality * 0.8));
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): string | null {
  // Check if file exists
  if (!file) {
    return 'No file selected';
  }
  
  // Check file type (strict validation)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
  }
  
  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Image size must be less than ${maxSizeMB}MB`;
  }
  
  // Check minimum size (avoid tiny/corrupted files)
  if (file.size < 100) {
    return 'Image file is too small or corrupted';
  }
  
  // Check file name (basic sanitization)
  if (file.name.length > 255) {
    return 'File name is too long';
  }
  
  return null;
}

/**
 * Sanitize user input text
 * @param input - Text to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized text
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Get initials from name
 * @param name - User name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name?: string): string {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
