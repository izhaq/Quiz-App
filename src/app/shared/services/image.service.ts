import { Injectable } from '@angular/core';

export interface ImageLoadResult {
  image: HTMLImageElement;
  width: number;
  height: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  /**
   * Creates query configuration for loading an image
   * @param id - Unique identifier for the image (for caching)
   * @param imageUrl - URL of the image to load
   * @returns Query configuration object
   */
  createImageQuery(id: string, imageUrl: string) {
    return {
      queryKey: ['image', id, imageUrl],
      queryFn: () => this.fetchImage(imageUrl),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    };
  }

  /**
   * Fetches image using native Image constructor
   * @param url - Image URL to load
   * @returns Promise with loaded image data
   */
  fetchImage(url: string): Promise<ImageLoadResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          image: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
          url: url
        });
      };
      
      img.onerror = (error) => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Enable CORS if needed
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }

  /**
   * Preloads multiple images
   * @param images - Array of {id, url} objects
   */
  preloadImages(images: Array<{id: string, url: string}>) {
    images.forEach(({ id, url }) => {
      this.fetchImage(url);
    });
  }
} 