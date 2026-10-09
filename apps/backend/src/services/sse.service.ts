import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SseEvent {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SseService {
  private streams = new Map<string, Subject<SseEvent>>();

  getOrCreate(userId: string): Subject<SseEvent> {
    if (!this.streams.has(userId)) {
      this.streams.set(userId, new Subject<SseEvent>());
    }
    return this.streams.get(userId)!;
  }

  push(userId: string, event: SseEvent) {
    this.streams.get(userId)?.next(event);
  }

  remove(userId: string) {
    this.streams.get(userId)?.complete();
    this.streams.delete(userId);
  }
}
