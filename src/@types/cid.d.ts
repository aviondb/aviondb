export as namespace CID;
export = CID;

type Buffer = any;

interface SerializedCID {
  codec: string;
  version: number;
  multihash: Buffer;
}

declare class CID {
  constructor(version: number, codec: string, multihash: Buffer);
  static isCID(other: any): boolean;
  static validateCID(other: any): void;
  codec: string;
  version: number;
  multihash: Buffer;
  buffer: Buffer;
  prefix: Buffer;
  toV0(): CID;
  toV1(): CID;
  toBaseEncodedString(base?: string): string;
  toJSON(): SerializedCID;
  equals(other: CID): boolean;
}
