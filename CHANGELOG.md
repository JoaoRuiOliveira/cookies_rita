# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-06-24

### Added
- **Produtos Tab:** Added a complete "Produtos" (Products) management tab with full CRUD functionality.
  - New product model with fields: id, nome (name), preco (price), estoque (stock).
  - Complete frontend component with list, add, edit, delete, import, and export functionality.
  - Backend API integration for all product operations.
  - Consistent UI design matching other tabs in the application.
- **Product Inventory Management:** Users can now manage their product inventory with real-time updates and persistent storage.

### Fixed
- **FormGroup Type Errors:** Fixed Angular compilation errors related to `FormGroup<any> | null` type mismatches in the produto-lista component.
  - Added proper null checks with `*ngIf="editForm"` directives to prevent runtime errors.
  - Aligned edit/delete logic with working patterns from other tabs.
- **File Path Consistency:** Resolved inconsistencies between `backend/data/` and `backend/src/data/` directories.
  - Removed duplicate data directory and ensured all components use the correct `backend/data/` path.
  - Updated settings to resolve data directory regardless of working directory.
- **CSV Import Robustness:** Improved CSV parsing to handle various delimiter types and encoding issues.
  - Backend now attempts multiple delimiter strategies (comma, semicolon) for better compatibility.
  - Enhanced error handling for malformed CSV files.

### Changed
- **Export File Naming:** Updated all export functions to use default filenames with entity name and current date (e.g., `produtos-2024-06-24.csv`).
- **Backend Import Logic:** Removed automatic backup creation during imports to prevent file lock issues on Windows systems.

---

## [1.1.0] - 2024-06-20

### Added
- **Backend CSV Import/Export:** Created robust import/export functionality for all data models (Clientes, Ingredientes, Encomendas, Produtos, Receitas).
  - Import endpoints (`/import/*`) now completely replace existing data from an uploaded CSV file.
  - Export endpoints (`/export/*`) allow downloading all data as a CSV file.
- **Backend Data Sorting:** Data is now automatically sorted by ID upon creation or import to maintain consistent order in the source files.
- **Delivery Date for Orders:** Added a `data_entrega` (delivery date) field to the `Encomenda` model, API, and frontend UI, allowing users to specify a delivery date for orders.

### Changed
- **Major Backend Refactoring:** Overhauled the backend structure for better organization, scalability, and maintainability.
  - Migrated core logic into a new `src` directory with sub-modules for `api`, `config`, `models`, and `services`.
  - Moved all data files (`.csv`, `.json`) to a dedicated `backend/data` directory.
  - Standardized all CSV data handling logic within a single, unified `CSVService`.

### Fixed
- **Recipe Import Logic:** Completely rewrote the frontend and backend logic for importing recipes. It now correctly parses recipes with multiple ingredients and handles complex formatting issues that caused previous failures.
- **API Stability:** Eliminated a `500 Internal Server Error` that was caused by incorrect file paths and model handling logic after the refactoring.
- **CORS Errors:** Resolved Cross-Origin Resource Sharing (CORS) issues that were preventing the frontend application from communicating with the backend API.
- **Frontend UI Sorting:** The "Receitas" list is now consistently sorted by ID in the user interface, preventing items from appearing out of order after an import.
- **404 Console Errors:** Silenced console errors caused by requests to a non-existent `/calendar-events` endpoint.

## [1.0.0] - Initial Release
- Initial project setup and core feature implementation. 