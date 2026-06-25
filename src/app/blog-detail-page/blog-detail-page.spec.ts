import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BlogDetailPageComponent } from './blog-detail-page';

describe('BlogDetailPageComponent', () => {
  let component: BlogDetailPageComponent;
  let fixture: ComponentFixture<BlogDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetailPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetailPageComponent);
    fixture.componentRef.setInput('id', '1');

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
