# Naming Conventions

Github Action to validate repository and branch naming within HInfinity.

## About

The project allows to verify the validity of repository and branch naming based on static rules defined within [config.json](./config/config.json).

## Usage

-   See [test.yml](./.github/workflows/test.yml)

```yaml
steps:
- uses: HInfinity/pub-action-naming_conventions@main
  with:
    GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

## Built With

-   JavaScript
-   Node.js
-   NPM
-   GitHub Actions API

To view the whole list of dependencies please refer to package.json.

## Future Changes

-   The repository will become private when GitHub enables private actions creation.
