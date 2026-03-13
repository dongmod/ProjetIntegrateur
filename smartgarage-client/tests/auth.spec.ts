import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('Connexion avec identifiants valides', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[type="email"]', 'stephanie.vasquez16@hotmail.fr')
    await page.fill('input[type="password"]', 'Test@123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('http://localhost:3001/dashboard', { timeout: 10000 })
  })

  test('Connexion avec identifiants invalides', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[type="email"]', 'faux@email.com')
    await page.fill('input[type="password"]', 'mauvais_mdp')
    await page.click('button[type="submit"]')
    await expect(page.locator('p.text-red-400')).toBeVisible({ timeout: 10000 })
  })

  test('Accès dashboard sans token redirige vers login', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard')
    await expect(page).toHaveURL('http://localhost:3001/login', { timeout: 10000 })
  })

  test('Déconnexion', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[type="email"]', 'stephanie.vasquez16@hotmail.fr')
    await page.fill('input[type="password"]', 'Test@123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('http://localhost:3001/dashboard', { timeout: 10000 })
    await page.click('text=Se déconnecter')
    await expect(page).toHaveURL('http://localhost:3001/login', { timeout: 10000 })
  })
})