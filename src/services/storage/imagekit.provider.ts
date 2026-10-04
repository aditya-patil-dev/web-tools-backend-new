import ImageKit from "imagekit";
import { v4 as uuid } from "uuid";
import {
  StorageProvider,
  UploadInput,
  UploadOptions,
  UploadResult,
} from "./storage.interface";

function getImageKit(): ImageKit {
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy_public_key",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy_private_key",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
  });
}

export class ImageKitProvider implements StorageProvider {
  name: "imagekit" = "imagekit";

  async upload(
    input: UploadInput,
    options: UploadOptions,
    baseUrl: string,
  ): Promise<UploadResult> {
    const fileName = `${uuid()}.${options.ext ?? "bin"}`;

    const imagekit = getImageKit();
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
