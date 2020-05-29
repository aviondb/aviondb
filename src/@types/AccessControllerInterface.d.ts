declare module "orbit-db-access-controllers/src/access-controller-interface" {
  import { LogEntry } from "ipfs-log";
  import OrbitDB from "orbit-db";
  import { EventEmitter } from "events";
  import { IdentityProvider } from "orbit-db-identity-provider";

  /**
   * Interface for OrbitDB Access Controllers
   *
   * Any OrbitDB access controller needs to define and implement
   * the methods defined by the interface here.
   */
  export default class AccessController extends EventEmitter.EventEmitter {
    /*
            Every AC needs to have a 'Factory' method
            that creates an instance of the AccessController
        */
    static create(orbitdb: OrbitDB, options: any): Promise<AccessController>;

    /* Return the type for this controller */
    static get type(): string;

    /*
            Return the type for this controller
            NOTE! This is the only property of the interface that
            shouldn't be overridden in the inherited Access Controller
        */
    get type(): string;

    /* Each Access Controller has some address to anchor to */
    get address(): string;

    /*
            Called by the databases (the log) to see if entry should
            be allowed in the database. Return true if the entry is allowed,
            false is not allowed
        */
    canAppend(
      entry: LogEntry<any>,
      identityProvider: IdentityProvider
    ): Promise<boolean>;

    /* Add and remove access */
    grant(access: string, identity: any): Promise<any>;
    revoke(access: string, identity: any): Promise<any>;

    /* AC creation and loading */
    load(address: string): Promise<any>;
    /* Returns AC manifest parameters object */
    save(): Promise<any>;
    /* Called when the database for this AC gets closed */
    close(): Promise<void>;
  }
}
