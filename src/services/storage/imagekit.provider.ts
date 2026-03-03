import ImageKit from "imagekit";
import { v4 as uuid } from "uuid";
import {
  StorageProvider,
  UploadInput,
  UploadOptions,
  UploadResult,
} from "./storage.interface";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export class ImageKitProvider implements StorageProvider {
  name: "imagekit" = "imagekit";

  async upload(
    input: UploadInput,
    options: UploadOptions,
    baseUrl: string,
  ): Promise<UploadResult> {
    const fileName = `${uuid()}.${options.ext ?? "bin"}`;

    const result = await imagekit.upload({
      file: input.buffer,
      fileName,
      folder: options.folder ?? "uploads",
      useUniqueFileName: false,
    });

    return {
      provider: "imagekit",
      bucket: null,
      key: result.filePath,
      url: result.url,
    };
  }
}
