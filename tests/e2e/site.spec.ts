import { expect, KEY_PAGES, scrollThrough, test } from './fixtures'

test.describe('pages', () => {
  for (const path of KEY_PAGES) {
    test(`${path} renders with one h1, no broken images and no console errors`, async ({ page, consoleErrors }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
      await scrollThrough(page)
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {})
      const broken = await page.evaluate(() =>
        [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
      )
      expect(broken).toEqual([])
      expect(consoleErrors).toEqual([])
    })
  }

  test('unknown URLs return a real 404 page', async ({ page }) => {
    for (const path of ['/definitely-not-here', '/diary/no-such-story', '/category/nope', '/diary/page/99']) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBe(404)
      await expect(page.getByRole('heading', { level: 1 })).toContainText('knocked off')
    }
  })
})

test.describe('navigation', () => {
  test('every internal link on the main pages resolves', async ({ page, request }) => {
    const seen = new Set<string>()
    for (const path of ['/', '/diary', '/about', '/gallery', '/categories']) {
      await page.goto(path)
      const hrefs = await page.$$eval('a[href^="/"]', (links) => links.map((a) => (a as HTMLAnchorElement).getAttribute('href')!))
      for (const href of hrefs) seen.add(href.split('#')[0])
    }
    const failures: string[] = []
    for (const href of seen) {
      const response = await request.get(href, { maxRedirects: 5 })
      if (response.status() >= 400) failures.push(`${response.status()} ${href}`)
    }
    expect(failures).toEqual([])
    expect(seen.size).toBeGreaterThan(25)
  })

  test('the diary paginates with real links', async ({ page }) => {
    await page.goto('/diary')
    await page.getByRole('navigation', { name: 'Pagination' }).getByRole('link', { name: /older/i }).click()
    await expect(page).toHaveURL(/\/diary\/page\/2$/)
    await expect(page.getByRole('navigation', { name: 'Pagination' }).locator('[aria-current="page"]')).toHaveText('2')
    await page.getByRole('link', { name: /newer/i }).click()
    await expect(page).toHaveURL(/\/diary$/)
  })

  test('category and tag archives filter stories', async ({ page }) => {
    await page.goto('/category/persian-life')
    const titles = page.locator('main article h2')
    await expect(titles.first()).toBeVisible()
    expect(await titles.count()).toBeGreaterThanOrEqual(5)
    await page.goto('/tags/boxes')
    await expect(page.getByRole('link', { name: 'An Extremely Serious Review of Cardboard Boxes' })).toBeVisible()
  })
})

test.describe('article', () => {
  test('has breadcrumbs, metadata, a table of contents and related stories', async ({ page, isMobile }) => {
    await page.goto('/diary/the-3-am-zoomies-incident')
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Oops Moments')
    await expect(page.locator('time').first()).toHaveAttribute('datetime', /2026-10-23/)
    await expect(page.getByText(/min read/).first()).toBeVisible()
    await expect(page.getByText('This is sample content', { exact: false })).toBeVisible()
    // On small screens the outline lives in a collapsed "In this story" disclosure.
    if (isMobile) await page.getByText('In this story').first().click()
    const toc = page.getByRole('navigation', { name: /in this story|on this page/i }).first()
    await expect(toc.locator('a').first()).toHaveAttribute('href', /^#/)
    await expect(page.getByRole('heading', { name: /related/i })).toBeVisible()
    await expect(
      page
        .getByRole('link', { name: '#Zoomies' })
        .or(page.getByRole('link', { name: 'Zoomies' }))
        .first(),
    ).toBeVisible()
  })
})
