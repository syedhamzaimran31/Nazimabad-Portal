import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';

export function FileUploadInterceptor(
  fieldName: string,
  maxCount: number,
  destination: string,
) {
  const configService = new ConfigService();

  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
        storage: diskStorage({
          destination: `./uploads/${destination}`,
          filename: (req, file, cb) => {
            const ext = extname(file.originalname);
            const fileName = Date.now() + '_' + file.originalname;

            // Create the full URL path
            cb(null, fileName); // Keep the filename simple for storage
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(
              new BadRequestException('Only image files are allowed!'),
              false,
            );
          }
          cb(null, true);
        },
      }),
    ),
  );
}

// import {
//   applyDecorators,
//   BadRequestException,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { ConfigService } from '@nestjs/config';

// export function FileUploadInterceptor(
//   fieldName: string,
//   maxCount: number,
//   destination: string,
// ) {
//   console.log('FileUploadInterceptor applied'); // Add this log

//   return applyDecorators(
//     UseInterceptors(
//       FilesInterceptor(fieldName, maxCount, {
//         storage: diskStorage({
//           destination: `./uploads/${destination}`,
//           filename: (req, file, cb) => {
//             const ext = extname(file.originalname);
//             const fileName = `${Date.now()}${ext}`;

//             const configService = new ConfigService();

//             const serverUrl = configService.get<string>('SERVER_URL');

//             if (!serverUrl) {
//               return cb(
//                 new BadRequestException('Server URL is not configured'),
//                 null,
//               );
//             }

//             // Create the full URL path
//             const fileUrl = `${serverUrl}/uploads/${destination}/${fileName}`;
//             cb(null, fileUrl);
//           },
//         }),
//         fileFilter: (req, file, cb) => {
//           if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//             return cb(
//               new BadRequestException('Only image files are allowed!'),
//               false,
//             );
//           }
//           cb(null, true);
//         },
//       }),
//     ),
//   );
// }
