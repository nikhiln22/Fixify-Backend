import { App } from "./app";
import config from "./config/env";
import { database } from "./config/database";
import { container } from "./di/container";
import { ICronService } from "./interfaces/Icron/Icron";

class Server {
  private appInstance: App;

  constructor() {
    this.appInstance = new App();
  }

  public async start(): Promise<void> {
    try {
      await database.connect();

      this.appInstance.getServer().listen(config.PORT, () => {
        console.log(
          `Fixify Server is running at http://localhost:${config.PORT}`
        );
        console.log("Fixify backend redeployed at:", new Date());
      });

      const cronService = container.resolve<ICronService>("ICronService");
      cronService.startCronJobs();
    } catch (error) {
      console.error("Server failed to start due to database error:", error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
