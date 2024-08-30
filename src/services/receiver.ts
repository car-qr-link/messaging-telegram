import { MessageReceived, NotificationChannel } from "@car-qr-link/apis";
import { Logger, QueueClient } from "@car-qr-link/messaging-base";
import { Bot, CommandContext, Context } from "grammy";

export class ReceiverService {
    constructor(
        private readonly queueName: string,

        private readonly telegram: Bot,
        private readonly queue: QueueClient,
        private readonly logger: Logger
    ) {

    }

    public async start() {
        this.telegram.command(
            "start",
            (ctx) => this.handleStart.bind(this)(ctx)
        );
        this.telegram.on("message", async (ctx) => {
            if (!ctx.message?.text) {
                await ctx.reply("Извините, я понимаю только текстовые сообщения");
                return;
            }

            await this.queue.publish<MessageReceived>(this.queueName, {
                channel: NotificationChannel.Telegram,
                message: ctx.message.text,
                from: String(ctx.from?.id),
            });

            await ctx.reply("Спасибо!", { reply_markup: { remove_keyboard: true } });
        });
        // this.telegram.on('callback_query', async (ctx) => {
        //     if (ctx.callbackQuery?.data === CALLBACK_DATA) {
        //         await ctx.editMessageReplyMarkup();

        //         await ctx.api.sendMessage(ctx.callbackQuery.from.id, "Спасибо!");
        //     }

        //     await ctx.answerCallbackQuery();
        // });

        this.telegram.start({ drop_pending_updates: true });

        this.logger.info('ReceiverService started');
    }

    public async stop() {
        this.telegram.stop();

        this.logger.info('ReceiverService stopped');
    }

    private async handleStart(ctx: CommandContext<Context>) {
        return ctx.reply(`Здравствуйте!\r\n\r\nВаш ИД <code>${ctx.from?.id}</code>.\r\n\r\nДля получения уведомлений через Telegram укажите его в профиле на сайте https://carqr.link`, { parse_mode: "HTML" })
    }
}