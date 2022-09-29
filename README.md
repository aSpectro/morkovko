# Morkovko
Discord бот - Nest.js, PostgreSQL, Discord.js
![morkovko.png](https://aspectro.pw/img/morkovko_github.png)
### Развертывание
```bash
# development

#создает и запускает docker контейнер с бд, при повторном запуске перезатирает существующий
$ sh ./start-db.sh
# запускает приложение в dev режиме
$ make dev

# production mode
$ make prod

# or
$ npm/yarn install && npm/yarn start:dev/prod
```

#### При первом запуске
1. Создать в корне папку outputs - там будут лежать сгенерированные изображения морковок. Для генерации изображений нужно раскомментировать вызов модуля MorkovkoNFT() в main.ts, после успешной генерации (см. консоль) в .env нужно указать кол-во доступных изображений (BOT_IMAGES_COUNT) и закомментировать вызов MorkovkoNFT().

2. Создать в корне проекта .env, пример наполнения есть в .env.example
```bash
POSTGRES_HOST=хост бд
POSTGRES_PORT=порт бд
POSTGRES_USER=узер бд
POSTGRES_PASSWORD=пароль юзера
POSTGRES_DATABASE=название базы
RUN_MIGRATIONS=использовать автоматические миграции
DEV_TOKEN=токен бота для разработки
PROD_TOKEN=токен бота для прода
CLIENT_ID=clientId бота
ADMIN_BOT_ID=id admin пользователя
BOT_IMAGES_COUNT=кол-во сгенерированных изображений
GUILD_DEV_ID=id discord сервера для слеш команд
GUILD_PROD_ID=id discord сервера для слеш команд
MORKOVKO_CHANNEL=id канала, в котором разрешено работать боту на проде
MODE=режим разработки
PORT=порт nest модуля
```

3. Сделать копию start-db.example.sh и назвать start-db.sh, задать необходимые параметры для создания докер контейнера с базой данных. Настройки должны совпадать с .env
```bash
SERVER=название контейнера
PW=пароль от базы
DB=название базы
-p 5433:5432 указать маску порта докера в вашу локалку, первое число 5433, 5432 это порт postgresql
-d имя юзера базы
```

### Зависимости
- Docker 20+
- Nodejs 14+
- ```make``` for ubuntu/debian ```apt install make```