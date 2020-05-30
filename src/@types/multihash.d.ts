export as namespace Multihash;
export = Multihash;

type Buffer = any;

interface Multihash {
  toHexString: (hash: Buffer) => string;
  fromHexString: (hash: string) => Buffer;
  toB58String: (hash: Buffer) => string;
  fromB58String: (hash: string) => Buffer;
  decode: (
    buf: Buffer
  ) => {
    code: number;
    name: string;
    length: number;
    digest: Buffer;
  };
  encode: (digest: Buffer, code: string | number, length?: number) => Buffer;
  coerceCode: (name: string | number) => number;
  isAppCode: (code: number) => boolean;
  isValidCode: (code: number) => boolean;
  prefix: (multihash: Buffer) => void;
}
