import { App } from "./app";
import config from "./config/env";
import { database } from "./config/database";


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
      });
    } catch (error) {
      console.error("Server failed to start due to database error:", error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
