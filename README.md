# Сервис сообщений - Telegram

Отвечает за отправку сообщений и уведомлений в Telegram с получением обратной связи.

Имя пакета: `@car-qr-link/messaging-sms`

## Используемые технологии, библиотеки

- [Grammy](https://grammy.dev)
- [Redis](https://redis.io)
- [Joi](https://joi.dev)
- [Pino](https://github.com/pinojs/pino)
- [dotenv](https://github.com/motdotla/dotenv)

## Настройки

Для настройки используются переменные окружения:

| Название         | Описание                             | По умолчанию               |
| ---------------- | ------------------------------------ | -------------------------- |
| `BROKER_URL`     | URL брокера сообщений                | `redis://localhost:6379/0` |
| `SEND_QUEUE`     | Имя очереди для отправки сообщений   | `messages:send:telegram`   |
| `RECEIVE_QUEUE`  | Имя очереди для полученных сообщений | `messages:received`        |
| `TELEGRAM_TOKEN` | Токен бота Telegram                  |                            |

## Входящие взаимодействия

Сервис принимает сообщения `SendMessage` из очереди `SEND_QUEUE` и на их основе выполняет отправку сообщений в Telegram.

## Исходящие взаимодействия

Любые сообщения боту от пользователя пересылает в очередь `RECEIVED_QUEUE`.
