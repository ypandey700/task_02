import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('combined filters, empty state, reset, keyboard dialog and focus return',async({page}) => {
  await page.goto('/');await expect(page.locator('.card')).toHaveCount(5);
  await page.getByLabel('Search internships',{exact:true}).fill('SQL');await expect(page.locator('.card')).toHaveCount(2);
  await page.getByLabel('Domain',{exact:true}).selectOption('Full Stack Development');await expect(page.locator('.card')).toHaveCount(1);
  await page.getByLabel('Work mode',{exact:true}).selectOption('Remote');await expect(page.getByText('A different search, a new possibility.')).toBeVisible();
  await page.getByRole('button',{name:'Clear filters'}).click();await expect(page.locator('.card')).toHaveCount(5);await expect(page.locator('#search')).toBeFocused();
  const first = page.getByRole('button',{name:'View details for Frontend Intern'});await first.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('button',{name:'Close internship details'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Close internship details'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(first).toBeFocused();
});
test('network errors have a working retry',async({page}) => {
  await page.route('**/data/internships.json',route => route.fulfill({status:503,body:'Unavailable'}));
  await page.goto('/');await expect(page.getByRole('alert')).toContainText('A small bump in the road.');
  await page.unroute('**/data/internships.json');await page.getByRole('button',{name:'Try again'}).click();await expect(page.locator('.card')).toHaveCount(5);
});
test('malformed records produce error state',async({page}) => {
  await page.route('**/data/internships.json',route => route.fulfill({contentType:'application/json',body:'{"internships":[{}]}'}));await page.goto('/');await expect(page.getByRole('alert')).toBeVisible();
});
test('loading is exposed until the data is ready',async({page}) => {
  let release;const gate = new Promise(resolve => release = resolve);
  await page.route('**/data/internships.json',async route => {await gate;await route.continue();});
  await page.goto('/');await expect(page.locator('#results')).toHaveAttribute('aria-busy','true');await expect(page.getByText('Finding your starting point…')).toBeVisible();release();await expect(page.locator('.card')).toHaveCount(5);await expect(page.locator('#results')).toHaveAttribute('aria-busy','false');
});
for(const width of [360,768,1440]) test(`layout and screenshot at ${width}px`,async({page}) => {
  const errors = [];page.on('pageerror',error => errors.push(error.message));
  await page.setViewportSize({width,height:1000});await page.goto('/');await expect(page.locator('.card')).toHaveCount(5);await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('.cards').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(width === 360 ? 1 : width === 768 ? 2 : 3);
  await mkdir('docs/screenshots',{recursive:true});await mkdir('dist/screenshots',{recursive:true});
  await page.screenshot({path:`docs/screenshots/board-${width}.png`,fullPage:true});await page.screenshot({path:`dist/screenshots/board-${width}.png`,fullPage:true});expect(errors).toEqual([]);
});
