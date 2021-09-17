export class ControllableTimer {
  private callback: () => void;
  private running: boolean;
  private started: Date | undefined;
  private timerId: number | undefined;
  private remaining: number;

  private eventId: number | undefined;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.remaining = delay;
    this.running = false;
    this.timerId = undefined;

    this.eventId = undefined;
  }

  start() {
    this.running = true;
    this.started = new Date();
    this.timerId = setTimeout(() => {
      this.finish();
    }, this.remaining);
  }

  private finish() {
    this.running = false;
    this.callback();

    if (this.eventId !== undefined) {
      clearInterval(this.eventId);
    }
  }

  pause() {
    if (this.running) {
      this.running = false;
      clearTimeout(this.timerId);
      this.remaining -= Date.now() - this.started!.getTime();
    } else {
      console.warn('A timer that has not been started has been stopped.');
    }
  }

  register(event: () => void, interval: number) {
    setInterval(event, interval);
  }

  remainingTime() {
    return this.remaining - (Date.now() - this.started!.getTime());
  }

  state() {
    return this.running;
  }
}
