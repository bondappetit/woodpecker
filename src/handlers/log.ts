export interface Options {}

export function log(options: Options, next: Function) {
  return async (data: Promise<any>) => {
    console.log(await data);

    return next(data);
  };
}
