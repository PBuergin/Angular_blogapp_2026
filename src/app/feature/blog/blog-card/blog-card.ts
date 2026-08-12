/*
Diese Zeile importiert drei Dinge aus dem Angular-Kernpaket @angular/core:
Component: Dekorator, mit dem eine TypeScript-Klasse als Angular-Komponente definiert wird.
input: moderne Angular-Funktion, um Daten von einer Parent-Komponente entgegenzunehmen.
output: moderne Angular-Funktion, um Events von der Child-Komponente nach außen zu senden.
*/
import { Component, input, output } from '@angular/core';

/*
Hier wird dein eigenes Blog-Model importiert.
*/
import { Blog } from '../../../../models/blog';

/*
Importiert das Angular-Material-Modul für Cards.
Dadurch kannst du im HTML beispielsweise Komponenten wie <mat-card>verwenden.
*/
import { MatCardModule } from '@angular/material/card';

/*
Importiert Angular-Material-Unterstützung für Buttons.
*/
import { MatButtonModule } from '@angular/material/button';

/*
Importiert Angular Material Icons.
Damit kann das Template beispielsweise enthalten: <mat-icon>favorite</mat-icon>
*/
import { MatIconModule } from '@angular/material/icon';

/*
Importiert die Angular-Router-Direktive RouterLink.
Damit kannst du im Template Links definieren wie: <a [routerLink]="['/blog', model().id]">
Angular navigiert dann innerhalb der SPA, ohne dass der Browser die komplette Webseite neu laden muss.
*/
import { RouterLink } from '@angular/router';

/*
Jetzt beginnt die Definition der Angular-Komponente:
@Component ist ein Decorator.
Er sagt Angular:
Die folgende TypeScript-Klasse ist nicht einfach irgendeine Klasse, sondern eine Angular-Komponente.
Die Informationen innerhalb von { ... } sind die Metadaten dieser Komponente.
*/
@Component({
  /*
  Der selector definiert den HTML-Namen der Komponente.
  Andere Templates können diese Komponente beispielsweise so verwenden:
  <app-blog-card></app-blog-card>
  app-blog-card ist also gewissermaßen dein eigenes HTML-Element.
  */
  selector: 'app-blog-card',

  /*
  Die Komponente ist eine Standalone Component.
  Das bedeutet, dass sie nicht in einem klassischen Angular-NgModule registriert werden muss.
  Sie kann ihre benötigten Komponenten, Module und Direktiven selbst über imports angeben.
  Bei aktuellen Angular-Projekten ist das der normale Ansatz.
  */
  standalone: true,

  /*
  Hier wird festgelegt, was das HTML-Template dieser Komponente verwenden darf.
  Deine blog-card.html darf dadurch beispielsweise verwenden:
  <mat-card>, <button mat-button>, <mat-icon>, <a routerLink>
  Wichtig ist die Unterscheidung:
  import { MatCardModule } from '@angular/material/card';
  ist zunächst ein TypeScript-Import.
  imports: [MatCardModule]
  macht dieses Modul zusätzlich für das Template der Standalone-Komponente verfügbar.
  */
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],

  /*
  Hier wird angegeben, wo sich das HTML-Template der Komponente befindet.
  Angular verbindet also:

  blog-card.ts
    │
    └── blog-card.html

  Die .ts-Datei enthält primär die Logik, die .html-Datei die Darstellung.
  */
  templateUrl: './blog-card.html',

  /*
  Hier wird das Stylesheet der Komponente angegeben.
  Also:

  blog-card.ts
     ├── (blog-card.html)
     └── blog-card.scss

  Das SCSS definiert das Styling dieser Komponente.
  */
  styleUrl: './blog-card.scss',
})

/*
Eigentliche TypeScript-Klasse:
Hier wird die Klasse "BlogCardComponent" definiert.
export bedeutet, dass andere Dateien diese Klasse importieren können: import { BlogCardComponent } from '...';
Diese Klasse enthält die Logik und den Zustand der Blog-Card-Komponente.
*/
export class BlogCardComponent {
  /*
  Diese Zeile definiert einen Input der Komponente.
  Der Input heißt: model
  Eine Parent-Komponente kann deshalb beispielsweise schreiben: <app-blog-card [model]="blog"></app-blog-card>
  Das Blog-Objekt wird damit von außen in die BlogCardComponent hineingereicht.
  Der Datenfluss ist:

  Parent Component
        │
        │ Blog-Objekt
        ▼
  <app-blog-card [model]="blog">
        │
        ▼
  BlogCardComponent
  
  input.required()   bedeutet:
  Dieser Input ist zwingend erforderlich. Die Komponente erwartet also immer ein model.
  input.required<Blog>()   ist ein TypeScript-Generic. Es legt fest:
  model muss vom Typ Blog sein.
  Damit wird beispielsweise verhindert, dass versehentlich ein String übergeben wird.
  readonly bedeutet, dass die Property selbst nicht später durch etwas anderes ersetzt werden soll.
  Also nicht: this.model = ...
  Das von Angular bereitgestellte Input-Signal bleibt dieselbe Referenz.
  Wichtig ist außerdem: model ist hier kein normales Blog-Objekt, sondern ein Signal.
  Deshalb liest du den Wert mit: this.model()   und nicht mit: this.model
  Im Template entsprechend zum Beispiel: {{ model().title }}
  */
  readonly model = input.required<Blog>();

  /*
  definiert einen Output. Während input Daten hinein bringt, Parent → Child
  sendet output Ereignisse hinaus: Child → Parent
  Der Output heißt: liked   und   <number>
  bedeutet, dass beim Event eine Zahl übertragen wird.
  In deinem Fall ist das die Blog-ID.
  Eine Parent-Komponente könnte deshalb schreiben:

  <app-blog-card
    [model]="blog"
    (liked)="handleLike($event)">
  </app-blog-card>

  Das $event enthält dann die Zahl, die BlogCardComponent ausgegeben hat.
  */
  readonly liked = output<number>();

  /*
  onLike ist eine normale Methode der Klasse.
  (): void    bedeutet: keine Parameter und kein Rückgabewert.
  Hier passiert die eigentliche Kommunikation mit der Parent-Komponente.
  this.model()   liest das aktuelle Blog-Objekt aus dem Input-Signal.
  this.liked.emit(...)   löst das Output-Event aus.
  */
  onLike(): void {
    this.liked.emit(this.model().id);
  }
}

/*
Zusammenfassung:

1. Blog-Daten erhalten
           ↓
   input.required<Blog>()

2. Blog als Card darstellen
           ↓
   blog-card.html
   Angular Material

3. Like-Klick melden
           ↓
   output<number>()
           ↓
   Blog-ID an Parent senden




             Daten
Parent ───────────────────► Child
          @Input / input


             Event
Parent ◄─────────────────── Child
          @Output / output


*/
