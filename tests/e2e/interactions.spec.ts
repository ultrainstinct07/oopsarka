import { expect, test } from './fixtures'

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only')

  test('opens as a dialog, traps focus, closes with Escape and returns focus', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Open menu' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Menu' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('link', { name: "Arka's Diary" })).toBeVisible()
    for (let i = 0; i < 15; i++) await page.keyboard.press('Tab')
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('navigates and closes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'About Arka' }).click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
  })
})

test.describe('search', () => {
  test('the search page finds stories, forgives typos and has an empty state', async ({ page }) => {
    await page.goto('/search')
    await page.getByRole('searchbox', { name: 'Search stories' }).fill('zoomys')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/q=zoomys/)
    await expect(page.getByRole('link', { name: /The 3 AM Zoomies Incident/ })).toBeVisible()
    await page.goto('/search?q=xylophone')
    await expect(page.getByText('Arka searched under the sofa')).toBeVisible()
  })

  test('the ⌘K dialog works from the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard shortcut is a desktop affordance')
    await page.goto('/about')
    await page.waitForLoadState('networkidle') // the shortcut is wired up on hydration
    await page.keyboard.press('Control+k')
    const dialog = page.getByRole('dialog', { name: 'Search the diary' })
    await expect(dialog).toBeVisible()
    const input = dialog.getByRole('combobox', { name: 'Search stories' })
    await expect(input).toBeFocused()
    await input.fill('cardboard')
    await expect(dialog.getByRole('option').first()).toContainText('Cardboard')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/an-extremely-serious-review-of-cardboard-boxes/)
  })

  test('the header search control is a real link without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('header a[href="/search"]')).toBeVisible()
    await context.close()
  })
})

test.describe('gallery lightbox', () => {
  test('opens, moves with the arrow keys, closes with Escape and restores focus', async ({ page }) => {
    await page.goto('/gallery')
    const first = page.getByRole('button', { name: /Open exhibit A/ })
    await first.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Exhibit A')
    await page.keyboard.press('ArrowRight')
    await expect(dialog).toContainText('Exhibit B')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog).toContainText('Exhibit G')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(first).toBeFocused()
  })

  test('filters photos and clips', async ({ page }) => {
    await page.goto('/gallery')
    await page.getByRole('button', { name: /^Clips/ }).click()
    await expect(page.getByRole('button', { name: /Open exhibit/ })).toHaveCount(2)
    await page.getByRole('button', { name: /^All evidence/ }).click()
    await expect(page.getByRole('button', { name: /Open exhibit/ })).toHaveCount(7)
  })
})

test.describe('forms are honest', () => {
  test('newsletter validates inline and does not pretend to subscribe without a provider', async ({ page }) => {
    await page.goto('/newsletter')
    await page.waitForLoadState('networkidle')
    const form = page.locator('main form').first()
    if ((await form.count()) === 0) {
      // Production build without BUTTONDOWN_API_KEY: no form, no collection.
      await expect(page.getByText('The newsletter opens soon')).toBeVisible()
      return
    }
    await form.getByRole('button', { name: 'Subscribe' }).click()
    await expect(form.getByText(/enter your email/i)).toBeVisible()
    await expect(form.getByLabel('Your email address')).toBeFocused()
  })

  test('contact form validates and never fakes a successful send', async ({ page }) => {
    await page.goto('/contact')
    const form = page.locator('main form').first()
    if ((await form.count()) === 0) {
      await expect(page.getByText(/mailbox isn.t open yet/)).toBeVisible()
      return
    }
    await form.getByRole('button', { name: /send to arka/i }).click()
    await expect(form.getByText('Please tell us your name.')).toBeVisible()
    await expect(page.getByText(/Thank you/)).toHaveCount(0)
  })
})

test.describe('display preferences', () => {
  test('3 AM mode and Calm mode persist across reloads', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    await page.getByRole('button', { name: '3 AM mode' }).last().click()
    await expect(html).toHaveAttribute('data-theme', 'night')
    await page
      .getByRole('button', { name: /Calm mode/ })
      .last()
      .click()
    await expect(html).toHaveAttribute('data-calm', 'true')
    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'night')
    await expect(html).toHaveAttribute('data-calm', 'true')
  })
})
