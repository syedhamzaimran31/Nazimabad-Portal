import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';

@Injectable()
export class FileUrlProvider {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates URLs for the uploaded files.
   * @param files - The array of uploaded files.
   * @param uploadPath - The path where files are uploaded (e.g., 'event-images').
   * @returns An array of URLs pointing to the uploaded files.
   */
  
  getImageUrls(files: Express.Multer.File[], uploadPath: string): string[] {
    const serverUrl = this.configService.get<string>('SERVER_URL');

    if (!serverUrl) {
      throw new Error('Server URL is not configured');
    }

    return files.map(
      (file) => `${serverUrl}/uploads/${uploadPath}/${file.filename}`,
    );
  }
}
