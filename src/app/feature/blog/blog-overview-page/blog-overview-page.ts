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

*/
import { Component, inject, OnInit } from '@angular/core';

/*
Hier wird die BlogCardComponent importiert.
*/
import { BlogCardComponent } from '../blog-card/blog-card';

/*
Zentraler Blog State Service
*/
import { BlogStateService } from '../../../services/blog-state';

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

  // state objekt
  readonly state = inject(BlogStateService);

  /*
  Lifecycle-Methode: Angular ruft ngOnInit() bei der Initialisierung der Komponente auf.
  async bedeutet, dass innerhalb der Methode mit await auf asynchrone Operationen gewartet werden kann.
  Deshalb ist der Rückgabetyp: Promise<void>
  Die Methode liefert letztlich keinen Nutzwert zurück, arbeitet aber asynchron.
  */
  async ngOnInit(): Promise<void> {
    await this.state.loadBlogs();
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
    this.state.toggleLike(id);
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
