import { resolve } from "path";
import { readFile } from "fs-extra";
import { HandlerConfig, createQueue } from "./handlers/handler";

interface SourceConfig {
  name: string;
  interval: number;
  handlers: Array<HandlerConfig | string>;
}

function createSource({ name, handlers, interval }: SourceConfig) {
  if (interval < 1000) throw new Error(`Invalid source interval "${interval}"`);

  const queue = createQueue(
    handlers.map((handlerConfig) =>
      typeof handlerConfig === "string"
        ? { name: handlerConfig, options: undefined }
        : handlerConfig
    )
  );

  return {
    name,
    queue,
    run() {
      console.log(`Run ${name}`);

      return queue(null);
    },
    start() {
      setTimeout(async () => {
        await this.run();
        this.start();
      }, interval);
    },
  };
}

(async () => {
  const config = JSON.parse(
    await readFile(resolve(__dirname, "../config.json"), "utf8")
  ) as SourceConfig[];

  const sources = config.map(createSource);
  return Promise.all(sources.map((source) => source.start()));
})();
