# Bank Account Simulator

A small command-line bank account simulator written in TypeScript.

## What it will do

- Open accounts for different people
- Deposit and withdraw money
- Block withdrawals that would make the balance go negative
- Transfer money between accounts
- Keep a history of every transaction

The idea is to keep the balance private inside an `Account` class so it can only change through methods like `deposit()` and `withdraw()`, not by editing it directly.

## Layout

| File                                                 | What it holds                                              |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| [`src/lib/types.ts`](src/lib/types.ts)               | `AccountDetails` and the `Transaction` union               |
| [`src/lib/transactions.ts`](src/lib/transactions.ts) | `describe()`, which handles every kind of transaction      |
| [`src/lib/account.ts`](src/lib/account.ts)           | The `Account` class with its private balance and totals    |
| [`src/lib/load.ts`](src/lib/load.ts)                 | The type guards that check a saved bank before it is used  |
| [`src/data.ts`](src/data.ts)                         | The accounts                                               |
| [`src/saved.ts`](src/saved.ts)                       | The saved bank text, plus broken saves to test the guard   |
| [`src/index.ts`](src/index.ts)                       | Loads the bank, replays its history and prints the reports |

Run it straight from the source with `node src/index.ts` (Node 22.18 or newer).

## Setup

You need Node.js (v20 or newer).

```bash
npm install
```

## Scripts

| Command                | What it does                         |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Run the project with tsx (no build)  |
| `npm run build`        | Compile TypeScript into `dist/`      |
| `npm start`            | Run the compiled code                |
| `npm run typecheck`    | Check types without building         |
| `npm run lint`         | Run ESLint                           |
| `npm run lint:fix`     | Run ESLint and fix what it can       |
| `npm run format`       | Format everything with Prettier      |
| `npm run format:check` | Check formatting without changing it |

## Tools

- **TypeScript** with `strict` mode on
- **ESLint** with the recommended JS and TypeScript rules
- **Prettier** for formatting (no semicolons, double quotes, 100 character lines)
