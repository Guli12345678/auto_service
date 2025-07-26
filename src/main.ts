import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from "cookie-parser";
async function start() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix("api");
  app.use(cookieParser());

  app.enableCors({
    origin: "http://localhost:4005",
    credentials: true,
  });

  const PORT = config.get<number>("PORT");
  await app.listen(PORT ?? 3001, () => {
    console.log(
      " + ====================================================================== +"
    );
    console.log(
      `| |                                                                      | |`
    );
    console.log(
      `| | 🩷             Server started at: http://localhost:${PORT}           🩷   | |`
    );
    console.log(
      `| |                                                                      | |`
    );
    console.log(
      " + ====================================================================== +"
    );
  });
}

start();
