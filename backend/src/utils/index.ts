import { extname } from 'path';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

export function generateFileName(originalName: string): string {
  const ext = extname(originalName);
  return `${Date.now()}${ext}`;
}

export function generateFilePath(
  serverUrl: string,
  folder: string,
  fileName: string,
): string {
  return `${serverUrl}/uploads/${folder}/${fileName}`;
}

export function safeParse(data: any): any {
  try {
    return JSON.parse(data); // Parse if it's a stringified JSON
  } catch (error) {
    return data; // Return the data as-is if it's already a valid array or object
  }
}

// Utility function to extract latitude and longitude from a Google Maps URL
export function extractLatLongFromLink(
  link: string,
): { latitude: number; longitude: number } | null {
  // Regular expression focusing on '@' symbol as the common identifier for lat/long
  if (link) {
    const regex = /@([\d.-]+),([\d.-]+)/;
    const match = link.match(regex);

    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      return { latitude, longitude };
    }
    return null; // Return null if no coordinates found
  }
}

export function extractUserIdFromToken(
  jwtService: JwtService,
  client: any,
): number {
  // const token = client.handshake.headers.authorization?.split(' ')[1];
  const token =
    client.handshake?.auth?.token?.split(' ')[1] ||
    client.handshake?.headers?.authorization?.split(' ')[1];
  if (!token) {
    console.log('Token missing, connection rejected');
    return null; // Do not throw an error to avoid crashing
  }

  try {
    const decoded = jwtService.verify(token);
    return decoded.userId;
  } catch (error) {
    // If token verification fails, log the error and return null
    console.log('Invalid or expired token');
    return null; // Do not throw an error to avoid crashing  }
  }
}
