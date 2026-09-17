import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

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

  blogForm = form(this.blogModel, (s) => {
    // title validator
    required(s.title, { message: 'Titel ist erforderlich' });
    minLength(s.title, 3, { message: 'Titel muss mindestens 3 Zeichen lang sein' });
    maxLength(s.title, 100, { message: 'Titel darf maximal 100 Zeichen lang sein' });

    // aufgabe 3a: custom title validator
    validate(s.title, ({ value }) => {
      const title = value();
      // Regex Pattern für erlaubte Zeichen
      const pattern = /^[A-Za-zÄÖÜäöüß0-9 ]+$/;

      if (!pattern.test(title)) {
        return {
          kind: 'invalidCharacters',
          message: 'Titel darf nur Buchstaben, Zahlen und Leerzeichen enthalten',
        };
      }

      return null;
    });

    // content validator
    required(s.content, { message: 'Inhalt ist erforderlich' });
    minLength(s.content, 10, { message: 'Inhalt muss mindestens 10 Zeichen lang sein' });

    // category validator
    required(s.category, { message: 'Kategorie ist erforderlich' });

    // aufgabe 3b: Cross-Field validator
    validate(s.content, ({ value, valueOf }) => {
      const content = value();
      const title = valueOf(s.title);

      if (content.length < title.length * 2) {
        return {
          kind: 'contentTooShort',
          message: 'Inhalt muss mindestens doppelt so lang wie der Titel sein',
        };
      }

      return null;
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.blogForm, async () => {
      console.log(this.blogModel());
    });
  }
}
