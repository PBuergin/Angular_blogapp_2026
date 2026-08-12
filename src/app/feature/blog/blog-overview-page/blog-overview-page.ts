/*
1. Angular-Imports
Component   benötigen wir wieder für:   @Component({...})
Damit wird die Klasse als Angular-Komponente definiert.
inject   dient der Dependency Injection.
Damit kann sich die Komponente beispielsweise einen Service von Angular geben lassen:
private blogService = inject(BlogService);
OnInit   ist ein sogenanntes Lifecycle Interface.
Die Komponente implementiert später:   implements OnInit
und bekommt dadurch die Lifecycle-Methode:   ngOnInit()
Diese wird von Angular während der Initialisierung der Komponente aufgerufen.
signal   Damit werden reaktive Zustände angelegt, beispielsweise:
signal(false)   oder:   signal<Blog[]>([])
*/
import { Component, inject, OnInit, signal } from '@angular/core';

/*
Hier wird die BlogCardComponent importiert.
*/
import { BlogCardComponent } from '../blog-card/blog-card';

/*
Blog beschreibt die Struktur eines Blog-Objekts.
*/
import { Blog } from '../../../../models/blog';

/*
Jetzt wird der BlogService importiert.
Dieser ist für den Zugriff auf die Blog-Daten zuständig.
Die Overview-Komponente lädt also nicht selbst direkt Daten, 
sondern delegiert diese Aufgabe an: BlogService
*/
import { BlogService } from '../blog.service';

// Angular Material importieren.
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-blog-overview-page',
  standalone: true,
  imports: [BlogCardComponent, MatButtonModule, MatIconModule],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})

// Klasse implementiert das Angular-Lifecycle-Interface OnInit.
export class BlogOverviewPageComponent implements OnInit {
  isDarkMode = false;

  // Instanz des BlogService bereitstellen
  private blogService = inject(BlogService);

  // Signal erzeugen. Der Typ: Blog[]  bedeutet: leeres Array von Blog-Objekten.
  readonly blogs = signal<Blog[]>([]);

  // Signal erzeugen. Es wird damit gespeichert, ob gerade Blogs geladen werden.
  readonly loading = signal(false);

  /*
  Lifecycle-Methode: Angular ruft ngOnInit() bei der Initialisierung der Komponente auf.
  async bedeutet, dass innerhalb der Methode mit await auf asynchrone Operationen gewartet werden kann.
  Deshalb ist der Rückgabetyp: Promise<void>
  Die Methode liefert letztlich keinen Nutzwert zurück, arbeitet aber asynchron.
  */
  async ngOnInit(): Promise<void> {
    // Das loading-Signal wird auf true gesetzt.
    this.loading.set(true);

    try {
      // künstliche Verzögerung für Aufgabe 07.3: loading state sichtbar machen
      await new Promise((resolve) => setTimeout(resolve, 2000));

      /*
      Jetzt wird die Methode: getBlogs()  des BlogService aufgerufen.
      Da die Operation asynchron ist, wird: await  verwendet.
      Die Komponente wartet also, bis die Blog-Daten vorhanden sind.
      Das Ergebnis wird in einer lokalen Konstanten gespeichert:  const blogs
      */
      const blogs = await this.blogService.getBlogs();

      // Jetzt werden die geladenen Daten in das Signal geschrieben.
      this.blogs.set(blogs);
    } finally {
      // laden abgeschlossen oder fehlgeschlagen. Signal wieder auf false setzen.
      this.loading.set(false);
    }
  }

  // Der Konstruktor wird beim Erzeugen der Komponente ausgeführt.
  constructor() {
    /*
    Der Browser besitzt einen lokalen Speicher: localStorage
    Darin können Werte dauerhaft gespeichert werden.
    Hier wird nach dem Schlüssel:  theme  gesucht.
    Beispielsweise könnte gespeichert sein:  theme → "dark"
    oder:  theme → "light"  Der Wert wird in:  savedTheme  gespeichert.
    */
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    } else if (savedTheme === 'light') {
      this.isDarkMode = false;
    } else {
      // Kein gespeichertes Theme → System-Einstellung verwenden
      // Bevorzugt das Betriebssystem bzw. der Browser ein dunkles Farbschema?
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /*
    Diese Zeile setzt die CSS-Klasse: dark-theme auf das oberste HTML-Element der Seite.
    document.documentElement entspricht im Browser praktisch:  <html>
    Wenn:  this.isDarkMode === true  wird daraus sinngemäß:  <html class="dark-theme">
    Ist isDarkMode false, wird die Klasse entfernt.
    Dadurch können globale CSS-Regeln für den Dark Mode greifen.
    */
    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
  }

  /*
  Diese Methode verändert den Like-Zustand eines Blogs.
  Sie bekommt eine Blog-ID:  id: number  Beispielsweise:  id = 7
  und gibt nichts zurück:  void
  */
  toggleLike(id: number): void {
    /*
    Diese Zeile sucht den Blog mit der entsprechenden ID.
    Zunächst:  this.blogs()  liest das Array aus dem Signal.
    Dann:  .find(...)  sucht darin ein Element.
    (b) => b.id === id   ist eine Arrow Function. Sinngemäß:
    Gehe durch die Blogs und finde den Blog, dessen id der übergebenen id entspricht.
    Bei:  id = 7  wird also gesucht:
    Blog 1: id 3  → nein    Blog 2: id 7  → ja ✓    Blog 3: ...
    Der gefundene Blog wird in:  blog  gespeichert.
    */
    const blog = this.blogs().find((b) => b.id === id);

    // Falls kein Blog gefunden wurde, wird die Methode sofort beendet.
    if (!blog) {
      return;
    }

    // Jetzt wird geprüft, ob der Benutzer den Blog bereits geliked hat.
    if (blog.likedByMe) {
      // like entfernen
      blog.likedByMe = false;
      // Anzahl likes decrement
      blog.likes--;

      // wenn nicht,
    } else {
      // like setzen
      blog.likedByMe = true;
      // Anzahl likes increment
      blog.likes++;
    }

    /*
    Diese Zeile sorgt dafür, dass das blogs-Signal aktualisiert wird.
    Der Ausdruck:  [...blogs]   verwendet den Spread Operator ...
    Er erzeugt ein neues Array, das dieselben Blog-Elemente enthält.
    Aus:  Array A   [Blog1, Blog2, Blog3]   wird:  Array B  [Blog1, Blog2, Blog3]
    Der Inhalt ist zwar derselbe, aber es handelt sich um eine neue Array-Referenz.
    Damit bekommt das Signal explizit einen neuen Wert 
    und Angular kann die davon abhängige Darstellung aktualisieren.
    */
    this.blogs.update((blogs) => [...blogs]);
  }

  // Diese Methode schaltet zwischen Light Mode und Dark Mode um.
  toggleTheme(): void {
    // invert boolean
    this.isDarkMode = !this.isDarkMode;

    /*
    Jetzt wird wieder abhängig von isDarkMode die CSS-Klasse auf dem <html>-Element 
    gesetzt oder entfernt: isDarkMode = true → <html class="dark-theme">
    bzw.  isDarkMode = false → <html>
    */
    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);

    /*
    Jetzt wird die Auswahl dauerhaft im Browser gespeichert.
    Der Ausdruck:  this.isDarkMode ? 'dark' : 'light'  ist der ternäre Operator.
    Er bedeutet: wenn isDarkMode true → 'dark'   sonst  → 'light'
    Also: localStorage  theme ──► "dark"  oder:  theme ──► "light"
    Dadurch bleibt die Einstellung erhalten, wenn der Benutzer die Seite neu lädt.
    */
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}

/*

übersicht:

                 BlogOverviewPageComponent
                 (Parent / Smart Component)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     BlogService       UI-State         Dark Mode
          │          blogs/loading      localStorage
          │
          ▼
      Blog-Daten
          │
          ▼
     blogs Signal
          │
          ▼
   ┌───────────────┐
   │ BlogCard      │
   ├───────────────┤
   │ BlogCard      │
   ├───────────────┤
   │ BlogCard      │
   └───────────────┘

*/
