import { test, expect } from '@playwright/test'

test.describe('Rendez-vous', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[type="email"]', 'stephanie.vasquez16@hotmail.fr')
    await page.fill('input[type="password"]', 'Test@123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('http://localhost:3001/dashboard', { timeout: 10000 })
  })

  test('Accéder à la page rendez-vous', async ({ page }) => {
    await page.click('text=Mes rendez-vous')
    await expect(page).toHaveURL('http://localhost:3001/rendezvous', { timeout: 10000 })
  })

  test('Voir le formulaire de prise de rendez-vous', async ({ page }) => {
    await page.goto('http://localhost:3001/rendezvous')
    await page.click('text=+ Prendre un rendez-vous')
    await expect(page.locator('text=Nouveau rendez-vous')).toBeVisible({ timeout: 10000 })
  })

  test('Voir les créneaux disponibles', async ({ page }) => {
    await page.goto('http://localhost:3001/rendezvous')
    await page.click('text=+ Prendre un rendez-vous')
    await page.waitForSelector('select', { timeout: 10000 })
    const selects = page.locator('select')
    // Sélectionner le service (3ème select)
    await selects.nth(2).selectOption({ index: 1 })
    const today = new Date()
    today.setDate(today.getDate() + 1)
    const dateStr = today.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateStr)
    await expect(page.locator('text=Créneaux disponibles').or(page.locator('text=Aucun créneau disponible'))).toBeVisible({ timeout: 10000 })
  })
})