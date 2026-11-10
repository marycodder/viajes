require('reflect-metadata');
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { getConnectionToken } = require('@nestjs/mongoose');
const { DataSource } = require('typeorm');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { setupApp } = require('../dist/setup-app');

const features = [
  ['auth/auth', 'Auth'], ['trips/trips', 'Trips'], ['destinations/destinations', 'Destinations'],
  ['planning/planning', 'Planning'], ['documents/documents', 'Documents'], ['weather/weather', 'Weather'],
];
const controllers = features.map(([path, name]) => require(`../dist/${path}.controller`)[`${name}Controller`]);
const providers = features.map(([path, name]) => ({ provide: require(`../dist/${path}.service`)[`${name}Service`], useValue: {} }));
controllers.push(require('../dist/health.controller').HealthController);
providers.push({ provide: DataSource, useValue: {} }, { provide: getConnectionToken(), useValue: {} });
class ContractModule {}
Module({ controllers, providers })(ContractModule);

(async () => {
  // Construye el contrato con los controladores reales, sin iniciar conexiones a bases de datos.
  const app = await NestFactory.create(ContractModule, { logger: false });
  try {
    const document = setupApp(app);
    mkdirSync(resolve(__dirname, '../docs'), { recursive: true });
    writeFileSync(resolve(__dirname, '../docs/openapi.json'), JSON.stringify(document, null, 2) + '\n');
    console.log(`Contrato OpenAPI generado: ${Object.values(document.paths).reduce((count, item) => count + Object.keys(item).length, 0)} operaciones.`);
  } finally { await app.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
