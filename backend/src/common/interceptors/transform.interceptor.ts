import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TransformResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<unknown>> {
    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        data,
      })),
    );
  }
}
