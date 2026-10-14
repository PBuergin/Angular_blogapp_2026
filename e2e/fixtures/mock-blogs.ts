import type { Page } from '@playwright/test';

const blogs = [
  {
    id: 1,
    title: 'Playwright Test Blog',
    contentPreview: 'Ein Blog-Eintrag für automatisierte Tests.',
    author: 'Testautor',
    likes: 0,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    headerImageUrl: '',
    createdAt: '2026-10-14T12:00:00Z',
    updatedAt: '2026-10-14T12:00:00Z',
  },
];

export async function mockBlogApi(page: Page): Promise<void> {
  await page.route('**/api/entries', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: blogs,
        maxPageSize: 100,
        pageIndex: 0,
        pageSize: blogs.length,
        totalCount: blogs.length,
      }),
    });
  });
}
