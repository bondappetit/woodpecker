export interface Options {
  data: string;
}

export function echo(options: Options, next: Function) {
  return async (data: Promise<any>) => {
    return next(options.data);
  };
}
