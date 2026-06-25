import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogCardComponent } from './blog-card';
import { Blog } from '../../models/blog';

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
    }).compileComponents();

    fixture = TestBed.createComponent(BlogCardComponent);

    fixture.componentRef.setInput('model', mockBlog);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
