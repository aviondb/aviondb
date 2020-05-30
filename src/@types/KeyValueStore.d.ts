declare module "orbit-db-kvstore" {
  import Store from "orbit-db-store";

  export default class KeyValueStore<V> extends Store {
    get(key: string): V;

    put(key: string, value: V, options?: {}): Promise<void>;
    set(key: string, value: V, options?: {}): Promise<void>;

    del(key: string, options?: {}): Promise<void>;
  }
}
