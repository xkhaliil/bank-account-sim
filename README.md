# Bank Account Simulator

A small command-line bank account simulator written in TypeScript.

## What it will do

- Open accounts for different people
- Deposit and withdraw money
- Block withdrawals that would make the balance go negative
- Transfer money between accounts
- Keep a history of every transaction

The idea is to keep the balance private inside an `Account` class so it can only change through methods like `deposit()` and `withdraw()`, not by editing it directly.

## Workspace

This repository is a [pnpm workspace](https://pnpm.io/workspaces) with two packages:

| Package | Folder                           | What it holds                                                     |
| ------- | -------------------------------- | ----------------------------------------------------------------- |
| `bank`  | [`features/bank`](features/bank) | Account types, transactions, the `Account` class and the guards   |
| `cli`   | [`apps/cli`](apps/cli)           | The script that loads a saved bank and prints the account reports |

`cli` depends on `bank` through `"bank": "workspace:*"`, so pnpm links the local package instead of downloading it. The shared tool versions (TypeScript, ESLint, Prettier) are pinned once in the `catalog` of [`pnpm-workspace.yaml`](pnpm-workspace.yaml) and read by both packages with `"catalog:"`.

[Nx](https://nx.dev) runs tasks across the packages. Because `lint` depends on `^lint` in [`nx.json`](nx.json), `bank` is always checked before `cli`. Each package has its own GitHub workflow in [`.github/workflows`](.github/workflows), and it only runs when files that package depends on change.

### Modlets

The code in `bank` is split into folders called modlets. Each folder has an `index.ts` that re-exports only what other code needs, and the `exports` map in [`features/bank/package.json`](features/bank/package.json) only lets other code reach those index files. `import Account from "bank/accounts"` works, but `bank/accounts/account.ts` does not.

| Modlet                                                 | Default export      | Named exports                                 | Private to the folder                  |
| ------------------------------------------------------ | ------------------- | --------------------------------------------- | -------------------------------------- |
| [`bank/accounts`](features/bank/src/accounts/index.ts) | the `Account` class | `describe()`, `AccountDetails`, `Transaction` | `money()`, `TransactionKind`           |
| [`bank/saved`](features/bank/src/saved/index.ts)       | `loadSavedBank()`   |                                               | `isSavedBank()` and the smaller guards |

### Files

| File                                                                                       | What it holds                                              |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| [`features/bank/src/accounts/types.ts`](features/bank/src/accounts/types.ts)               | `AccountDetails` and the `Transaction` union               |
| [`features/bank/src/accounts/transactions.ts`](features/bank/src/accounts/transactions.ts) | `describe()`, which handles every kind of transaction      |
| [`features/bank/src/accounts/account.ts`](features/bank/src/accounts/account.ts)           | The `Account` class with its private balance and totals    |
| [`features/bank/src/saved/guards.ts`](features/bank/src/saved/guards.ts)                   | The type guards that check a saved bank before it is used  |
| [`features/bank/src/saved/load.ts`](features/bank/src/saved/load.ts)                       | `loadSavedBank()`, which parses saved text and guards it   |
| [`apps/cli/src/data.ts`](apps/cli/src/data.ts)                                             | The accounts                                               |
| [`apps/cli/src/saved.ts`](apps/cli/src/saved.ts)                                           | The saved bank text, plus broken saves to test the guard   |
| [`apps/cli/src/index.ts`](apps/cli/src/index.ts)                                           | Loads the bank, replays its history and prints the reports |

## Setup

You need Node.js 22.18 or newer (it runs the TypeScript files directly) and pnpm 12.

```bash
pnpm install
```

## Scripts

Run these from the root of the repository.

| Command               | What it does                                                           |
| --------------------- | ---------------------------------------------------------------------- |
| `pnpm start`          | Run the `cli` package                                                  |
| `pnpm lint`           | Type check, ESLint and Prettier for every package, in dependency order |
| `pnpm lint-typecheck` | Type check every package                                               |
| `pnpm lint-eslint`    | Run ESLint in every package                                            |
| `pnpm lint-prettier`  | Check formatting in every package                                      |
| `pnpm format`         | Format every package with Prettier                                     |
| `pnpm nx graph`       | Show how the packages depend on each other                             |

## Tools

- **pnpm** workspaces with a catalog for shared versions
- **Nx** to run tasks across packages, with caching
- **TypeScript** with `strict` mode on
- **ESLint** with the recommended JS and TypeScript rules
- **Prettier** for formatting (no semicolons, double quotes, 100 character lines)
- **GitHub Actions** with path filters, so each workflow only runs when its files change
