import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-blog-create',
  imports: [FormField],
  templateUrl: './blog-create.html',
  styleUrl: './blog-create.scss',
})
export class BlogCreate {
  blogModel = signal({
    title: '',
    content: '',
    category: 'general',
  });

  blogForm = form(this.blogModel);

  onSubmit(event: Event) {
    event.preventDefault();
    console.log(this.blogModel());
  }
}
