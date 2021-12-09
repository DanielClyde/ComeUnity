import { Injectable } from '@angular/core';
import { Camera, CameraResultType, ImageOptions, Photo } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private defaultOpts: ImageOptions = {
    quality: 50,
    allowEditing: true,
    resultType: CameraResultType.DataUrl,
    promptLabelHeader: 'Event Photo',
    width: 400,
    height: 200,
  }

  constructor() { }

  async getPhoto(opts: Partial<ImageOptions>): Promise<Photo> {
    return Camera.getPhoto({
      ...this.defaultOpts,
      ...opts,
    });
  }
}
