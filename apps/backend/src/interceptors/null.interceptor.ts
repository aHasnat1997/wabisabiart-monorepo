import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

/** Pass-through interceptor — used to override the global ResponseInterceptor on specific routes (e.g. SSE stream). */
@Injectable()
export class NullInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle();
  }
}
