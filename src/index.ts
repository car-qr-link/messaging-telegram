import { createLogger, createQueueClient } from "@car-qr-link/messaging-base";
import { Bot } from "grammy";
import { config } from "./config";
import { ReceiverService } from "./services/receiver";
import { SenderService } from "./services/sender";

async function main() {
    const logger = createLogger();
    const queue = createQueueClient(config.BROKER_URL);
    const telegram = new Bot(config.TELEGRAM_TOKEN);
    telegram.use(async (ctx, next) => {
        logger.info('Update received', { update: ctx.update });
        await next();
    });

    const sendService = new SenderService(
        config.SEND_QUEUE,
        queue,
        telegram.api,
        logger
    );
    const receiveService = new ReceiverService(
        config.RECEIVED_QUEUE,
        telegram,
        queue,
        logger
    );

    await queue.start();
    await sendService.start();
    await receiveService.start();

    process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await receiveService.stop();
        await sendService.stop();
        await queue.close();

        logger.info('Bye!');
        process.exit(0);
    });

    logger.info('Ready!');
}

main();
