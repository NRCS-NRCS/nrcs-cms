const {
    APP_TITLE,
    APP_ENVIRONMENT,
    APP_GRAPHQL_ENDPOINT,
    APP_GRAPHQL_CODEGEN_ENDPOINT,
} = import.meta.env;

export const environment = APP_ENVIRONMENT;
export const appTitle = APP_TITLE;
export const api = APP_GRAPHQL_ENDPOINT;
export const codegen = APP_GRAPHQL_CODEGEN_ENDPOINT;
