import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModuleOptions } from 'nestjs-redis';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public getEvent() {
    return this.getValue('EVENT', true);
  }

  public getClientId() {
    return this.getValue('CLIENT_ID', true);
  }

  public getAdminId() {
    return this.getValue('ADMIN_BOT_ID', true);
  }

  public getMorkovkoChannel() {
    return this.getValue('MORKOVKO_CHANNEL', true);
  }

  public geGuildId() {
    if (this.isProduction()) {
      return this.getValue('GUILD_PROD_ID', true);
    } else {
      return this.getValue('GUILD_DEV_ID', true);
    }
  }

  public getToken() {
    if (this.isProduction()) {
      return this.getValue('PROD_TOKEN', true);
    } else {
      return this.getValue('DEV_TOKEN', true);
    }
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      // migrations: ['dist/migrations/*.{ts,js}'],
      // migrationsTableName: 'typeorm_migrations',
      // migrationsRun: true,
      // cli: {
      //   migrationsDir: 'src/migrations',
      // },
    };
  }

  public getRedisConfig(): RedisModuleOptions {
    return {
      host: this.getValue('REDIS_HOST'),
      port: parseInt(this.getValue('REDIS_PORT')),
      db: parseInt(this.getValue('REDIS_DATABASE')),
      password: this.getValue('REDIS_PASSWORD'),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
