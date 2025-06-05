import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

interface DialogData {
  date: Date;
}

@Component({
  selector: 'app-add-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>event</mat-icon>
        Add New Event
      </h2>
      <mat-dialog-content>
        <form #eventForm="ngForm" class="event-form">
          <mat-form-field appearance="outline">
            <mat-label>Event Title</mat-label>
            <input matInput [(ngModel)]="event.title" name="title" required placeholder="Enter event title">
            <mat-icon matSuffix>title</mat-icon>
          </mat-form-field>

          <div class="date-time-fields-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" name="startDate" required>
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Start Time</mat-label>
              <input matInput type="time" [(ngModel)]="startTime" name="startTime" required>
              <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>
          </div>

          <div class="date-time-fields-row">
            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" name="endDate" required [min]="startDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>End Time</mat-label>
              <input matInput type="time" [(ngModel)]="endTime" name="endTime" required>
              <mat-icon matSuffix>schedule</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="event.description" name="description" rows="4" 
                      placeholder="Enter event description (optional)"></textarea>
            <mat-icon matSuffix>description</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="event.category" name="category" required>
              <mat-option value="important">Important</mat-option>
              <mat-option value="holiday">Holiday</mat-option>
              <mat-option value="meeting">Meeting</mat-option>
              <mat-option value="party">Party</mat-option>
            </mat-select>
            <mat-icon matSuffix>category</mat-icon>
          </mat-form-field>

          <div class="important-toggle-row">
            <button mat-icon-button type="button" (click)="toggleImportance()">
              <mat-icon [class.active]="event.isImportant">{{ event.isImportant ? 'star' : 'star_border' }}</mat-icon>
            </button>
            <span [class.active-label]="event.isImportant">Mark as important</span>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="actions-row">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!eventForm.form.valid || !isDateTimeValid()">
          <mat-icon>add</mat-icon>
          Add Event
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      min-width: 400px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 20px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      color: #333;
      font-size: 1.25rem;
    }

    mat-dialog-content {
      padding: 24px;
    }

    .event-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    mat-form-field {
      width: 100%;
      margin-top: 8px;
      padding-top: 6px;
    }
    mat-form-field .mat-form-field-label {
      top: 18px !important;
      background: transparent;
      z-index: 2;
    }
    mat-form-field.mat-focused .mat-form-field-label {
      top: 6px !important;
    }

    mat-icon[matSuffix] {
      color: #666;
    }

    .important-toggle-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      margin-bottom: 2px;
      padding: 8px 0 0 0;
    }
    .important-toggle-row button[mat-icon-button] {
      border-radius: 50%;
      background: #f7f7f7;
      transition: background 0.2s;
    }
    .important-toggle-row button[mat-icon-button]:hover {
      background: #fffde7;
    }
    .important-toggle-row mat-icon {
      color: #888;
      font-size: 1.5rem;
      transition: color 0.2s;
    }
    .important-toggle-row mat-icon.active {
      color: #ffc107;
    }
    .important-toggle-row span {
      font-size: 1.05rem;
      color: #666;
      font-weight: 500;
      transition: color 0.2s;
    }
    .important-toggle-row span.active-label {
      color: #ffc107;
    }

    .actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    button[mat-raised-button] {
      padding: 0 24px;
    }

    @media (max-width: 600px) {
      .dialog-container {
        min-width: 100%;
        max-width: 100%;
        height: 100%;
        margin: 0;
      }

      mat-dialog-content {
        padding: 16px;
      }

      .actions-row {
        padding: 16px;
      }
    }

    .date-time-fields-row {
      display: flex;
      align-items: flex-end;
      gap: 14px;
      margin-bottom: 18px;
    }
    .date-time-fields-row mat-form-field {
      flex: 1;
      min-width: 0;
      margin-bottom: 0;
    }
    .date-time-fields-row mat-form-field .mat-form-field-wrapper {
      padding-bottom: 0 !important;
    }
    .date-time-fields-row mat-icon[matSuffix] {
      margin-bottom: 0 !important;
      vertical-align: middle;
      line-height: 1.5;
    }
  `]
})
export class AddEventDialogComponent {
  event = {
    title: '',
    description: '',
    isImportant: false,
    startDate: new Date(),
    endDate: new Date(),
    startTime: '',
    endTime: '',
    category: 'important'
  };
  startDate: Date = new Date();
  endDate: Date = new Date();
  startTime: string = '00:00';
  endTime: string = '00:00';

  constructor(
    private dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.startDate = new Date(data.date);
    this.endDate = new Date(data.date);
    const hours = this.startDate.getHours().toString().padStart(2, '0');
    const minutes = this.startDate.getMinutes().toString().padStart(2, '0');
    this.startTime = `${hours}:${minutes}`;
    this.endTime = `${hours}:${minutes}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isDateTimeValid()) return;
    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    const start = new Date(this.startDate);
    start.setHours(startHours, startMinutes);
    const end = new Date(this.endDate);
    end.setHours(endHours, endMinutes);
    this.event.startDate = start;
    this.event.endDate = end;
    this.event.startTime = this.startTime;
    this.event.endTime = this.endTime;
    if (this.event.category === 'important') {
      this.event.isImportant = true;
    }
    this.dialogRef.close(this.event);
  }

  isDateTimeValid(): boolean {
    if (!this.startDate || !this.endDate || !this.startTime || !this.endTime) return false;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    start.setHours(startHours, startMinutes);
    end.setHours(endHours, endMinutes);
    return start < end;
  }

  toggleImportance() {
    this.event.isImportant = !this.event.isImportant;
  }
} 