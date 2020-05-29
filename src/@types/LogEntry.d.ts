declare module "ipfs-log" {
  interface IdentityJson {
    id: string;
    publicKey: string;
    signatures: { id: string; publicKey: string };
    type: string;
  }
  interface LamportClockJson {
    id: "string";
    time: number;
  }
  export interface LogEntry<T> {
    hash: string;
    id: string;
    payload: { op?: string; key?: string; value: T };
    next: string[]; // Hashes of parents
    v: number; // Format, can be 0 or 1
    clock: LamportClockJson;
    key: string;
    identity: IdentityJson;
    sig: string;
  }
}
