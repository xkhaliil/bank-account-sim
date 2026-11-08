import showAccount from "./account/index.ts"
import pickAccount from "./pick/index.ts"

const app = document.querySelector<HTMLElement>("#app")

if (app === null) {
  const message = 'The page has no element with the id "app", so there is nowhere to show the bank.'

  document.body.textContent = message
  throw new Error(message)
}

try {
  while (true) {
    const id = await pickAccount(app)

    await showAccount(app, id)
  }
} catch (error) {
  app.textContent = error instanceof Error ? error.message : String(error)
}
