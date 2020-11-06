# Woodpecker

## Запуск

Для запуска проекта необходимо добавить файл конфигурации `config.json` в корень и выполнить команду `npm start`.

## Конфигурация

Файл конфигурации содержит массив источников данных, которые используются для получения данных, их форматирования и обновления смарт-контрактов.

Конфигурация источника данных включает:

1. `name` - имя источника данных
2. `interval` - частота выполнения
3. `handlers` - конвеер обработчиков

Пример конфигурации проекта `hello world`:

```
[
  {
    "name": "my-data-source",
    "interval": 2000,
    "handlers": [
      {
        "name": "echo",
        "options": {
          "data": "hello world"
        }
      },
      "log"
    ]
  }
]
```

Каждый конкретный обработчик источника данных включает:

1. `name` - имя обработчика
2. `options` - опции обработчика

Если для обработчика не указываются опции, он может быть объявлен в виде строки, содержащей его имя.

### Echo

Обработчик `echo` применяется для получения данных из файла конфигурации.

К опциям обработчика относятся:

1. `data` - данные, генерируемые обработчиком

Пример использования:

```
[
  {
    ...
    "handlers": [
      {
        "name": "echo",
        "options": {
          "data": "hello world"
        }
      },
      ...
    ]
  }
]
```

### Http request

Обработчик `httpRequest` применяется для получения данных с помощью HTTP-запроса.

К опциям обработчика относятся:

1. `request` - конфигурация запроса (см. https://www.npmjs.com/package/axios#request-config)

Пример использования:

```
[
  {
    ...
    "handlers": [
      {
        "name": "httpRequest",
        "options": {
          "request": {
            "url": "https://jsonplaceholder.typicode.com/todos/1",
            "method": "get",
            "headers": {
              "User-Agent": "test"
            }
          }
        }
      },
      ...
    ]
  }
]
```

### Json

Обработчик `json` применяется для преобразования данных в формате JSON.

Пример использования:

```
[
  {
    ...
    "handlers": [
      {
        "name": "httpRequest",
        "options": {
            ...
        }
      },
      "json",
      ...
    ]
  }
]
```

### Field

Обработчик `field` применяется для получения конкретных полей из набора данных.

К опциям обработчика относятся:

1. `path` - путь для выборки данных из набора (см. https://www.npmjs.com/package/jsonpath#jsonpath-syntax)
2. `element` - результирующий элемент: `all` - все элементы, `first` - первый, `last` - последний

Пример использования:

```
[
  {
    ...
    "handlers": [
      {
        "name": "httpRequest",
        "options": {
            ...
        }
      },
      "json",
      {
        "name": "field",
        "options": {
          "path": "$.id",
          "element": "first"
        }
      },
      ...
    ]
  }
]
```

### Log

Обработчик `log` применяется для отладки. Он выводит данные в консоль.

Пример использования:

```
[
  {
    ...
    "handlers": [
      {
        "name": "httpRequest",
        "options": {
            ...
        }
      },
      "json",
      {
        "name": "field",
        "options": {
          "path": "$.id",
          "element": "first"
        }
      },
      "log",
      ...
    ]
  }
]
```

### Oracle update

Обработчик `oracleUpdate` применяется для обновления данных в смарт-контракте оракула.

К опциям обработчика относятся:

1. `provider` - URL используемой ноды блокчейна
2. `from` - приватный ключ аккаунта, выполняющего обновление
3. `contract` - адрес смарт-контракта

Пример использования:

```
[
  {
    ...
    "handlers": [
      {
        "name": "httpRequest",
        "options": {
            ...
        }
      },
      "json",
      {
        "name": "field",
        "options": {
          "path": "$.id",
          "element": "first"
        }
      },
      {
        "name": "oracleUpdate",
        "options": {
          "provider": "ws://localhost:8545",
          "from": "240a5dc4ba44d68d26948102b5816517485ac2dc92dd3a8c3dbc472a86748f3d",
          "contract": "0x29C1Ca33ECA1a7d8ABeC3F090f08C8f592aAA22B"
        }
      },
      ...
    ]
  }
]
```
