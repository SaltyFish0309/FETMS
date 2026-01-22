# FET Management System (FETMS) - Product Overview

## Executive Summary
**FETMS** is a modern, comprehensive platform designed to streamline the recruitment, management, and compliance of Foreign English Teachers (FETs). Built on a robust **MERN stack (MongoDB, Express, React, Node.js)**, it replaces manual spreadsheets with a centralized, intelligent system.

The system is architected around **three core verticals**: **Teachers**, **Schools**, and **Workflows**, providing a seamless experience for administrators to manage the entire lifecycle of a teacher—from application to placement and renewal.

## Technical Architecture

### Frontend (The "Premium" Experience)
*   **Core**: React 18 (Vite) + TypeScript for type-safe, high-performance UI.
*   **Styling**: Tailwind CSS + Shadcn/UI (Radix Primitives) for accessible, responsive, and beautiful design.
*   **State Management**: React Hooks + Context API for efficient local state handling.
*   **Visuals**: Recharts for data visualization (Demographics, Pipeline Stats) and `dnd-kit` for drag-and-drop Kanban boards.

### Backend (The "Intelligent" Core)
*   **Runtime**: Node.js + Express 5.0 (Beta) for modern, fast API handling.
*   **Database**: MongoDB (via Mongoose) for flexible, schema-less data modeling suitable for dynamic document structures.
*   **Key Services**:
    *   **File Handling**: Multer for secure document uploads.
    *   **Data Processing**: CSV Parsers for bulk data importing.
    *   **Archiving**: On-the-fly ZIP generation for document batch downloads.

## Core Core Modules

### 1. Teacher Management 360°
A centralized hub for all teacher data.
*   **Rich Profiles**: Detailed storage of Personal Info, Education, Work Permits, and Licenses.
*   **Document Vault**: Secure upload and storage of teacher documents with version tracking.
*   **Bulk Actions**: Import hundreds of teachers via CSV with validation logic.
*   **Search & Filter**: Instant filtering by status, nationality, or name.

### 2. The "Schools" Vertical
A dedicated module to manage the institutions where teachers are placed.
*   **School Profiles**: Manage contact info, addresses, and principal details.
*   **Placement Tracking**: Link teachers to specific schools (implied relationship).
*   **CRUD Operations**: Full management (Create, Read, Update, Delete) of school records.

### 3. Intelligent Workflow Engine (Kanban)
Recruitment is visualized as a dynamic pipeline.
*   **Kanban Board**: A Trello-like interface to drag and drop teachers between stages (e.g., "Applied" -> "Interviewing" -> "Hired").
*   **Custom Stages**: Backend support for defining active/inactive stages (`Stage` model).
*   **Visual Clarity**: Immediate understanding of where every candidate stands in the hiring process.

### 4. Command Center Dashboard
Real-time analytics to drive decision-making.
*   **Demographics**: Visual charts showing the nationality breakdown of the teaching force.
*   **Pipeline Stats**: Live counters of teachers in each recruitment stage.
*   **Expiry Alerts**: Widgets highlighting upcoming visa or contract expirations to prevent compliance issues (`ExpiryWidget`).

## User Journey: The Administrator Flow

1.  **Onboarding**: Admin imports a CSV of applicants or creates a single "New Hire" profile.
2.  **Processing**: The teacher is added to the "Recruitment" pipeline. The Admin uses the **Kanban Board** to move them through interview stages.
3.  **Documentation**: Admin uploads required documents (Passport, Degree) to the **Teacher Profile**. The system validates inputs.
4.  **Placement**: Once hired, the teacher is assigned to a **School** and moved to the "Active" status.
5.  **Monitoring**: The **Dashboard** provides daily oversight on who is expiring or needs attention.

## Future Roadmap
*   **Authentication & Roles**: Implement secure login and role-based access control (RBAC).
*   **Teacher Portal**: A self-service frontend for teachers to upload their own documents.
*   **Email Notifications**: Automated distinct email triggers for expiry alerts.
*   **Advanced Reporting**: PDF generation for government compliance reports.
