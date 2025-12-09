import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: process.env.APP_GRAPHQL_CODEGEN_ENDPOINT,
    documents: [
        'app/**/*.tsx',
        'app/**/*.ts'
    ],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        './generated/types/graphql.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-urql',
            ],
            config: {
                withComponent: false,
                withHooks: true,
                purgeMagicComment: true,
                gqlImport: 'urql#gql',
                dedupeFragments: true,
                skipTypename: true,

                // FIXME: Enable this later
                // enumsAsTypes: true,
            },
        },
        './generated/schema.json': {
            plugins: [
                'introspection'
            ],
        }
    }
}

export default config;
