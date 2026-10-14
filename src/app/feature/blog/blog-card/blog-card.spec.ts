import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BlogCardComponent } from './blog-card';
import { Blog } from '../../../../models/blog';
import { vi } from 'vitest';

describe('BlogCardComponent', () => {
  let component: BlogCardComponent;
  let fixture: ComponentFixture<BlogCardComponent>;

  const mockBlog: Blog = {
    id: 1,
    title: 'Test Blog',
    contentPreview: 'Test Preview',
    author: 'Test Author',
    likes: 0,
    comments: 0,
    likedByMe: false,
    createdByMe: false,
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCardComponent);
    fixture.componentRef.setInput('model', mockBlog);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the blog title', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Test Blog');
  });

  it('should display the blog author', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Test Author');
  });

  it('should emit blog ID when like button is clicked', () => {
    const emitSpy = vi.spyOn(component.liked, 'emit');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    button.click();

    expect(emitSpy).toHaveBeenCalledWith(1);
  });
});
