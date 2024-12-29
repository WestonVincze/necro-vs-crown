# Code Standards & Best Practices

## Architecture

### packages

Each directory within src should export all relevant modules using `index.ts`

#### client package

#### shared package

#### server package

## Preferred Patterns

## BitECS

1. Minimize the number of Systems that mutate Components - use "read only" as much as possible
1. Prefer SoA format for components, but don't be afraid to use AoS when the use case fits
1. Systems should have as few roles as possible - keep them simple and straightforward
