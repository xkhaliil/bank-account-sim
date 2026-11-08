import { listAccounts } from "bank/services"

export default async function pickAccount(app: HTMLElement): Promise<string> {
  const accounts = await listAccounts()

  const heading = document.createElement("h1")
  heading.textContent = "Accounts"

  const hint = document.createElement("p")
  hint.textContent = "Pick an account to see its balance and history."

  const list = document.createElement("ul")
  list.className = "accounts"

  for (const account of accounts) {
    const button = document.createElement("button")
    button.type = "button"
    button.dataset.id = account.id
    button.textContent = `${account.id} · ${account.owners.join(" and ")}`

    if (account.isFrozen) {
      button.textContent += " (frozen)"
    }

    const item = document.createElement("li")
    item.append(button)
    list.append(item)
  }

  app.replaceChildren(heading, hint, list)

  return new Promise((resolve) => {
    function handleClick(event: MouseEvent): void {
      if (!(event.target instanceof Element)) {
        return
      }

      const button = event.target.closest("button")

      if (button === null || button.dataset.id === undefined) {
        return
      }

      list.removeEventListener("click", handleClick)
      resolve(button.dataset.id)
    }

    list.addEventListener("click", handleClick)
  })
}
