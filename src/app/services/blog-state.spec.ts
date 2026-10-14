import { TestBed } from '@angular/core/testing';
import { BlogStateService } from './blog-state';
import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { BlogService } from '../feature/blog/blog.service';
import { Blog } from '../../models/blog';

describe('BlogState', () => {
  let service: BlogStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BlogService,
          useValue: {
            getBlogs: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    });

    service = TestBed.inject(BlogStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty blogs array', () => {
    expect(service.blogs()).toEqual([]);
  });

  it('should update loading state', async () => {
    let finishLoading!: (blogs: Blog[]) => void;

    const pendingRequest = new Promise<Blog[]>((resolve) => {
      finishLoading = resolve;
    });

    const blogService = TestBed.inject(BlogService);

    vi.mocked(blogService.getBlogs).mockReturnValue(pendingRequest);

    expect(service.loading()).toBe(false);

    const loadingPromise = service.loadBlogs();

    expect(service.loading()).toBe(true);

    finishLoading([]);

    await loadingPromise;

    expect(service.loading()).toBe(false);
  });

  it('should calculate blog count', async () => {
    const testBlogs = [{ id: 1 }, { id: 2 }, { id: 3 }] as Blog[];

    const blogService = TestBed.inject(BlogService);

    vi.mocked(blogService.getBlogs).mockResolvedValue(testBlogs);

    await service.loadBlogs();

    expect(service.blogCount()).toBe(3);

    vi.mocked(blogService.getBlogs).mockResolvedValue([]);

    await service.loadBlogs();

    expect(service.blogCount()).toBe(0);
  });
});
