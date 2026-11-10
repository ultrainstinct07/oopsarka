import { expect, test as base, type Page } from '@playwright/test'

/** Fails a test if the page logs errors or throws — "no obvious console errors". */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const text = message.text()
      // The browser logs the 404 document itself on purpose-built not-found tests.
      if (/Failed to load resource: the server responded with a status of 404/.test(text)) return
      errors.push(text)
    })
    await use(errors)
    expect(errors, 'console errors').toEqual([])
  },
})

export { expect }

export const KEY_PAGES = [
  '/',
  '/diary',
  '/diary/the-3-am-zoomies-incident',
  '/diary/a-gentle-grooming-routine-for-a-long-coated-cat',
  '/category/persian-life',
  '/tags/zoomies',
  '/categories',
  '/about',
  '/gallery',
  '/search?q=box',
  '/contact',
  '/newsletter',
  '/privacy',
]

export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
  })
}
