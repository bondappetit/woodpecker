import * as handlers from "./index";

export interface Handler {
  (data: Promise<any>): any;
}

export interface HandlerFactory {
  (options: any, next: Function): Handler;
}

export interface HandlerConfig {
  name: string;
  options: any;
}

export function createQueue(handlersConfig: HandlerConfig[]): Handler {
  return handlersConfig.reverse().reduce(
    (next, { name, options }) => {
      const handler = handlers[name];
      if (!handler) throw new Error(`Handler "${name}" not found`);

      return handler(options, next);
    },
    (data: any) => {}
  );
}
