export interface IredisService {
  set(key: string, value: string, expireSeconds: number): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}
