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
  _id: string;
}

export interface QueryOptionsInterface {
  limit?: number;
  skip?: number;
  sort?: object;
}

export interface FindOneAndUpdateInterface {
  projection?: object;
  sort?: object;
  maxTimeMS?: number;
  upsert?: boolean;
  returnNewDocument?: boolean;
  collation?: object;
  arrayFilters?: Array<object>;
}

export interface FindOneAndDeleteInterface {
  projection?: object;
  sort?: object;
  maxTimeMS?: number;
  collation?: object;
}

export interface UpdateInterface {
  upsert?: boolean;
  multi?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface UpdateOneInterface {
  upsert?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface UpdateManyInterface {
  upsert?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface DeleteOneInterface {
  writeConcern?: object;
  collation?: object;
}

export interface DeleteManyInterface {
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
