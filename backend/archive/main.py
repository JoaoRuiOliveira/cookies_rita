from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
import json
from datetime import datetime
from pathlib import Path

app = FastAPI()

class CalendarEvent(BaseModel):
    id: Optional[int] = None
    title: str
    date: datetime
    description: str = ""
    isImportant: bool = False
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    category: str

CALENDAR_EVENTS_FILE = Path("calendar-events.json")

def load_calendar_events():
    if CALENDAR_EVENTS_FILE.exists():
        with open(CALENDAR_EVENTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_calendar_events(events):
    with open(CALENDAR_EVENTS_FILE, 'w') as f:
        json.dump(events, f, indent=2, default=str)

@app.get("/calendar-events/", response_model=List[CalendarEvent])
def get_calendar_events():
    return load_calendar_events()

@app.post("/calendar-events/", response_model=CalendarEvent)
def create_calendar_event(event: CalendarEvent):
    events = load_calendar_events()
    event.id = len(events) + 1
    events.append(event.dict())
    save_calendar_events(events)
    return event

@app.put("/calendar-events/{event_id}", response_model=CalendarEvent)
def update_calendar_event(event_id: int, event: CalendarEvent):
    events = load_calendar_events()
    for i, e in enumerate(events):
        if e["id"] == event_id:
            event.id = event_id
            events[i] = event.dict()
            save_calendar_events(events)
            return event
    raise HTTPException(status_code=404, detail="Event not found")

@app.delete("/calendar-events/{event_id}")
def delete_calendar_event(event_id: int):
    events = load_calendar_events()
    for i, event in enumerate(events):
        if event["id"] == event_id:
            events.pop(i)
            save_calendar_events(events)
            return {"message": "Event deleted"}
    raise HTTPException(status_code=404, detail="Event not found")

@app.post("/calendar-events/import/")
async def import_calendar_events(file: UploadFile = File(...)):
    content = await file.read()
    try:
        events = json.loads(content)
        current_events = load_calendar_events()
        for ev in events:
            ev["date"] = datetime.fromisoformat(ev["date"].replace("Z", "+00:00"))
            if ev.get("startDate"):
                ev["startDate"] = datetime.fromisoformat(ev["startDate"].replace("Z", "+00:00"))
            if ev.get("endDate"):
                ev["endDate"] = datetime.fromisoformat(ev["endDate"].replace("Z", "+00:00"))
            current_events.append(ev)
        save_calendar_events(current_events)
        return {"message": f"Imported {len(events)} events"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/calendar-events/export/")
def export_calendar_events():
    return load_calendar_events() 