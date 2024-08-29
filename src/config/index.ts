require('dotenv').config();

export interface Config {
    BROKER_URL: string
    SEND_QUEUE: string
    RECEIVED_QUEUE: string

    TELEGRAM_TOKEN: string
}

export const config: Config = {
    BROKER_URL: process.env.BROKER_URL || 'redis://localhost:6379/0',
    SEND_QUEUE: process.env.SEND_QUEUE || 'messages:send:telegram',
    RECEIVED_QUEUE: process.env.RECEIVED_QUEUE || 'messages:received',

    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
}
