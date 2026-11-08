import { describe, money } from "bank/accounts"
import { getAccount } from "bank/services"

function total(label: string, amount: number): HTMLElement {
  const row = document.createElement("div")
  const term = document.createElement("dt")
  const value = document.createElement("dd")

  term.textContent = label
  value.textContent = money(amount)
  row.append(term, value)

  return row
}

export default async function showAccount(app: HTMLElement, id: string): Promise<void> {
  const account = await getAccount(id)

  const back = document.createElement("button")
  back.type = "button"
  back.className = "back"
  back.textContent = "← Back to the accounts"

  const heading = document.createElement("h1")
  heading.textContent = account.id

  const owners = document.createElement("p")
  owners.textContent = `Owned by ${account.owners.join(" and ")}`

  if (account.isFrozen) {
    owners.textContent += " · frozen"
  }

  const balance = document.createElement("p")
  balance.className = "balance"
  balance.textContent = money(account.balance)

  const totals = document.createElement("dl")
  totals.append(
    total("Deposited", account.totals.deposit),
    total("Withdrawn", account.totals.withdrawal),
    total("Transferred", account.totals.transfer),
  )

  const historyHeading = document.createElement("h2")
  historyHeading.textContent = "History"

  const history = document.createElement("ol")

  for (const transaction of account.history) {
    const item = document.createElement("li")
    item.textContent = describe(transaction)
    history.append(item)
  }

  if (account.history.length === 0) {
    const item = document.createElement("li")
    item.textContent = "No transactions yet"
    history.append(item)
  }

  app.replaceChildren(back, heading, owners, balance, totals, historyHeading, history)

  return new Promise((resolve) => {
    function handleClick(): void {
      back.removeEventListener("click", handleClick)
      resolve()
    }

    back.addEventListener("click", handleClick)
  })
}
