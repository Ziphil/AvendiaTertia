//

import {
  AccessOptions,
  Client as FtpClient
} from "basic-ftp";


export class CustomFtpClient {

  private promise: Promise<void>;
  private client: FtpClient;
  private options?: AccessOptions;

  public constructor() {
    this.promise = Promise.resolve();
    this.client = new FtpClient();
  }

  public async access(options: AccessOptions): Promise<void> {
    this.options = options;
    await this.client.access(options);
  }

  private async reaccess(): Promise<void> {
    if (this.client.closed && this.options !== undefined) {
      await this.client.access(this.options);
    }
  }

  public close(): void {
    this.client.close();
  }

  public uploadFrom(sourcePath: string, remotePath: string): Promise<void> {
    let promise = new Promise<void>((resolve, reject) => {
      this.promise = this.promise.then(async () => {
        try {
          await this.reaccess();
          await this.client.uploadFrom(sourcePath, remotePath);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
    return promise;
  }

}