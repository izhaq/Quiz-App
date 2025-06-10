import { Component, input, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ImageService } from '../../../core/services/image.service';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  templateUrl: './image.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent {
  private imageService = inject(ImageService);
  
  // Inputs
  imageUrl = input<string>();
  imageId = input<string>();
  alt = input<string>('Image');
  width = input<number>();
  height = input<number>();
  
  // TanStack Query - called in injection context
  imageQuery = injectQuery(() => {
    const id = this.imageId();
    const url = this.imageUrl();
    
    // If no id or url, return a disabled query
    if (!id || !url) {
      return {
        queryKey: ['image', 'disabled'],
        queryFn: () => Promise.resolve(null),
        enabled: false,
      };
    }
    
    // Return actual query configuration
    return {
      ...this.imageService.createImageQuery(id, url),
      enabled: true,
    };
  });
  
  // Computed states from query
  isLoading = computed(() => {
    const id = this.imageId();
    const url = this.imageUrl();
    
    if (!id || !url) return false;
    
    return this.imageQuery.isPending();
  });
  
  hasError = computed(() => {
    const id = this.imageId();
    const url = this.imageUrl();
    
    if (!id || !url) return false;
    
    return this.imageQuery.isError();
  });
  
  imageData = computed(() => {
    const id = this.imageId();
    const url = this.imageUrl();
    
    if (!id || !url) return null;
    
    return this.imageQuery.data();
  });
  
  errorMessage = computed(() => {
    const error = this.imageQuery.error();
    return error?.message ?? 'Failed to load image';
  });
} 