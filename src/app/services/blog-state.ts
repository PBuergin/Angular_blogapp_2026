// Aufgabe (08-1-1)
import { inject, computed, Injectable, signal } from '@angular/core';
import { Blog } from '../../models/blog';
import { BlogService } from '../feature/blog/blog.service';

// Aufgabe (08-1-2)
interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  selectedAuthor: string;
}

@Injectable({
  providedIn: 'root',
})
export class BlogStateService {
  private readonly blogService = inject(BlogService);

  readonly #state = signal<BlogState>({
    blogs: [],
    loading: false,
    error: null,
    selectedAuthor: 'all',
  });

  // *** öffentliche computed() Selektoren: (08-1-3) ***
  // Blog-Liste
  readonly blogs = computed(() => this.#state().blogs);
  // Ladezustand
  readonly loading = computed(() => this.#state().loading);
  // Fehlermeldung
  readonly error = computed(() => this.#state().error);
  // Anzahl der Blogs
  readonly blogCount = computed(() => this.blogs().length);
  // selektierter Autor
  readonly selectedAuthor = computed(() => this.#state().selectedAuthor);
  // alle Autoren
  readonly authors = computed(() => {
    const authors = this.blogs().map((blog) => blog.author);
    return [...new Set(authors)];
  });
  // blogs nach selektiertem Autor filtern
  readonly filteredBlogs = computed(() => {
    const author = this.selectedAuthor();
    if (author === 'all') {
      return this.blogs();
    }
    return this.blogs().filter((blog) => blog.author === author);
  });

  // *** private (#) Reducer: (08-1-4) ***

  #loadStarted(): void {
    this.#state.update((state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  }

  #loadSucceeded(blogs: Blog[]): void {
    this.#state.update((state) => ({
      ...state,
      blogs,
      loading: false,
    }));
  }

  #loadFailed(message: string): void {
    this.#state.update((state) => ({
      ...state,
      error: message,
      loading: false,
    }));
  }

  #likeToggled(id: number): void {
    this.#state.update((state) => ({
      ...state,
      blogs: state.blogs.map((blog) =>
        blog.id === id
          ? {
              ...blog,
              likedByMe: !blog.likedByMe,
              likes: blog.likedByMe ? blog.likes - 1 : blog.likes + 1,
            }
          : blog,
      ),
    }));
  }

  #authorSelected(author: string): void {
    this.#state.update((state) => ({
      ...state,
      selectedAuthor: author,
    }));
  }

  // Actions (08-1-5)
  async loadBlogs(): Promise<void> {
    this.#loadStarted();

    try {
      const blogs = await this.blogService.getBlogs();
      this.#loadSucceeded(blogs);
    } catch {
      this.#loadFailed('Blogs konnten nicht geladen werden.');
    }
  }

  toggleLike(id: number): void {
    this.#likeToggled(id);
  }

  setAuthor(author: string): void {
    this.#authorSelected(author);
  }
}
