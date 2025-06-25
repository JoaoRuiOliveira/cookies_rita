import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalendarEvent {
  id?: number | string;  // Can be number for regular events or string like "order_1" for order events
  title: string;
  date: string | Date;  // Backend sends ISO string, frontend converts to Date
  description: string;
  isImportant: boolean;
  startDate?: string | Date;
  endDate?: string | Date;
  category: string;
  order_id?: number;  // Link to order if it's a delivery event
  client_name?: string;  // Client name for order events
  total?: number;  // Order total for order events
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:8000/calendar-events';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.apiUrl);
  }

  getOrderEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/orders`);
  }

  addEvent(event: CalendarEvent): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.apiUrl, event);
  }

  updateEvent(id: number | string, event: CalendarEvent): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createEventFromOrder(orderId: number): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/create-from-order`, { order_id: orderId });
  }

  importEvents(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }

  exportEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/export`);
  }
} 