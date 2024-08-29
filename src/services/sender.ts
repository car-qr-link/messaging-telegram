import { NotificationChannel, SendMessage, SendMessageSchema } from "@car-qr-link/apis";
import { Logger, QueueClient } from "@car-qr-link/messaging-base";
import { Api } from "grammy";

export class SenderService {
    private unsubscribe: (() => void) | null;

    public constructor(
        private readonly queueName: string,
        private readonly queue: QueueClient,
        private readonly telegram: Api,
        private readonly logger: Logger
    ) {
        this.unsubscribe = null;
    }

    public async start() {
        this.unsubscribe = await this.queue.subscribe<SendMessage>(this.queueName, async (queueName, message) => {
            const { error } = SendMessageSchema.validate(message);
            if (error) {
                this.logger.error("Invalid message:", error);
                return;
            }

            if (message.channel !== NotificationChannel.Telegram) {
                this.logger.error("Unsupported channel", message);
                return;
            }

            this.logger.info('Message received', message);

            try {
                await this.telegram.sendMessage(
                    message.to,
                    message.message,
                    message.isNotification
                        ? { reply_markup: { keyboard: [[{ text: "Уже иду!" }]], one_time_keyboard: true } }
                        : undefined
                );
            } catch (e) {
                this.logger.error('Failed to send message', { error: e });
                return;
            }

            this.logger.info('Message sent');
        });

        this.logger.info('SendService started');
    }

    public async stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.unsubscribe = null;

        this.logger.info('SendService stopped');
    }
}