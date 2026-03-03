import { StorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./local.storage";
import { ImageKitProvider } from "./imagekit.provider";

export function getStorageProvider() {
  return new ImageKitProvider();
}
