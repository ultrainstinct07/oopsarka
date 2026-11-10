import { buildDeck } from '../../src/lib/play/pairs'
import { expect, test } from './fixtures'

test.describe('the playroom', () => {
  test('Paw Pairs can be finished with the keyboard alone, and remembers the best score', async ({ page, consoleErrors }) => {
    void consoleErrors
    await page.goto('/play?game=pairs&seed=7')
    await page.getByRole('button', { name: 'Deal the cards' }).click()
    const cards = page.getByRole('list', { name: 'Cards' }).getByRole('button')
    await expect(cards).toHaveCount(12)

    // The shuffle depends only on the seed, so the same seed tells us where each pair lies.
    const layout = buildDeck(
      Array.from({ length: 6 }, (_, i) => ({ id: `f${i}`, src: '', label: '' })),
      6,
      7,
    )
    const pairs = new Map<string, number[]>()
    layout.forEach((card, index) => pairs.set(card.faceId, [...(pairs.get(card.faceId) ?? []), index]))
    const positions = [...pairs.values()]
    const turnOver = async (index: number) => {
      await cards.nth(index).focus()
      await page.keyboard.press('Enter')
    }

    // First, a deliberate wrong pair: both cards show, then turn back.
    const [first, second] = [positions[0][0], positions[1][0]]
    await turnOver(first)
    await expect(cards.nth(first)).not.toHaveAccessibleName(/face down/)
    await turnOver(second)
    await expect(page.getByRole('status').filter({ hasText: 'Not a match' })).toHaveCount(1)
    await expect(cards.nth(first)).toHaveAccessibleName(/face down/)
    await expect(cards.nth(second)).toHaveAccessibleName(/face down/)

    for (const [a, b] of positions) {
      await turnOver(a)
      await turnOver(b)
      await expect(cards.nth(b)).toHaveAccessibleName(/, matched$/)
    }
    await expect(page.getByText('Case closed in 7 moves.')).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: 'All pairs found' })).toHaveCount(1)

    await page.reload()
    await expect(page.getByText('7 moves', { exact: true })).toBeVisible()
  })

  test('arrow keys move between cards', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation')
    await page.goto('/play?game=pairs&seed=7')
    await page.getByRole('button', { name: 'Deal the cards' }).click()
    await page.getByRole('button', { name: 'Card 1, face down' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('button', { name: 'Card 2, face down' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('button', { name: 'Card 6, face down' })).toBeFocused()
  })

  test('Knock It Off scores a hit and ends when the time is up', async ({ page }) => {
    await page.goto('/play?game=knock&seconds=4')
    await page.getByRole('button', { name: 'Start knocking' }).click()
    await page
      .getByRole('button', { name: /^Knock off/ })
      .first()
      .click()
    await expect(page.getByText('Knocked off').locator('xpath=following-sibling::dd')).toHaveText('1')
    await expect(page.getByText(/^Time! \d+ knocked off/).first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible()
  })

  test('3 AM Zoomies waits for a choice under reduced motion, then runs', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/play?game=zoomies')
    await expect(page.getByText(/only starts if you choose to play/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Jump', exact: true })).toBeDisabled()
    await page.getByRole('button', { name: 'Play anyway' }).click()
    await expect(page.getByRole('button', { name: 'Jump', exact: true })).toBeEnabled()
    // Left alone, the run ends at the first obstacle.
    await expect(page.getByText(/^Tripped! Score \d+/)).toBeVisible({ timeout: 15_000 })
  })

  test('sound is off until switched on, and the choice is remembered', async ({ page }) => {
    await page.goto('/play')
    const toggle = page.getByRole('button', { name: /^Sound effects/ })
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveText('Sound effects: on')
    await page.reload()
    await expect(page.getByRole('button', { name: /^Sound effects/ })).toHaveAttribute('aria-pressed', 'true')
  })

  test('a clean streak in Knock It Off shows in the scoreboard', async ({ page }) => {
    await page.goto('/play?game=knock&seconds=30')
    await page.getByRole('button', { name: 'Start knocking' }).click()
    for (let hits = 0; hits < 3; hits++) {
      await page
        .getByRole('button', { name: /^Knock off/ })
        .first()
        .click()
    }
    await expect(page.getByText('Streak', { exact: true }).locator('xpath=following-sibling::dd')).toHaveText('3')
  })

  test('a finished round can be saved to the leaderboard under a name, and the name is remembered', async ({ page }) => {
    const finishRound = async () => {
      await page
        .getByRole('button', { name: /^Knock off/ })
        .first()
        .click()
      await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible({ timeout: 10_000 })
    }
    await page.goto('/play?game=knock&seconds=3')
    const board = page.getByRole('region', { name: 'Knock It Off leaderboard' })
    await expect(board.getByText('No scores saved on this device yet.', { exact: false })).toBeVisible()
    // The shared board is not configured in tests, so there is no "Everyone" option.
    await expect(board.getByRole('button', { name: 'Everyone' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Start knocking' }).click()
    await finishRound()
    await page.getByRole('button', { name: 'Save score' }).click()
    const name = page.getByLabel('Your name')
    await expect(name).toBeFocused()

    // A name is required, and odd characters are dropped.
    await board.getByRole('button', { name: 'Save my score' }).click()
    await expect(board.getByText('Please type a name', { exact: false })).toBeVisible()
    await name.fill('  Mira <3 ')
    await board.getByRole('button', { name: 'Save my score' }).click()
    await expect(board.getByRole('status')).toContainText('Saved as Mira 3. You are number 1 on this device.')
    const rows = board.getByRole('listitem')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('Mira 3')
    await expect(page.getByLabel('Your name')).toHaveCount(0)

    // It is still there after a reload, and the name is offered again next time.
    await page.reload()
    await expect(board.getByRole('listitem').first()).toContainText('Mira 3')
    await page.getByRole('button', { name: 'Start knocking' }).click()
    await finishRound()
    await expect(page.getByLabel('Your name')).toHaveValue('Mira 3')
    await board.getByRole('button', { name: 'Save my score' }).click()
    await expect(board.getByRole('listitem')).toHaveCount(2)
  })

  test('each game keeps its own leaderboard', async ({ page }) => {
    await page.goto('/play')
    await expect(page.getByRole('region', { name: 'Knock It Off leaderboard' })).toBeVisible()
    await page.getByRole('button', { name: /^Paw Pairs/ }).click()
    await expect(page.getByRole('region', { name: 'Paw Pairs leaderboard' })).toBeVisible()
    await page.getByRole('button', { name: /^3 AM Zoomies/ }).click()
    await expect(page.getByRole('region', { name: '3 AM Zoomies leaderboard' })).toBeVisible()
  })

  test('the homepage links to the playroom without downloading any game', async ({ page }) => {
    const scripts: string[] = []
    page.on('response', (response) => {
      if (response.request().resourceType() === 'script') scripts.push(response.url())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const before = scripts.length
    await page.getByRole('link', { name: 'Enter the playroom' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('playroom')
    await expect(page.getByRole('button', { name: 'Start knocking' })).toBeVisible()
    // Opening the playroom is what fetches game code.
    expect(scripts.length).toBeGreaterThan(before)
  })
})
