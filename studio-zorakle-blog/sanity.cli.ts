import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '4kjxjblw',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: '../site/src/**/*.{ts,tsx,astro}',
    schema: 'schema.json',
    generates: '../site/src/sanity.types.ts',
    overloadClientMethods: true,
  },
})
