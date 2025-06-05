import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AddEventDialogComponent } from './add-event-dialog.component';
import { CalendarService, CalendarEvent } from '../../services/calendar.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="agenda-main-layout">
      <div class="agenda-left">
        <div class="agenda-header">
          <div class="month-navigation">
            <button mat-icon-button (click)="previousMonth()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <h2>{{ currentDate | date:'MMMM yyyy' }}</h2>
            <button mat-icon-button (click)="nextMonth()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
        <div class="agenda-grid-container">
          <div class="agenda-grid">
            <div class="weekday-header" *ngFor="let day of weekDays">
              {{ day }}
            </div>
            <div *ngFor="let day of calendarDays"
                 class="agenda-day"
                 [class.other-month]="!day.isCurrentMonth"
                 [class.today]="day.isToday"
                 [class.has-events]="day.hasEvents"
                 [class.has-important-events]="day.hasImportantEvents"
                 [class.selected]="isSelectedDate(day.date)"
                 (click)="selectDate(day.date)">
              <div class="day-header">
                <span class="day-number">{{ day.date | date:'d' }}</span>
                <button mat-icon-button class="add-event-btn" (click)="openAddEventDialog(day.date); $event.stopPropagation()">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <div class="day-events">
                <ng-container *ngFor="let event of getEventsForDate(day.date)">
                  <ng-container *ngIf="event.startDate && event.endDate && (event.startDate !== event.endDate)">
                    <div
                      class="day-event multi-day-event"
                      [ngClass]="{
                        'multi-day-start': isSameDay(day.date, event.startDate),
                        'multi-day-end': isSameDay(day.date, event.endDate),
                        'multi-day-continue': !isSameDay(day.date, event.startDate) && !isSameDay(day.date, event.endDate)
                      }"
                      [attr.data-category]="event.category"
                      (click)="selectEvent(event); $event.stopPropagation()"
                    >
                      <mat-icon *ngIf="event.isImportant" class="important-icon">star</mat-icon>
                      <mat-icon *ngIf="event.category === 'holiday'">beach_access</mat-icon>
                      <mat-icon *ngIf="event.category === 'meeting'">groups</mat-icon>
                      <mat-icon *ngIf="event.category === 'party'">celebration</mat-icon>
                      <span *ngIf="isSameDay(day.date, event.startDate) || isSameDay(day.date, event.endDate)" class="event-title">{{ event.title }}</span>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="!event.startDate || !event.endDate || event.startDate === event.endDate">
                    <div class="day-event" 
                         [class.important]="event.isImportant" 
                         [attr.data-category]="event.category"
                         (click)="selectEvent(event); $event.stopPropagation()">
                      <mat-icon *ngIf="event.isImportant" class="important-icon">star</mat-icon>
                      <mat-icon *ngIf="event.category === 'holiday'">beach_access</mat-icon>
                      <mat-icon *ngIf="event.category === 'meeting'">groups</mat-icon>
                      <mat-icon *ngIf="event.category === 'party'">celebration</mat-icon>
                      <span class="event-time">{{ event.date | date:'HH:mm' }}</span>
                      <span class="event-title">{{ event.title }}</span>
                    </div>
                  </ng-container>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="agenda-right">
        <div class="backup-section">
          <div class="backup-title">
            <mat-icon>settings_backup_restore</mat-icon>
            Backup & Restore
          </div>
          <div class="backup-actions">
            <button mat-raised-button color="primary" (click)="exportEvents()">
              <mat-icon>download</mat-icon> Export Events
            </button>
            <button mat-raised-button color="accent" (click)="importInput.click()">
              <mat-icon>upload</mat-icon> Import Events
            </button>
            <input #importInput type="file" accept="application/json" style="display:none" (change)="importEvents($event)" />
          </div>
        </div>
        <div class="clock-panel">
          <div class="clock-time-large">{{ currentTime }}</div>
          <div class="clock-date">{{ currentDateString }}</div>
        </div>
        <div class="important-events-panel" *ngIf="getUpcomingImportantEvents().length > 0">
          <div class="important-header">
            <h3><mat-icon>star</mat-icon> Upcoming Important Events</h3>
          </div>
          <div class="important-list">
            <div *ngFor="let event of getUpcomingImportantEvents()" class="important-event" (click)="selectDate(event.date); selectEvent(event)">
              <div class="important-date">
                <span class="day">{{ event.date | date:'EEE' }}</span>
                <span class="date">{{ event.date | date:'MMM d' }}</span>
              </div>
              <div class="important-content">
                <div class="important-time">
                  {{ (event.startDate ? (event.startDate | date:'HH:mm') : (event.date | date:'HH:mm')) }}
                  <ng-container *ngIf="event.endDate && event.startDate && (event.endDate !== event.startDate)">
                    - {{ event.endDate | date:'HH:mm' }}
                  </ng-container>
                </div>
                <div class="important-title">{{ event.title }}</div>
              </div>
              <mat-icon class="important-arrow">chevron_right</mat-icon>
            </div>
          </div>
        </div>
        <div class="current-date-panel" *ngIf="selectedDate">
          <div class="current-date-header">
            <h3>{{ selectedDate | date:'EEEE, MMMM d' }}</h3>
            <button mat-raised-button color="primary" (click)="openAddEventDialog(selectedDate)">
              <mat-icon>add</mat-icon>
              Add Event
            </button>
          </div>
          <div class="current-events-list">
            <div *ngIf="getEventsForDate(selectedDate).length === 0" class="no-events">
              <p>No events scheduled for this date</p>
              <button mat-stroked-button color="primary" (click)="openAddEventDialog(selectedDate)">
                <mat-icon>add</mat-icon>
                Add your first event
              </button>
            </div>
            <div *ngFor="let event of getEventsForDate(selectedDate)"
                 class="event-card"
                 [class.important]="event.isImportant"
                 [class.selected]="selectedEvent?.id === event.id"
                 [attr.data-category]="event.category">
              <div class="event-time">
                {{ (event.startDate ? (event.startDate | date:'HH:mm') : (event.date | date:'HH:mm')) }}
                <ng-container *ngIf="event.endDate && event.startDate && (event.endDate !== event.startDate)">
                  - {{ event.endDate | date:'HH:mm' }}
                </ng-container>
              </div>
              <div class="event-content">
                <div class="event-header">
                  <h4>
                    <mat-icon *ngIf="event.isImportant" class="important-icon">star</mat-icon>
                    <mat-icon *ngIf="event.category === 'holiday'">beach_access</mat-icon>
                    <mat-icon *ngIf="event.category === 'meeting'">groups</mat-icon>
                    <mat-icon *ngIf="event.category === 'party'">celebration</mat-icon>
                    {{ event.title }}
                  </h4>
                  <div class="event-actions">
                    <button mat-icon-button (click)="toggleEventImportance(event)">
                      <mat-icon>{{ event.isImportant ? 'star' : 'star_border' }}</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteEvent(event)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
                <p>{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .agenda-main-layout {
      display: flex;
      flex-direction: row;
      gap: 24px;
      width: 100vw;
      max-width: 100vw;
      margin: 0;
      height: 100vh;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: hidden;
    }
    .agenda-left {
      flex: 0 0 70%;
      width: calc(70vw - 12px);
      min-width: 0;
      max-width: calc(70vw - 12px);
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      padding: 0;
      height: 100vh;
      justify-content: stretch;
      align-items: stretch;
      box-sizing: border-box;
    }
    .agenda-header {
      margin-bottom: 0;
      padding: 24px 24px 0 24px;
      box-sizing: border-box;
    }
    .agenda-grid-container {
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      display: flex;
      align-items: stretch;
      justify-content: stretch;
      padding: 0 20px 20px 20px;
      box-sizing: border-box;
      overflow-x: hidden;
    }
    .agenda-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: 1fr;
      gap: 2px;
      background: #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      width: 100%;
      height: 100%;
      min-height: 0;
      min-width: 0;
      box-sizing: border-box;
    }
    .weekday-header {
      background: #f7f8fa;
      padding: 8px 0;
      text-align: center;
      font-weight: 600;
      color: #6c757d;
      font-size: 1rem;
      border-bottom: 1px solid #e9ecef;
    }
    .agenda-day {
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      padding: 6px 6px 2px 6px;
      display: flex;
      flex-direction: column;
      position: relative;
      cursor: pointer;
      transition: box-shadow 0.2s, border 0.2s;
      border: 2px solid transparent;
      overflow: hidden;
    }
    .agenda-day.selected {
      border: 2px solid #1976d2;
      background: #e3f2fd;
    }
    .agenda-day.today {
      border: 2px solid #43a047;
      background: #e8f5e9;
    }
    .agenda-day.other-month {
      background: #f4f6fb;
      color: #b0b0b0;
    }
    .agenda-day:hover {
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
      border: 2px solid #90caf9;
      z-index: 2;
    }
    .day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .day-number {
      font-size: 1.1rem;
      font-weight: 600;
      color: #222;
    }
    .agenda-day.other-month .day-number {
      color: #b0b0b0;
    }
    .add-event-btn {
      opacity: 0.7;
      transition: opacity 0.2s;
      padding: 0;
      margin-left: 2px;
    }
    .agenda-day:hover .add-event-btn {
      opacity: 1;
    }
    .day-events {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 2px;
    }
    .day-event {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f7f8fa;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 0.92rem;
      color: #333;
      cursor: pointer;
      transition: background 0.2s;
      border-left: 3px solid #1976d2;
    }
    .day-event.important {
      border-left: 3px solid #ffb300;
      background: #fffde7;
    }
    .day-event[data-category="holiday"] {
      border-left: 3px solid #4caf50;
      background: #e8f5e9;
    }
    .day-event[data-category="meeting"] {
      border-left: 3px solid #2196f3;
      background: #e3f2fd;
    }
    .day-event[data-category="party"] {
      border-left: 3px solid #9c27b0;
      background: #f3e5f5;
    }
    .day-event .important-icon {
      color: #ffb300;
      font-size: 1.1rem;
      margin-right: 2px;
    }
    .event-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90px;
    }
    .event-time {
      font-size: 0.85rem;
      color: #888;
      margin-right: 2px;
    }
    .agenda-right {
      flex: 1 1 0;
      width: calc(30vw - 12px);
      min-width: 0;
      max-width: calc(30vw - 12px);
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100vh;
      box-sizing: border-box;
      overflow-y: auto;
    }
    .important-events-panel {
      background: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 8px;
      padding: 12px 20px 8px 20px;
    }
    .important-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .important-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .important-event {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 6px 0;
      border-radius: 6px;
      transition: background 0.2s;
      cursor: pointer;
    }
    .important-event:hover {
      background: #fffbe6;
    }
    .important-date {
      min-width: 48px;
      text-align: center;
      font-size: 0.95rem;
      color: #888;
    }
    .important-title {
      font-weight: 600;
      color: #222;
    }
    .important-time {
      font-size: 0.95rem;
      color: #555;
    }
    .important-arrow {
      color: #888;
      opacity: 0.5;
    }
    .current-date-panel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-top: 12px;
    }
    .current-date-header {
      padding: 18px 18px 10px 18px;
      border-bottom: 1px solid #e9ecef;
      background: #f7f8fa;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .current-events-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .event-card {
      background: #f7f8fa;
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      margin-bottom: 6px;
      border-left: 4px solid #1976d2;
      transition: border 0.2s, background 0.2s;
      cursor: pointer;
    }
    .event-card[data-category="holiday"] {
      border-left: 4px solid #4caf50;
      background: #e8f5e9;
    }
    .event-card[data-category="meeting"] {
      border-left: 4px solid #2196f3;
      background: #e3f2fd;
    }
    .event-card[data-category="party"] {
      border-left: 4px solid #9c27b0;
      background: #f3e5f5;
    }
    .event-card.important {
      border-left: 4px solid #ffb300;
      background: #fffde7;
    }
    .event-card.selected {
      border-left: 4px solid #43a047;
      background: #e8f5e9;
    }
    .event-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .event-header h4 {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .event-actions button {
      margin-left: 2px;
    }
    .no-events {
      text-align: center;
      color: #888;
      margin-top: 20px;
    }
    @media (max-width: 1200px) {
      .agenda-left {
        max-width: 60vw;
      }
      .agenda-right {
        max-width: 40vw;
      }
    }
    @media (max-width: 900px) {
      .agenda-main-layout {
        flex-direction: column;
        gap: 12px;
        height: auto;
      }
      .agenda-left, .agenda-right {
        width: 100vw;
        min-width: 0;
        max-width: 100vw;
        height: auto;
      }
      .agenda-right {
        min-width: 0;
        max-width: 100vw;
      }
    }
    .month-navigation {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
    }
    .month-navigation h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 8px;
      min-width: 160px;
      text-align: center;
    }
    .backup-section {
      background: #f8f9fa;
      border: 1.5px solid #e0e0e0;
      border-radius: 10px;
      padding: 18px 18px 12px 18px;
      margin-bottom: 22px;
      box-shadow: 0 2px 8px #e0e0e033;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .backup-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #1976d2;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .backup-actions {
      display: flex;
      gap: 16px;
      width: 100%;
    }
    .backup-actions button {
      min-width: 150px;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 8px;
      box-shadow: 0 1px 4px #1976d222;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    }
    .backup-actions button mat-icon {
      margin-right: 6px;
    }
    .backup-actions button:hover {
      box-shadow: 0 4px 16px #1976d244;
      transform: scale(1.04);
    }
    .multi-day-event {
      background: #e3f2fd;
      border-left: 4px solid #1976d2;
      border-radius: 0;
      color: #1976d2;
      font-weight: 600;
      display: flex;
      align-items: center;
      min-height: 28px;
      margin: 2px 0;
      padding: 2px 6px;
      cursor: pointer;
      position: relative;
      z-index: 1;
    }
    .multi-day-event[data-category="holiday"] {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      color: #2e7d32;
    }
    .multi-day-event[data-category="meeting"] {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      color: #1565c0;
    }
    .multi-day-event[data-category="party"] {
      background: #f3e5f5;
      border-left: 4px solid #9c27b0;
      color: #7b1fa2;
    }
    .multi-day-event.important {
      background: #fffde7;
      border-left: 4px solid #ffb300;
      color: #f57f17;
    }
    .multi-day-start {
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
      background: linear-gradient(90deg, #e3f2fd 80%, #fff 100%);
    }
    .multi-day-end {
      border-top-right-radius: 12px;
      border-bottom-right-radius: 12px;
      background: linear-gradient(270deg, #e3f2fd 80%, #fff 100%);
    }
    .multi-day-continue {
      background: #e3f2fd;
      opacity: 0.7;
      min-height: 18px;
      border-radius: 0;
    }
    .multi-day-event .event-title {
      font-weight: 600;
      color: #1976d2;
      margin-left: 4px;
    }
    .clock-panel {
      margin: 18px 0 28px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f7f8fa;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      padding: 18px 28px 14px 28px;
      font-size: 1.08rem;
      font-weight: 500;
      color: #1976d2;
      width: 100%;
      max-width: 340px;
      margin-left: auto;
      margin-right: auto;
    }
    .clock-time-large {
      font-size: 2.1rem;
      font-weight: 600;
      letter-spacing: 1px;
      font-variant-numeric: tabular-nums;
      margin-bottom: 4px;
    }
    .clock-date {
      font-size: 1.08rem;
      color: #333;
      font-weight: 400;
      text-align: center;
    }
  `]
})
export class CalendarComponent implements OnInit, OnDestroy {
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  events: CalendarEvent[] = [];
  nextEventId: number = 1;
  selectedEvent: CalendarEvent | null = null;
  currentTime: string = '';
  currentDateString: string = '';
  private clockInterval: any;

  constructor(
    private dialog: MatDialog,
    private calendarService: CalendarService
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
    this.currentDateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get calendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: any[] = [];

    // Add days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        hasEvents: this.hasEvents(date),
        hasImportantEvents: this.hasImportantEvents(date)
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        hasEvents: this.hasEvents(date),
        hasImportantEvents: this.hasImportantEvents(date)
      });
    }

    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        hasEvents: this.hasEvents(date),
        hasImportantEvents: this.hasImportantEvents(date)
      });
    }

    return days;
  }

  previousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.selectedEvent = null;
  }

  isSelectedDate(date: Date): boolean {
    return (
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  hasEvents(date: Date): boolean {
    return this.events.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }

  hasImportantEvents(date: Date): boolean {
    return this.events.some(event => 
      event.isImportant &&
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event => {
      // Support both legacy (event.date) and new (event.startDate, event.endDate) events
      if (event.startDate && event.endDate) {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return d >= start && d <= end;
      } else {
        return (
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear()
        );
      }
    }).sort((a, b) => {
      // Sort by start time if available, else by date
      const aTime = a.startDate ? new Date(a.startDate).getTime() : a.date.getTime();
      const bTime = b.startDate ? new Date(b.startDate).getTime() : b.date.getTime();
      return aTime - bTime;
    });
  }

  toggleEventImportance(event: CalendarEvent) {
    event.isImportant = !event.isImportant;
  }

  selectEvent(event: CalendarEvent) {
    this.selectedEvent = event;
  }

  openAddEventDialog(date: Date) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '500px',
      data: { date }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newEvent: CalendarEvent = {
          ...result,
          id: this.nextEventId++
        };
        this.calendarService.addEvent(newEvent).subscribe(
          (event) => {
            this.events.push(event);
            this.selectedEvent = event;
          },
          (error) => {
            console.error('Error adding event:', error);
          }
        );
      }
    });
  }

  deleteEvent(event: CalendarEvent) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.calendarService.deleteEvent(event.id!).subscribe(
        () => {
          this.events = this.events.filter(e => e.id !== event.id);
        },
        (error) => {
          console.error('Error deleting event:', error);
        }
      );
    }
  }

  getUpcomingImportantEvents(): CalendarEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return event.isImportant && eventDate >= today;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5); // Show only the next 5 important events
  }

  loadEvents() {
    this.calendarService.getEvents().subscribe(events => {
      this.events = events.map(ev => ({
        ...ev,
        id: Number(ev.id),
        date: new Date(ev.date),
        startDate: ev.startDate ? new Date(ev.startDate) : undefined,
        endDate: ev.endDate ? new Date(ev.endDate) : undefined
      }));
      this.updateCalendarDays();
    });
  }

  importEvents(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.calendarService.importEvents(file).subscribe(
      (response) => {
        this.loadEvents();
      },
      (error) => {
        console.error('Error importing events:', error);
        alert('Error importing events. Please check the file format.');
      }
    );
  }

  exportEvents() {
    this.calendarService.exportEvents().subscribe(events => {
      if (!events.length) {
        const filename = 'calendar-events_no-events.json';
        const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        return;
      }
      // Find min and max dates
      const dates = events
        .map(ev => new Date(ev.date))
        .sort((a, b) => a.getTime() - b.getTime());
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      // Format as dd-mm-yyyy
      const format = (d: Date) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
      const filename = `calendar-events_${format(firstDate)}_to_${format(lastDate)}.json`;
      // Download
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  isSameDay(a: Date | string, b: Date | string): boolean {
    const d1 = new Date(a);
    const d2 = new Date(b);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  updateCalendarDays() {
    // Existing logic to generate calendar days goes here
    // This is a placeholder to avoid linter errors
  }
} 