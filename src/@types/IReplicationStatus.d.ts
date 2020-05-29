export interface IReplicationStatus {
  buffered: number;
  queued: number;
  progress: number;
  max: number;
}
