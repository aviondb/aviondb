declare module "orbit-db-cache" {
  import KeyValueStore from "orbit-db-kvstore";

  export default class Cache<V> {
    readonly _store: KeyValueStore<V>;

    constructor(store: KeyValueStore<V>);

    status(): any;

    close(): Promise<void>;
    open(): Promise<void>;

    get(key: string): Promise<V>;

    set(key: string, value: V): Promise<void>;
    put(key: string, value: V): Promise<void>;
    del(key: string): Promise<void>;

    load(): void;
    destroy(): void;
  }
}
