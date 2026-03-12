import { test, expect } from '@playwright/test'

test.describe('Navigation et pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[type="email"]', 'stephanie.vasquez16@hotmail.fr')
    await page.fill('input[type="password"]', 'Test@123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('http://localhost:3001/dashboard', { timeout: 10000 })
  })

  // FACTURES
  test('Accéder à la page factures', async ({ page }) => {
    await page.click('text=Mes factures')
    await expect(page).toHaveURL('http://localhost:3001/factures', { timeout: 10000 })
    await expect(page.locator('text=Mes factures')).toBeVisible()
  })

  // HISTORIQUE
  test('Accéder à la page historique', async ({ page }) => {
    await page.click('text=Historique')
    await expect(page).toHaveURL('http://localhost:3001/historique', { timeout: 10000 })
    await expect(page.locator('text=Historique')).toBeVisible()
  })

  // NOTIFICATIONS
  test('Accéder à la page notifications', async ({ page }) => {
    await page.click('text=Notifications')
    await expect(page).toHaveURL('http://localhost:3001/notifications', { timeout: 10000 })
    await expect(page.locator('text=Notifications')).toBeVisible()
  })

  // PROFIL
  test('Accéder à la page profil', async ({ page }) => {
    await page.click('text=Mon profil')
    await expect(page).toHaveURL('http://localhost:3001/profil', { timeout: 10000 })
    await expect(page.locator('text=Mon profil')).toBeVisible()
  })

  test('Modifier le profil', async ({ page }) => {
    await page.goto('http://localhost:3001/profil')
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 })
    await page.click('text=Changer mon mot de passe')
    await expect(page).toHaveURL('http://localhost:3001/reset-password', { timeout: 10000 })
  })

  // VÉHICULES
  test('Accéder à la page véhicules', async ({ page }) => {
    await page.click('text=Mes véhicules')
    await expect(page).toHaveURL('http://localhost:3001/vehicules', { timeout: 10000 })
    await expect(page.locator('text=Mes véhicules')).toBeVisible()
  })

  test('Voir le formulaire ajout véhicule', async ({ page }) => {
    await page.goto('http://localhost:3001/vehicules')
    await page.click('text=+ Ajouter un véhicule')
    await expect(page.locator('text=Nouveau véhicule')).toBeVisible({ timeout: 10000 })
  })

  // SUIVI TEMPS RÉEL
  test('Accéder à la page suivi', async ({ page }) => {
    await page.click('text=Suivi en temps réel')
    await expect(page).toHaveURL('http://localhost:3001/suivi', { timeout: 10000 })
    await expect(page.locator('text=Suivi').first()).toBeVisible()
  })
})