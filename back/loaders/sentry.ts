import { Application } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import Logger from './logger';
import config from '../config';
import fs from 'fs';
import { parseVersion } from '../config/util';

export default async ({ expressApp }: { expressApp: Application }) => {
  const { version } = await parseVersion(config.versionFile);

  Sentry.init({
    ignoreErrors: [
      /SequelizeUniqueConstraintError/i,
      /Validation error/i,
      /UnauthorizedError/i,
      /celebrate request validation failed/i,
    ],
    dsn: 'https://b5f5f0260ac751d58e71ea584da7ff98@o4505666818015232.ingest.sentry.io/4505666827911168',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app: expressApp }),
    ],
    tracesSampleRate: 0.8,
    release: version,
  });

  expressApp.use(Sentry.Handlers.requestHandler());
  expressApp.use(Sentry.Handlers.tracingHandler());

  Logger.info('✌️ Sentry loaded');
};
