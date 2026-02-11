import {
    Schema,
    defineConfig,
    overrideDefineForWebAppServe,
} from '@togglecorp/vite-plugin-validate-env';

const webAppServeEnabled = process.env.WEB_APP_SERVE_ENABLED?.toLowerCase() === 'true';
if (webAppServeEnabled) {
    // eslint-disable-next-line no-console
    console.warn('Building application for web-app-serve');
}
const overrideDefine = webAppServeEnabled
    ? overrideDefineForWebAppServe
    : undefined;


export default defineConfig({
    overrideDefine,
    validator: 'builtin',
    schema: {
        // NOTE: These are the dynamic env variables
        APP_TITLE: Schema.string(),
        APP_GRAPHQL_ENDPOINT: Schema.string({ format: 'url', protocol: true, tld: false }),
        APP_GRAPHQL_CODEGEN_ENDPOINT: Schema.string(),

    },
});