/**
 * Conventional Commits rules.
 * Format: type(scope): subject   e.g. feat(faqs): drag and drop reorder
 */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    helpUrl: 'https://www.conventionalcommits.org/en/v1.0.0/#summary',
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'style',
                'test',
            ],
        ],
        'scope-case': [2, 'always', 'kebab-case'],
        'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
        
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'header-max-length': [2, 'always', 72],
        'body-max-line-length': [2, 'always', 100],
    },
};
