export interface Payload {
  op: string;
  value: DocumentInterface[] | (string | number | object)[];
  modification?: object;
  options?:
    | object
    | UpdateOptionsInterface
    | UpdateOneOptionsInterface
    | UpdateManyOptionsInterface;
}

export interface OrbitDBOptions {
  directory?: string;
  peerId?: string;
  keystore?: any;
  cache?: any;
  identity?: any;
  offline?: boolean;
  meta?: any;
  overwrite?: boolean;
}

export interface StoreOptions {
  path?: string;
}

export interface CollectionOptions {
  create?: boolean | false;
  overwrite?: boolean;
}

export interface DatabaseConfigOptions {
  path?: string;
}

export interface InsertOptions {
  ordered?: boolean;
  writeConcern?: object;
}

export interface InsertOneOptions {
  writeConcern?: object;
}

export interface DocumentInterface {
  _id: object | string | number;
}

export interface FindOptionsInterface {
  limit?: number;
  skip?: number;
  sort?: object;
}

export interface FindOneAndUpdateOptionsInterface {
  projection?: object;
  sort?: object;
  maxTimeMS?: number;
  upsert?: boolean;
  returnNewDocument?: boolean;
  collation?: object;
  arrayFilters?: Array<object>;
}

export interface FindOneAndDeleteOptionsInterface {
  projection?: object;
  sort?: object;
  maxTimeMS?: number;
  collation?: object;
}

export interface UpdateOptionsInterface {
  upsert?: boolean;
  multi?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface UpdateOneOptionsInterface {
  upsert?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface UpdateManyOptionsInterface {
  upsert?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface DeleteOneOptionsInterface {
  writeConcern?: object;
  collation?: object;
}

export interface DeleteManyOptionsInterface {
  writeConcern?: object;
  collation?: object;
}

export interface ImportOptionsInterface {
  overwrite?: boolean;
  type?: string;
  batchSize?: number;
}

export interface ImportStreamOptionsInterface {
  overwrite?: boolean;
  type?: string;
  batchSize: number;
}

export interface ExportOptionsInterface {
  type?: string;
  limit?: number;
  query?: object;
}
