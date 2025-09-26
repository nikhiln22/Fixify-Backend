export interface IRedisService {
  set(key: string, value: string, expireSeconds: number): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  setObject(key: string, value: object, expireSeconds: number): Promise<void>;
  getObject<T>(key: string): Promise<T | null>;
}
