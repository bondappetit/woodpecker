# Woodpecker

## Запуск

Для запуска проекта необходимо добавить файл конфигурации `config.json` в корень и выполнить команду `npm run rac`. При нестандартном пути к файлу конфигурации используется ключ командной строки `--config` (`npm run rac -- --config=path/to/config.json`).

## Конфигурация

Файл конфигурации содержит информацию об источнике данных (`portfolio`) и конфигурацию доступа к блокчейну (`blockchain`).

Конфигурация источника данных включает:

- `type` - тип источника (WiseWolves)
- `options` - опции источника
  - `url` - URL API
  - `login` - логин для авторизации
  - `password` - пароль для авторизации
  - `code` - код для двуфакторной аутентификации
  - `client` - идентификатор клиента

Конфигурация доступа к блокчейну включает:

- `provider` - URL ноды
- `depositaryAddress` - адрес депозитария для записи данных
- `sender` - приватный ключ для подписи всех создаваемых транзакций

Пример конфигурации проекта:

```
{
  "blockchain": {
    "provider": "http://127.0.0.1:8545",
    "depositaryAddress": "0x388C4bE70EA65E1E8411FEc3dDC090E5c89F6c6D",
    "sender": "0xcc52931958252d73b48dcaafc47bdb569ea350927a8021052cf9a94fea1d4ca9"
  },
  "portfolio": {
    "type": "WiseWolves",
    "options": {
      "url": "https://openapi-playground.wise-wolves.online/api",
      "login": "my-login",
      "password": "my-password",
      "code": "123",
      "client": "CW9ZQ9FE7X38PHAECW9ZQ9FE7X38PHAE"
    }
  }
}
```
