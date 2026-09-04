import { HttpException, HttpStatus } from '@nestjs/common';

export class PrismaClientException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Error de base de datos: ${message}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
