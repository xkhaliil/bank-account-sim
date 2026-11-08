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

This repository is a [pnpm workspace](https://pnpm.io/workspaces) with three packages:

| Package | Folder                           | What it holds                                                        |
| ------- | -------------------------------- | -------------------------------------------------------------------- |
| `bank`  | [`features/bank`](features/bank) | Account types, transactions, the `Account` class and the guards      |
| `cli`   | [`apps/cli`](apps/cli)           | The `bank` command-line tool, built with Commander and Inquirer      |
| `api`   | [`apps/api`](apps/api)           | The Fastify server that serves the accounts and records transactions |

`cli` and `api` depend on `bank` through `"bank": "workspace:*"`, so pnpm links the local package instead of downloading it. The shared tool versions (TypeScript, ESLint, Prettier) are pinned once in the `catalog` of [`pnpm-workspace.yaml`](pnpm-workspace.yaml) and read by every package with `"catalog:"`.

[Nx](https://nx.dev) runs tasks across the packages. Because `lint` depends on `^lint` in [`nx.json`](nx.json), `bank` is always checked before `cli` and `api`. Each package has its own GitHub workflow in [`.github/workflows`](.github/workflows), and it only runs when files that package depends on change.

### Modlets

The code in `bank` is split into folders called modlets. Each folder has an `index.ts` that re-exports only what other code needs, and the `exports` map in [`features/bank/package.json`](features/bank/package.json) only lets other code reach those index files. `import Account from "bank/accounts"` works, but `bank/accounts/account.ts` does not.

| Modlet                                                 | Default export      | Named exports                                                            | Private to the folder        |
| ------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| [`bank/accounts`](features/bank/src/accounts/index.ts) | the `Account` class | `describe()`, `formatReport()`, `accountsIn()`, the guards and the types | `money()`, `TransactionKind` |
| [`bank/saved`](features/bank/src/saved/index.ts)       | `loadBank()`        |                                                                          | `isSavedBank()`              |
| [`bank/ledger`](features/bank/src/ledger/index.ts)     | the `Ledger` class  | `openLedger()`                                                           |                              |

### Files

| File                                                                                                   | What it holds                                                          |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [`features/bank/src/accounts/types.ts`](features/bank/src/accounts/types.ts)                           | `AccountDetails` and the `Transaction` union                           |
| [`features/bank/src/accounts/transactions.ts`](features/bank/src/accounts/transactions.ts)             | `describe()`, which handles every kind of transaction                  |
| [`features/bank/src/accounts/account.ts`](features/bank/src/accounts/account.ts)                       | The `Account` class with its private balance and totals                |
| [`features/bank/src/accounts/guards.ts`](features/bank/src/accounts/guards.ts)                         | `isAccountDetails()` and `isTransaction()`                             |
| [`features/bank/src/accounts/report.ts`](features/bank/src/accounts/report.ts)                         | `formatReport()`, which turns a report into text                       |
| [`features/bank/src/ledger/ledger.ts`](features/bank/src/ledger/ledger.ts)                             | The `Ledger` class that holds every account and replays history        |
| [`features/bank/src/saved/guards.ts`](features/bank/src/saved/guards.ts)                               | `isSavedBank()`, which checks a saved bank before it is used           |
| [`features/bank/src/saved/load.ts`](features/bank/src/saved/load.ts)                                   | `loadBank()`, which reads a saved bank file and guards it              |
| [`features/bank/src/saved/demo.json`](features/bank/src/saved/demo.json)                               | The demo bank: its accounts and their saved history                    |
| [`apps/cli/src/index.ts`](apps/cli/src/index.ts)                                                       | The Commander program: its commands, arguments and options             |
| [`apps/cli/src/commands/report.ts`](apps/cli/src/commands/report.ts)                                   | `report`, which asks for the account when it is left out               |
| [`apps/cli/src/commands/withdraw.ts`](apps/cli/src/commands/withdraw.ts)                               | `withdraw`, which tries a withdrawal on a copy of the bank             |
| [`apps/api/src/index.ts`](apps/api/src/index.ts)                                                       | Opens the ledger, registers the route plugins and listens on port 3000 |
| [`apps/api/src/routes/accounts/accounts.ts`](apps/api/src/routes/accounts/accounts.ts)                 | The plugin with the account routes                                     |
| [`apps/api/src/routes/transactions/transactions.ts`](apps/api/src/routes/transactions/transactions.ts) | The plugin with the transaction route                                  |

### Loading a saved bank

`loadBank(name)` reads `<name>.json` from its own folder (the path is built from `import.meta.dirname`, not from where you run the program), checks it with the `isSavedBank()` guard, and returns a promise of the saved bank. Each failure has its own message, and the program prints it and exits with code 1:

| Problem                      | Message                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| The file is missing          | `There is no saved bank called "demo"`                                    |
| The file can't be read       | `Could not read the saved bank "demo"`                                    |
| The file is not JSON         | `The saved bank "demo" is not valid JSON`                                 |
| The JSON has the wrong shape | `The saved bank "demo" is missing a piece or has the wrong kind of piece` |

## Server

`pnpm api` starts the Fastify server on http://localhost:3000 with nodemon, so it restarts when you save a file in `apps/api` or `features/bank`. It opens the demo bank when it starts and keeps every change in memory only.

| Route                | Needs                     | Replies                                                                         |
| -------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| `GET /accounts`      |                           | 200 with every account's id, owners and frozen flag                             |
| `GET /accounts/:id`  | an account id in the path | 200 with the account's report, or 404 when no account has that id               |
| `GET /my-accounts`   | an `x-owner` header       | 200 with that owner's accounts, or 401 when the header is missing               |
| `POST /transactions` | a JSON transaction body   | 201 with the transaction, 400 when the body is wrong, 409 when the bank refuses |

```bash
curl -i localhost:3000/accounts/CHK-001
curl -i localhost:3000/accounts/NOPE                      # 404
curl -i localhost:3000/my-accounts                        # 401
curl -i -H "x-owner: Amira" localhost:3000/my-accounts
curl -i -X POST localhost:3000/transactions               # 400
curl -i -X POST -H "content-type: application/json"   -d '{"kind":"deposit","account":"CHK-001","amount":50}' localhost:3000/transactions   # 201
```

## Usage

```text
$ pnpm start --help
Usage: bank [options] [command]

Commands:
  report [options] [account]             Show the balance, totals and history of an account
  withdraw [options] <account> <amount>  Try a withdrawal and show the account afterwards (nothing is saved)
```

| Command                                 | What happens                                                   |
| --------------------------------------- | -------------------------------------------------------------- |
| `pnpm start report CHK-001`             | Prints the report for `CHK-001`                                |
| `pnpm start report`                     | Asks which account to show, then prints its report             |
| `pnpm start withdraw CHK-001 50`        | Takes 50 out of `CHK-001` and prints the report (not saved)    |
| `pnpm start withdraw CHK-001 1000`      | Prints why the withdrawal is blocked and exits with code 1     |
| `pnpm start report CHK-001 --bank nope` | Prints `There is no saved bank called "nope"` and exits with 1 |

A value given on the command line is never asked for again. Pressing Ctrl+C at a prompt ends the program quietly with exit code 130.

## Setup

You need Node.js 22.18 or newer (it runs the TypeScript files directly) and pnpm 12.

```bash
pnpm install
```

## Scripts

Run these from the root of the repository.

| Command                | What it does                                                           |
| ---------------------- | ---------------------------------------------------------------------- |
| `pnpm start <command>` | Run the `bank` tool, for example `pnpm start report CHK-001`           |
| `pnpm api`             | Start the server with nodemon, which restarts it when a file is saved  |
| `pnpm lint`            | Type check, ESLint and Prettier for every package, in dependency order |
| `pnpm lint-typecheck`  | Type check every package                                               |
| `pnpm lint-eslint`     | Run ESLint in every package                                            |
| `pnpm lint-prettier`   | Check formatting in every package                                      |
| `pnpm format`          | Format every package with Prettier                                     |
| `pnpm nx graph`        | Show how the packages depend on each other                             |

## Tools

- **pnpm** workspaces with a catalog for shared versions
- **Nx** to run tasks across packages, with caching
- **TypeScript** with `strict` mode on
- **ESLint** with the recommended JS and TypeScript rules
- **Prettier** for formatting (no semicolons, double quotes, 100 character lines)
- **Fastify** for the server, with **nodemon** to restart it on save
- **GitHub Actions** with path filters, so each workflow only runs when its files change
