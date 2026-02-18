import { StorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';

export function getStorageProvider(): StorageProvider {
    return new LocalStorageProvider();
}
