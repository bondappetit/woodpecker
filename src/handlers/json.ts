export interface Options {}

export function json(options: Options, next: Function) {
  return async (data: Promise<any>) => {
    const json = await data;
    if (typeof json !== "string") return next(data);

    return next(JSON.parse(json));
  };
}
