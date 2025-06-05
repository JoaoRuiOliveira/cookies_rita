# Cookies Rita - Calendar & Management App

## Overview

**Cookies Rita** is a full-featured management application designed for bakeries, pastry shops, or small businesses. It provides:
- A modern calendar for event and order management
- Client, ingredient, product, recipe, and order tracking
- Data import/export and backup/restore for all sections
- Responsive, user-friendly interface
- Persistent storage using FastAPI and CSV/JSON files

## Features

- **Calendar**: Add, edit, delete, and categorize events (with color coding and importance marking)
- **Clients, Ingredients, Products, Recipes, Orders**: CRUD operations, CSV-based storage
- **Import/Export**: Download and upload data for backup or migration
- **Live Clock**: Always-visible, modern clock with date and time
- **Responsive UI**: Works on desktop and tablets

## Technology Stack

- **Frontend**: Angular, TypeScript, Electron (for desktop app)
- **Backend**: FastAPI (Python)
- **Storage**: CSV (for most data), JSON (for calendar events)

## Setup Instructions

### 1. Backend (FastAPI)

- Install Python 3.9+
- Navigate to the `backend` directory:
  ```sh
  cd backend
  ```
- (Optional) Create and activate a virtual environment:
  ```sh
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```
- Install dependencies:
  ```sh
  pip install fastapi uvicorn
  ```
- Start the backend server:
  ```sh
  uvicorn main:app --reload
  ```
- The API will be available at `http://127.0.0.1:8000/`

### 2. Frontend (Angular + Electron)

- Install Node.js (v16+ recommended)
- Navigate to the `frontend` directory:
  ```sh
  cd frontend
  ```
- Install dependencies:
  ```sh
  npm install
  ```
- Start the Angular app:
  ```sh
  npm start
  ```
- For Electron desktop app:
  ```sh
  npm run electron
  ```

## Usage Instructions

### Calendar
- **Add Event**: Click on a day, fill in the event details, and save.
- **Edit/Delete Event**: Click an event, then use the edit or delete options.
- **Mark as Important**: Choose the "important" category; the event will be highlighted.
- **Color Coding**: Events are colored by category for easy identification.
- **Import Events**: Use the "Import" button in the right panel. Select a `.json` file with events.
- **Export Events**: Use the "Export" button. The file will be named with the date range of events (e.g., `calendar-events_01-06-2025_to_30-06-2025.json`).

### Other Sections (Clients, Ingredients, etc.)
- Use the left navigation to access each section.
- Add, edit, or delete entries as needed.
- Import/export data using the provided buttons (CSV format).

## File Structure

```
cookies_rita/
├── backend/
│   ├── main.py              # FastAPI backend
│   ├── calendar-events.json # Calendar event storage (JSON)
│   ├── clientes.csv         # Clients data
│   ├── ingredientes.csv     # Ingredients data
│   ├── produtos.csv         # Products data
│   ├── receitas.csv         # Recipes data
│   ├── encomendas.csv       # Orders data
│   └── ...
├── frontend/
│   ├── src/app/components/  # Angular components (calendar, etc.)
│   ├── src/app/services/    # Angular services (API calls)
│   ├── electron/            # Electron integration
│   └── ...
├── README.md
└── ...
```

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes and commit with clear messages
4. Submit a pull request

## Troubleshooting

- **Backend not starting?**
  - Check Python version and dependencies
  - Ensure no other process is using port 8000
- **Frontend not starting?**
  - Check Node.js version
  - Run `npm install` again if you see missing module errors
- **Data not saving?**
  - Make sure the backend has write permissions to the data files
- **Import/Export issues?**
  - Ensure the file format matches the expected structure (see sample export)

## License

[Your License Here] 