import * as jp from "jsonpath";

export type Element = "all" | "first" | "last";

export interface Options {
  path: string;
  element?: Element;
}

export function field({ path, element = "all" }: Options, next: Function) {
  return async (data: Promise<any>) => {
    let result = jp.query(await data, path);
    if (element === "first") result = result[0];
    if (element === "last") result = result[result.length - 1];

    next(result);
  };
}
