import {test,expect} from '@playwright/test';

test('complete study workflow, navigation, autosave, and backup restore',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('./');
  await expect(page.getByRole('heading',{name:'Your learning journey.'})).toBeVisible();
  await expect(page.getByRole('progressbar',{name:'Overall completion'})).toHaveAttribute('aria-valuenow','0');
  await page.getByRole('link',{name:'Start your first session'}).click();
  await page.getByLabel('Notes & reflections').fill('A linear predictor needs a weight and a bias. מחשבות');
  await page.getByLabel('New checklist step').fill('Plot the prediction');
  await page.getByRole('button',{name:'Add',exact:true}).click();
  await page.getByRole('checkbox',{name:'Complete step: Plot the prediction'}).check();
  await page.locator('summary').filter({hasText:'Personal hints'}).click();
  await page.locator('#hint').fill('Change one parameter at a time');
  await page.locator('summary').filter({hasText:'Personal solution'}).click();
  await page.locator('#solution').fill('My personal solution, not a supplied answer');
  await page.getByLabel('Add a resource').fill('https://example.com/learning');
  await page.getByRole('button',{name:'Add link'}).click();
  await page.getByRole('button',{name:'Mark complete'}).click();
  await page.getByLabel('Completion date (your local time)').fill('2026-10-20T12:30');
  await page.reload();
  await expect(page.getByLabel('Notes & reflections')).toHaveValue('A linear predictor needs a weight and a bias. מחשבות');
  await expect(page.getByRole('checkbox',{name:'Complete step: Plot the prediction'})).toBeChecked();
  await expect(page.locator('#hint')).not.toBeVisible();
  await expect(page.locator('#solution')).not.toBeVisible();
  await expect(page.getByRole('button',{name:'Reopen session'})).toBeVisible();
  await page.getByRole('link',{name:'Week 1',exact:true}).click();
  await expect(page.getByRole('button',{name:/WEEK 1 · DAYS 1–7/})).toHaveAttribute('aria-expanded','true');
  await page.getByRole('button',{name:'Completed',exact:true}).click();
  await expect(page.locator('.exercise-row')).toHaveCount(1);
  await page.getByRole('link',{name:'Overview',exact:true}).first().click();
  await expect(page.getByRole('progressbar',{name:'Overall completion'})).toHaveAttribute('aria-valuenow','1');
  await page.getByRole('link',{name:'Settings & backup'}).click();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export JSON backup'}).click();
  const download=await downloadPromise;const path=await download.path();
  const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('study-tracker:v1')!));
  await page.getByRole('button',{name:'Reset all study data'}).click();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('study-tracker:v1')!))).toEqual(snapshot);
  await page.getByRole('button',{name:'Reset all study data'}).click();
  await page.getByRole('button',{name:'Confirm replacement'}).click();
  await page.getByLabel('Import JSON backup').setInputFiles(path!);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Confirm replacement'}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('study-tracker:v1')!))).toEqual(snapshot);
  await page.getByLabel('Import JSON backup').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{broken')});
  await expect(page.getByRole('alert')).toContainText('not valid JSON');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('study-tracker:v1')!))).toEqual(snapshot);
  await page.goto('./#/exercise/ai-w1-d1');
  await page.getByRole('button',{name:'Reopen session'}).click();
  await expect(page.getByLabel('Notes & reflections')).toHaveValue(snapshot.exercises['ai-w1-d1'].notes);
  await page.reload();
  await expect(page.getByRole('button',{name:'Mark complete'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile layout, theme, keyboard, and all course routes',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('./');
  await page.screenshot({path:'test-results/dashboard-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  for(const course of ['ai','fusion','linux']){
    await page.goto(`./#/course/${course}`);
    await page.reload();
    await expect(page.locator('.week')).toHaveCount(6);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.goto('./#/exercise/fusion-w4-d28');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('./#/settings');
  await page.getByRole('button',{name:'Dark',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.goto('./');
  await page.screenshot({path:'test-results/dashboard-dark-mobile.png',fullPage:true});
  await page.goto('./#/settings');
  await page.getByRole('button',{name:'Light',exact:true}).click();
  await page.setViewportSize({width:1440,height:1100});
  await page.goto('./');
  await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true});
});

test('corrupt storage remains untouched until explicit recovery',async({page})=>{
  await page.goto('./');
  await page.evaluate(()=>localStorage.setItem('study-tracker:v1','broken-data'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Autosave is paused');
  await page.getByRole('link',{name:'Start your first session'}).click();
  await page.getByLabel('Notes & reflections').fill('Unsaved recovery notes');
  expect(await page.evaluate(()=>localStorage.getItem('study-tracker:v1'))).toBe('broken-data');
  await page.getByRole('link',{name:'Settings & backup'}).click();
  await expect(page.getByRole('button',{name:'Download original storage'})).toBeVisible();
});

test('lesson videos match the objective, remain keyboard-accessible, and preserve personal references',async({page})=>{
  const cases=[
    ['ai-w1-d1','Linear Regression FROM SCRATCH'],
    ['ai-w6-d37','Let’s build GPT'],
    ['fusion-w4-d25','Geneva Mechanism'],
    ['linux-w1-d3','What is waitpid?'],
    ['linux-w4-d26','Debugging Race Conditions with ThreadSanitizer'],
    ['linux-w6-d39','How to Reverse a Linked List in C'],
  ];
  for(const [id,title] of cases) {
    await page.goto(`./#/exercise/${id}`);
    const section=page.getByRole('region',{name:'Related YouTube videos'});
    await expect(section.getByRole('link')).toHaveCount(2);
    const link=section.getByRole('link',{name:new RegExp(title.replace(/[?]/g,'\\?'))}).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href',/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
    await expect(link).toHaveAttribute('target','_blank');
    await expect(link).toHaveAttribute('rel','noopener noreferrer');
    await link.focus();await expect(link).toBeFocused();
    await expect(page.locator('iframe')).toHaveCount(0);
  }
  await page.getByLabel('Notes & reflections').fill('Video helped me understand pointer reassignment.');
  await page.getByLabel('Add a resource').fill('https://example.com/my-reference');
  await page.getByRole('button',{name:'Add link'}).click();
  await page.reload();
  await expect(page.getByLabel('Notes & reflections')).toHaveValue('Video helped me understand pointer reassignment.');
  await expect(page.locator('.references a')).toHaveAttribute('href','https://example.com/my-reference');
  await expect(page.getByRole('button',{name:'Mark complete'})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('region',{name:'Related YouTube videos'}).screenshot({path:'test-results/lesson-videos-mobile.png'});
  await page.setViewportSize({width:1440,height:1100});
  await page.getByRole('region',{name:'Related YouTube videos'}).screenshot({path:'test-results/lesson-videos-desktop.png'});
});
