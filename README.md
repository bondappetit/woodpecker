# Woodpecker

## Запуск

Для запуска проекта необходимо добавить файл конфигурации `config.json` в корень и выполнить команду `npm run rac`. При нестандартном пути к файлу конфигурации используется ключ командной строки `--config` (`npm run rac -- --config=path/to/config.json`). При нестандарной сети используется ключ командной строки `--network` (`npm run rac -- --network=ropsten`).

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
  - `deny` - массив идентификаторов исключаемых активов

Конфигурация доступа к блокчейну включает:

- `provider` - URL ноды
- `depositary` - адрес или имя депозитария для записи данных
- `sender` - приватный ключ для подписи всех создаваемых транзакций

Пример конфигурации проекта:

```
{
  "blockchain": {
    "provider": "http://127.0.0.1:8545",
    "depositary": "RealAssetDepositaryBalanceView",
    "sender": "0xcc52931958252d73b48dcaafc47bdb569ea350927a8021052cf9a94fea1d4ca9"
  },
  "portfolio": {
    "type": "WiseWolves",
    "options": {
      "url": "https://openapi-playground.wise-wolves.online/api",
      "login": "my-login",
      "password": "my-password",
      "code": "123",
      "client": "CW9ZQ9FE7X38PHAECW9ZQ9FE7X38PHAE",
      "deny": ["EUR", "US77586TAA43"]
    }
  }
}
```
