# Bank Account Simulator

A small bank written in TypeScript, made to practise building one project from several apps that share code. A server holds a few bank accounts in memory. A command-line tool and a web page read those accounts and move money through the server.

## What it does

- Keeps accounts for one or more owners, with a balance that can only change through deposits, withdrawals and transfers
- Blocks any withdrawal or transfer that would make a balance negative, and any change to a frozen account
- Keeps a history of every transaction and a total for each kind of transaction
- Loads the starting accounts and their history from a JSON file, and checks the file before using it
- Serves the accounts over HTTP, and records new transactions sent to it
- Shows an account's report in the terminal, and lets you withdraw money from the terminal
- Lists the accounts in a web page, and shows an account's balance, totals and history when you click it

## Setup

You need:

- **Node.js 22.18 or newer.** The apps run their TypeScript files directly, which needs Node 22.18.
- **pnpm 12.** Install it with `npm install -g pnpm@12`. Inside this repository, plain `npm` commands refuse to run, because the project asks for pnpm.

Then clone the repository and install the dependencies:

```bash
git clone https://github.com/xkhaliil/bank-account-sim.git
cd bank-account-sim
pnpm install
```

## Running it

The command-line tool and the web page both get their data from the server, so start the server first and leave it running.

```bash
# Terminal 1: the server, on http://localhost:3000
pnpm api

# Terminal 2: the command-line tool
pnpm start report CHK-001
pnpm start withdraw CHK-001 50

# Terminal 3: the web page, on http://localhost:5173
pnpm web
```

The server starts from the demo bank in [`features/bank/src/saved/demo.json`](features/bank/src/saved/demo.json) each time. Changes made through the command-line tool or with curl stay until the server stops.

## Commands

Run these from the root of the repository.

| Command                   | What it does                                                           |
| ------------------------- | ---------------------------------------------------------------------- |
| `pnpm api`                | Start the server with nodemon, which restarts it when a file is saved  |
| `pnpm start <command>`    | Run the command-line tool, for example `pnpm start report CHK-001`     |
| `pnpm web`                | Start the web page with Vite                                           |
| `pnpm --filter web build` | Build the web page into `apps/web/dist`                                |
| `pnpm lint`               | Type check, ESLint and Prettier for every package, in dependency order |
| `pnpm lint-typecheck`     | Type check every package                                               |
| `pnpm lint-eslint`        | Run ESLint in every package                                            |
| `pnpm lint-prettier`      | Check formatting in every package                                      |
| `pnpm format`             | Format every package with Prettier                                     |
| `pnpm nx graph`           | Show how the packages depend on each other                             |

## How the monorepo is organized

This repository is a [pnpm workspace](https://pnpm.io/workspaces) with one shared library and three apps:

| Package | Folder                           | What it holds                                                                                                            |
| ------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `bank`  | [`features/bank`](features/bank) | Everything the apps share: accounts, guards, the saved bank file, the ledger, the reply shapes and the service functions |
| `api`   | [`apps/api`](apps/api)           | The Fastify server                                                                                                       |
| `cli`   | [`apps/cli`](apps/cli)           | The command-line tool, built with Commander and Inquirer                                                                 |
| `web`   | [`apps/web`](apps/web)           | The web page, built with Vite                                                                                            |

Each app depends on `bank` through `"bank": "workspace:*"`. This is how the parts fit together:

```text
apps/cli ──┐                                   ┌── bank/ledger ── bank/saved ── demo.json
           ├── bank/services ── HTTP ── apps/api
apps/web ──┘                                   └── bank/accounts (the Account class and the guards)
```

The command-line tool and the web page never call `fetch` themselves. They call the service functions in `bank/services`, which make every request to the server and check every reply.

### Modlets

All code sits in `src` folders, organized as modlets: a folder of files that work together, with an `index.ts` that only re-exports what other code needs. `bank` exposes only its modlet indexes, through the `exports` map in [`features/bank/package.json`](features/bank/package.json), so `import Account from "bank/accounts"` works but `bank/accounts/account.ts` does not.

| Modlet                                                                 | What it holds                                                                                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`bank/accounts`](features/bank/src/accounts/index.ts)                 | The `Account` class (default export), the account and transaction types, their guards, and `describe()`, `money()` and `formatReport()`          |
| [`bank/saved`](features/bank/src/saved/index.ts)                       | `loadBank()` (default export), which reads a saved bank file and checks it with `isSavedBank()`                                                  |
| [`bank/ledger`](features/bank/src/ledger/index.ts)                     | The `Ledger` class (default export), which holds every account and replays a history, and `openLedger()`                                         |
| [`bank/replies`](features/bank/src/replies/index.ts)                   | `ErrorReply`, the shape of every error the server sends, and guards for each kind of reply                                                       |
| [`bank/services`](features/bank/src/services/index.ts)                 | `listAccounts()`, `listOwnerAccounts()`, `getAccount()` and `recordTransaction()`. The generic `request()` and the server's address stay private |
| [`api/routes/accounts`](apps/api/src/routes/accounts/index.ts)         | The plugin with the account routes                                                                                                               |
| [`api/routes/transactions`](apps/api/src/routes/transactions/index.ts) | The plugin with the transaction route                                                                                                            |
| [`api/errors`](apps/api/src/errors/index.ts)                           | The handlers that turn unknown routes and errors into an `ErrorReply`                                                                            |
| [`cli/commands`](apps/cli/src/commands/index.ts)                       | The `report` and `withdraw` commands                                                                                                             |
| [`web/pick`](apps/web/src/pick/index.ts)                               | The account list, which waits for a click                                                                                                        |
| [`web/account`](apps/web/src/account/index.ts)                         | One account's balance, totals and history, with a Back button                                                                                    |

Each app also has an entry file that wires its modlets together: [`apps/api/src/index.ts`](apps/api/src/index.ts), [`apps/cli/src/index.ts`](apps/cli/src/index.ts) and [`apps/web/src/main.ts`](apps/web/src/main.ts).

### Shared setup

- [`pnpm-workspace.yaml`](pnpm-workspace.yaml) lists the packages and pins the tool versions every package shares in its `catalog` (TypeScript, ESLint, Prettier, `@types/node`). Packages read them with `"catalog:"`.
- [`nx.json`](nx.json) runs `lint` across the packages. Because `lint` depends on `^lint`, `bank` is always checked before the apps, and results are cached.
- [`tsconfig.base.json`](tsconfig.base.json) holds the TypeScript settings every package extends, with `strict` on.
- [`.github/workflows`](.github/workflows) has one workflow per package. Each runs only when files that package depends on change. The `api` and `cli` workflows also start the server and call it.

## The command-line tool

```text
$ pnpm start --help
Usage: bank [options] [command]

Commands:
  report [options] [account]   Show the balance, totals and history of an account
  withdraw <account> <amount>  Take money out of an account and show the account afterwards
```

| Command                            | What happens                                                               |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `pnpm start report CHK-001`        | Prints the report for `CHK-001`                                            |
| `pnpm start report`                | Asks which account to show, then prints its report                         |
| `pnpm start report --owner Amira`  | Only offers Amira's accounts when asking (sent to the server as `x-owner`) |
| `pnpm start withdraw CHK-001 50`   | Records the withdrawal on the server and prints the account afterwards     |
| `pnpm start withdraw CHK-001 5000` | Prints `CHK-001 only has $210.00, taking $5000.00 would make it negative`  |

A value given on the command line is never asked for again. Pressing Ctrl+C at a prompt ends the program quietly with exit code 130.

## The server

| Route                | Needs                     | Replies                                                                            |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `GET /accounts`      |                           | 200 with each account's id, owners and frozen flag                                 |
| `GET /accounts/:id`  | an account id in the path | 200 with the account's report, or 404 when no account has that id                  |
| `GET /my-accounts`   | an `x-owner` header       | 200 with that owner's accounts, or 401 when the header is missing                  |
| `POST /transactions` | a JSON transaction        | 201 with the transaction, 400 when the body is wrong, 409 when the bank refuses it |

Each route names the types of its replies for each status code. The body of `POST /transactions` is typed `unknown` and checked with the `isTransaction()` guard before it is used. Every error reply, including unknown routes and invalid JSON, has the same shape: `{ "error": "a message" }`.

```bash
curl -i localhost:3000/accounts/CHK-001
curl -i localhost:3000/accounts/NOPE                    # 404
curl -i localhost:3000/my-accounts                      # 401
curl -i -H "x-owner: Amira" localhost:3000/my-accounts
curl -i -X POST localhost:3000/transactions             # 400
curl -i -X POST -H "content-type: application/json" \
  -d '{"kind":"deposit","account":"CHK-001","amount":50}' localhost:3000/transactions   # 201
```

## The web page

`pnpm web` serves the page on http://localhost:5173. It lists the accounts, and clicking one shows its balance, totals and history. The server allows the page to call it with `@fastify/cors`.

- The page finds its root element with `document.querySelector("#app")`. If it is missing, the script writes a message in the page and stops.
- Every element is built with `createElement`, and its text set with `textContent`. Nothing sets `innerHTML`.
- The list has a single click listener, which finds the clicked account with `event.target` and `closest("button")` and removes itself once an account is picked. The Back button's listener removes itself too.

## When something goes wrong

Data that comes from outside a program is checked before it is used: the saved bank file, request bodies and headers on the server, command-line arguments, and every reply the services get from the server. When something fails, you get a message, never a stack trace or silence:

| Situation                                  | What you see                                                                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| The server is not running                  | `Cannot reach the bank server at http://localhost:3000. Start it with "pnpm api".`                                         |
| The account does not exist                 | `There is no account called "NOPE"`                                                                                        |
| The bank refuses a withdrawal              | The reason, such as `OLD-003 is frozen` or `CHK-001 only has $210.00, ...`                                                 |
| An amount on the command line is not valid | `The amount must be a number above zero.`                                                                                  |
| A server reply has the wrong shape         | `The bank server sent a reply to /accounts that does not have the expected shape`                                          |
| The saved bank file is missing or broken   | `There is no saved bank called "demo"`, `... is not valid JSON` or `... is missing a piece or has the wrong kind of piece` |
| Port 3000 is taken                         | `Port 3000 is already in use. Is the bank server already running?`                                                         |
| The page has no `#app` element             | `The page has no element with the id "app", so there is nowhere to show the bank.`                                         |

The command-line tool and the server exit with code 1 after printing the message. The web page shows the message in place of the accounts.

## Where to find each part of the course

| Topic                                    | Where it is                                                                                                                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interfaces, primitive types and arrays   | [`accounts/types.ts`](features/bank/src/accounts/types.ts) (`AccountDetails`)                                                                                                                 |
| Unions and narrowing                     | The `Transaction` union, `describe()` in [`accounts/transactions.ts`](features/bank/src/accounts/transactions.ts), `Ledger.record()`                                                          |
| Classes, string unions and records       | [`accounts/account.ts`](features/bank/src/accounts/account.ts) (private state, `Record<TransactionKind, number>`)                                                                             |
| Type guards and optional fields          | [`accounts/guards.ts`](features/bank/src/accounts/guards.ts), [`saved/guards.ts`](features/bank/src/saved/guards.ts) (`savedAt?`), [`replies/guards.ts`](features/bank/src/replies/guards.ts) |
| Workspace, catalog, Nx and CI            | [`pnpm-workspace.yaml`](pnpm-workspace.yaml), [`nx.json`](nx.json), [`.github/workflows`](.github/workflows)                                                                                  |
| Modlets and re-exports                   | Every `index.ts` inside a folder, and the `exports` map of `bank`                                                                                                                             |
| Reading a file with `await`              | [`saved/load.ts`](features/bank/src/saved/load.ts)                                                                                                                                            |
| Commander and Inquirer                   | [`apps/cli/src/index.ts`](apps/cli/src/index.ts), [`commands/report.ts`](apps/cli/src/commands/report.ts)                                                                                     |
| Fastify routes, plugins and status codes | [`apps/api/src/routes`](apps/api/src/routes)                                                                                                                                                  |
| `fetch`, generics, `Pick` and `Omit`     | [`services/services.ts`](features/bank/src/services/services.ts), `AccountSummary` and `AccountReport` in [`accounts/types.ts`](features/bank/src/accounts/types.ts)                          |
| The DOM                                  | [`apps/web/src`](apps/web/src)                                                                                                                                                                |

## Status

### What works

- Everything listed under [What it does](#what-it-does), in all three apps
- `pnpm lint` passes for every package, and every workflow passes on GitHub
- A fresh clone installs with `pnpm install` and runs with the commands above

### What doesn't yet

- Changes are not saved. The server keeps them in memory, and starts again from `demo.json` each time.
- The command-line tool can only withdraw, and the web page can only look. Deposits and transfers work in the server, but only through curl.
- The `x-owner` header is trusted as it is. There are no passwords or real sign-in.
- The server always runs on port 3000, and its address is fixed in the services.
- Amounts are plain JavaScript numbers, so cents can round in long histories.
- Asking for an account in `report` needs an interactive terminal.

### What I would add next

1. Write the ledger back to its JSON file after each transaction, so changes survive a restart.
2. Add `deposit` and `transfer` commands, and a form on the page to make transactions.
3. Read the server's port and address from an environment variable.
4. Add tests: unit tests for `Account` and the guards, and route tests with Fastify's `inject()`.
5. Store amounts as whole cents.
6. Move the ESLint and TypeScript settings that every package repeats into one shared tooling package.

## Tools

- **pnpm** workspaces with a catalog for shared versions, and **Nx** to run tasks across packages
- **TypeScript** with `strict` mode on, run directly by Node
- **Fastify** for the server, with **nodemon** to restart it on save
- **Commander** and **Inquirer** for the command-line tool
- **Vite** for the web page
- **ESLint** with the recommended JS and TypeScript rules, and **Prettier** for formatting
- **GitHub Actions**, with one workflow per package
