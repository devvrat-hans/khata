# Contributing to Khata

Thanks for wanting to help. Khata handles people's money and private records, so changes are held to a careful bar, and small, focused pull requests are the fastest to land.

## Before you start

1. Read [`AGENTS.md`](AGENTS.md). It explains the architecture and the rules that keep balances correct and private hisabs private.
2. For anything bigger than a bug fix, open an issue first and describe the problem you want to solve. It saves you from building something that will not be merged.

## Making a change

1. Fork the repository and create a branch from `main`.
2. Set up the project as described in the [README](README.md).
3. Make your change. Keep business rules in `src/server/services` and money logic in `src/domain`.
4. Add or update tests. Changes to splits or balances need unit tests; changes to who can see what need tests in `tests/services.test.ts`.
5. Run `bun run check`. It must pass.
6. Check the UI at phone width (375px) and desktop width, in light and dark themes.
7. Open a pull request that says what changed and why, with screenshots for UI changes.

## Style

- TypeScript strict, no `any` without a reason in a comment.
- Follow [`DESIGN.md`](DESIGN.md): square corners, Aback UI components, Tabler icons, light and dark pairs.
- Write copy and comments in plain, specific English. No em dashes or en dashes, no exclamation marks.
- Comments explain why, not what.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected, and what happened. Never paste real email addresses, sign-in codes or other people's data.

For security problems, follow [`SECURITY.md`](SECURITY.md) instead of opening an issue.

By contributing you agree that your contribution is licensed under the [MIT license](LICENSE) and that you will follow the [code of conduct](CODE_OF_CONDUCT.md).
