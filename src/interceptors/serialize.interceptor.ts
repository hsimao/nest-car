import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): {};
}

// wrapper
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // 在接收到請求之前執行
    // Run something befor a request is handled

    return handler.handle().pipe(
      map((data: any) => {
        // 在回傳之前執行
        // Run something before the response is sent out

        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true, // 排除 dto 內沒有設定 @Expose 的參數
        });
      }),
    );
  }
}
