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

This repository is a [pnpm workspace](https://pnpm.io/workspaces) with four packages:

| Package | Folder                           | What it holds                                                             |
| ------- | -------------------------------- | ------------------------------------------------------------------------- |
| `bank`  | [`features/bank`](features/bank) | Account types, transactions, the `Account` class and the guards           |
| `cli`   | [`apps/cli`](apps/cli)           | The `bank` command-line tool, built with Commander and Inquirer           |
| `api`   | [`apps/api`](apps/api)           | The Fastify server that serves the accounts and records transactions      |
| `web`   | [`apps/web`](apps/web)           | The browser page that lists the accounts and shows one when it is clicked |

`cli`, `api` and `web` depend on `bank` through `"bank": "workspace:*"`, so pnpm links the local package instead of downloading it. The shared tool versions (TypeScript, ESLint, Prettier) are pinned once in the `catalog` of [`pnpm-workspace.yaml`](pnpm-workspace.yaml) and read by every package with `"catalog:"`.

[Nx](https://nx.dev) runs tasks across the packages. Because `lint` depends on `^lint` in [`nx.json`](nx.json), `bank` is always checked before the apps. Each package has its own GitHub workflow in [`.github/workflows`](.github/workflows), and it only runs when files that package depends on change.

### Modlets

The code in `bank` is split into folders called modlets. Each folder has an `index.ts` that re-exports only what other code needs, and the `exports` map in [`features/bank/package.json`](features/bank/package.json) only lets other code reach those index files. `import Account from "bank/accounts"` works, but `bank/accounts/account.ts` does not.

| Modlet                                                 | Default export      | Named exports                                                                       | Private to the folder                |
| ------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| [`bank/accounts`](features/bank/src/accounts/index.ts) | the `Account` class | `describe()`, `money()`, `formatReport()`, `accountsIn()`, the guards and the types | `TransactionKind`                    |
| [`bank/saved`](features/bank/src/saved/index.ts)       | `loadBank()`        |                                                                                     | `isSavedBank()`                      |
| [`bank/ledger`](features/bank/src/ledger/index.ts)     | the `Ledger` class  | `openLedger()`                                                                      |                                      |
| [`bank/services`](features/bank/src/services/index.ts) |                     | `listAccounts()`, `listOwnerAccounts()`, `getAccount()`, `recordTransaction()`      | `request()` and the server's address |

### Files

| File                                                                                                   | What it holds                                                                                                                               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`features/bank/src/accounts/types.ts`](features/bank/src/accounts/types.ts)                           | `AccountDetails`, the `Transaction` union, and `AccountSummary` (`Pick`) and `AccountReport` (`Omit`), which are made from `AccountDetails` |
| [`features/bank/src/accounts/transactions.ts`](features/bank/src/accounts/transactions.ts)             | `describe()`, which handles every kind of transaction                                                                                       |
| [`features/bank/src/accounts/account.ts`](features/bank/src/accounts/account.ts)                       | The `Account` class with its private balance and totals                                                                                     |
| [`features/bank/src/accounts/guards.ts`](features/bank/src/accounts/guards.ts)                         | `isAccountDetails()` and `isTransaction()`                                                                                                  |
| [`features/bank/src/accounts/report.ts`](features/bank/src/accounts/report.ts)                         | `formatReport()`, which turns a report into text                                                                                            |
| [`features/bank/src/ledger/ledger.ts`](features/bank/src/ledger/ledger.ts)                             | The `Ledger` class that holds every account and replays history                                                                             |
| [`features/bank/src/saved/guards.ts`](features/bank/src/saved/guards.ts)                               | `isSavedBank()`, which checks a saved bank before it is used                                                                                |
| [`features/bank/src/saved/load.ts`](features/bank/src/saved/load.ts)                                   | `loadBank()`, which reads a saved bank file and guards it                                                                                   |
| [`features/bank/src/saved/demo.json`](features/bank/src/saved/demo.json)                               | The demo bank: its accounts and their saved history                                                                                         |
| [`apps/cli/src/index.ts`](apps/cli/src/index.ts)                                                       | The Commander program: its commands, arguments and options                                                                                  |
| [`apps/cli/src/commands/report.ts`](apps/cli/src/commands/report.ts)                                   | `report`, which asks for the account when it is left out                                                                                    |
| [`apps/cli/src/commands/withdraw.ts`](apps/cli/src/commands/withdraw.ts)                               | `withdraw`, which posts a withdrawal to the server                                                                                          |
| [`features/bank/src/services/services.ts`](features/bank/src/services/services.ts)                     | The service functions, and the private generic `request()` that makes every request to the server                                           |
| [`apps/web/src/main.ts`](apps/web/src/main.ts)                                                         | Finds `#app` with a selector, then shows the list and the chosen account in turn                                                            |
| [`apps/web/src/pick/pick.ts`](apps/web/src/pick/pick.ts)                                               | Builds the account list and waits for a click on it                                                                                         |
| [`apps/web/src/account/account.ts`](apps/web/src/account/account.ts)                                   | Shows one account's balance, totals and history, with a Back button                                                                         |
| [`apps/api/src/index.ts`](apps/api/src/index.ts)                                                       | Opens the ledger, registers the route plugins and listens on port 3000                                                                      |
| [`apps/api/src/routes/accounts/accounts.ts`](apps/api/src/routes/accounts/accounts.ts)                 | The plugin with the account routes                                                                                                          |
| [`apps/api/src/routes/transactions/transactions.ts`](apps/api/src/routes/transactions/transactions.ts) | The plugin with the transaction route                                                                                                       |

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

## Page

`pnpm web` starts the page on http://localhost:5173 with Vite. Start the server too with `pnpm api`, since the page gets the accounts through the same service functions as the CLI (the server allows it with `@fastify/cors`).

- The page finds the element that holds it with `document.querySelector("#app")`. If it is missing, the script writes a message in the page and stops.
- Every element is made with `createElement` and its text set with `textContent`. Nothing sets `innerHTML`.
- The list has one click listener. It finds the clicked account with `event.target` and `closest("button")`, and removes itself once an account is picked. The Back button's listener removes itself too.
- When the server cannot be reached, the page shows `Cannot reach the bank server at http://localhost:3000. Start it with "pnpm api".`

## Usage

The CLI talks to the server through the service functions in [`bank/services`](features/bank/src/services/services.ts), so start the server first with `pnpm api` in another terminal. One private generic function, `request<Reply extends object = object>()`, makes every request: each service names the type of its reply, and no other file calls `fetch`. When the server replies with an error, the CLI prints the message the server sent. When the server is not running, it prints `Cannot reach the bank server at http://localhost:3000. Start it with "pnpm api".`

```text
$ pnpm start --help
Usage: bank [options] [command]

Commands:
  report [options] [account]   Show the balance, totals and history of an account
  withdraw <account> <amount>  Take money out of an account and show the account afterwards
```

| Command                            | What happens                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm start report CHK-001`        | Gets `CHK-001` from the server and prints its report                               |
| `pnpm start report`                | Gets every account, asks which one to show, then prints its report                 |
| `pnpm start report --owner Amira`  | Only offers Amira's accounts when asking (sent as the `x-owner` header)            |
| `pnpm start withdraw CHK-001 50`   | Posts the withdrawal to the server and prints the account afterwards               |
| `pnpm start withdraw CHK-001 5000` | Prints the server's reason, `CHK-001 only has $210.00, ...`, and exits with 1      |
| `pnpm start report NOPE`           | Prints the server's message, `There is no account called "NOPE"`, and exits with 1 |

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
| `pnpm web`             | Start the page with Vite on http://localhost:5173                      |
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
- **Fastify** for the server, with **nodemon** to restart it on save, and **Vite** for the page
- **GitHub Actions** with path filters, so each workflow only runs when its files change
