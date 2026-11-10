import AxeBuilder from '@axe-core/playwright'
import { expect, KEY_PAGES, test } from './fixtures'

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const theme of ['light', 'night'] as const) {
    for (const path of KEY_PAGES) {
      test(`${theme}: ${path}`, async ({ page }) => {
        if (theme === 'night') {
          await page.addInitScript(() => localStorage.setItem('oopsarka:theme', 'night'))
        }
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(path)
        await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {})
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze()
        const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
        expect(serious.map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`)).toEqual([])
      })
    }
  }

  test('lightbox dialog is accessible when open', async ({ page }) => {
    await page.goto('/gallery')
    await page.getByRole('button', { name: /Open exhibit A/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
    expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('no moving tape, no 3D, no autoplaying video', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2500)
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /pause the tape/i })).toHaveCount(0)
    const playing = await page.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused).length)
    expect(playing).toBe(0)
  })
})

test.describe('responsive layout', () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`no horizontal scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ['/', '/diary/why-my-human-cant-use-the-bathroom-alone', '/gallery', '/about', '/contact']) {
        await page.goto(path)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1)
      }
    })
  }
})

test.describe('SEO', () => {
  test('canonical and Open Graph URLs use the production domain', async ({ page }) => {
    await page.goto('/diary/the-3-am-zoomies-incident')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://oopsarka.space/diary/the-3-am-zoomies-incident',
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://oopsarka.space/diary/the-3-am-zoomies-incident',
    )
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /^https:\/\/oopsarka\.space\//)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.some((text) => text.includes('"BlogPosting"'))).toBe(true)
    expect(jsonLd.some((text) => text.includes('"BreadcrumbList"'))).toBe(true)
  })

  test('every page has a unique title and description', async ({ page }) => {
    const titles = new Set<string>()
    for (const path of ['/', '/diary', '/about', '/gallery', '/contact', '/categories', '/category/persian-life']) {
      await page.goto(path)
      const title = await page.title()
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0).toBeGreaterThan(40)
      titles.add(title)
    }
    expect(titles.size).toBe(7)
  })

  test('feeds and crawler files are valid', async ({ request }) => {
    const rss = await request.get('/rss.xml')
    expect(rss.headers()['content-type']).toContain('application/rss+xml')
    const xml = await rss.text()
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('https://oopsarka.space/diary/')

    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('<loc>https://oopsarka.space/diary/the-3-am-zoomies-incident</loc>')
    expect(sitemap).not.toContain('/studio')
    expect(sitemap).not.toContain('/search')

    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toMatch(/Disallow: \/(studio)?/)

    const index = await request.get('/search-index.json')
    expect((await index.json()).recent.length).toBeGreaterThan(0)
  })
})
