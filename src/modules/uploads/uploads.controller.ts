import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('no file provided');

    console.log('file uploaded', { file });

    return { message: 'File Uploaded successfully' };
  }

  @Post('multiple-files')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultipleFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || !files.length)
      throw new BadRequestException('no files provided');

    console.log('file uploaded', { files });

    return { message: 'File Uploaded successfully' };
  }

  @Get(':image')
  getFile(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images' });
  }
}
