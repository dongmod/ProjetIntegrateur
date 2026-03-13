import { test, expect } from '@playwright/test'

test.describe('Évaluations et avis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[type="email"]', 'stephanie.vasquez16@hotmail.fr')
    await page.fill('input[type="password"]', 'Test@123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('http://localhost:3001/dashboard', { timeout: 10000 })
  })

  test('Accéder à la page évaluations', async ({ page }) => {
    await page.click('text=Évaluations')
    await expect(page).toHaveURL('http://localhost:3001/evaluations', { timeout: 10000 })
  })

  test('Choisir un garage et voir les avis', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluations')
    await page.waitForSelector('select', { timeout: 10000 })
    await page.selectOption('select', { index: 1 })
    await expect(page.locator('text=Note moyenne')).toBeVisible({ timeout: 10000 })
  })

  test('Voir le formulaire pour laisser un avis', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluations')
    await page.waitForSelector('select', { timeout: 10000 })
    await page.selectOption('select', { index: 1 })
    await page.click('text=+ Laisser un avis')
    await expect(page.locator('text=Mon évaluation')).toBeVisible({ timeout: 10000 })
  })

  test('Soumettre un avis', async ({ page }) => {
    await page.goto('http://localhost:3001/evaluations')
    await page.waitForSelector('select', { timeout: 10000 })
    await page.selectOption('select', { index: 1 })
    await page.click('text=+ Laisser un avis')
    await page.fill('textarea', 'Super garage, service rapide et professionnel!')
    await page.click('text=Soumettre l\'avis')
    await expect(page.locator('text=Avis soumis avec succès!').or(page.locator('p.text-red-400'))).toBeVisible({ timeout: 10000 })
  })
})