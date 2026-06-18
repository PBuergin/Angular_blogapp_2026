import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogOverviewPageComponent } from './blog-overview-page';

describe('BlogOverviewPage', () => {
  let component: BlogOverviewPageComponent;
  let fixture: ComponentFixture<BlogOverviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogOverviewPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogOverviewPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
