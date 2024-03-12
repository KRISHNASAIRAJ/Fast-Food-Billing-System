# Fast Food Billing System

## Introduction

### Purpose
The purpose of the Fast Food Billing System is to streamline and automate the billing process for a fast-food restaurant. The system aims to provide a user-friendly interface for both administrators and cashiers, facilitating efficient order management and enhancing overall customer satisfaction.

### Scope
The system includes two main interfaces: one for the admin responsible for managing the menu, orders, and generating reports, and the other for the cashier who handles order processing at the shop.

### Audience, Definitions, Acronyms, and Abbreviations
#### Audience Definitions
- **Admin**: Refers to the system administrator responsible for managing the overall system.
- **Cashier**: Refers to the staff member taking and processing customer orders at the shop.

#### Acronyms and Abbreviations
- **UI**: User Interface
- **API**: Application Programming Interface
- **QR**: Quick Response

### References
Document

### Technologies to be Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Flask
- **Database**: MongoDB

### Overview
The system will consist of two main interfaces - Admin Panel and Cashier Panel. Admins will manage the menu, view order history, and generate reports. Cashiers will handle order processing, generate receipts, and scan QR codes for order confirmation while delivery.

## Overall Description

### Product Perspective
The system interacts with users through web interfaces and connects to a MongoDB database to store and retrieve data.

### Product Functions
- **Admin Panel**: Manage menu, view order history, generate reports.
- **Cashier Panel**: Take orders, view order status, generate receipts.

### User Characteristics
- **Admins**: Technically proficient with system management.
- **Cashiers**: Familiarity with basic system functionalities.

### Constraints
Compatibility with modern web browsers.

### Operating Environment
The system will operate in a web-based environment and will be compatible with major web browsers (Brave, Chrome, Firefox, Safari).

## Specific Requirements

### Functional Requirements

#### Admin Panel
- **Login**: Authenticate admin credentials.
- **Dashboard**: Display system statistics and important metrics.
- **Manage Menu**: Add, edit, and delete items from the menu.
- **View Order History**: Display comprehensive order history with filtering options.
- **Generate Reports**: Create sales, revenue, and popular items reports.

#### Cashier Panel
- **Login**: Authenticate cashier credentials.
- **Order Management**: Take new orders, modify orders, handle cancellations.
- **View Order Status**: Display order statuses in real-time.
- **Generate Receipts**: Automatically generate receipts after payment confirmation.
- **QR Code Scanning**: Scan QR codes to confirm order delivery.

### Non-functional Requirements

#### Performance Requirements
- The system should handle concurrent user interactions.
- Response time for UI actions should be within 2 seconds.

#### Safety Requirements
- The system should ensure data integrity and prevent unauthorized access.

#### Security Requirements
- Use HTTPS to encrypt data during transmission.
- Implement secure authentication mechanisms.

#### Error Handling
- Provide informative error messages for users.
- Log errors for system administrators.

## Interfaces and Possible Scenarios

### Interfaces for Admin

#### Login
- **Input**: Admin username, password
- **Output**: Dashboard

#### Dashboard
- **Display**: System statistics and important metrics.
- **Actions**: Navigation to menu management, order history, and reports.

#### Manage Menu
- **Actions**:
  - Add new items to the menu with details (name, description, price).
  - Edit existing menu items.
  - Delete items from the menu.

#### View Order History
- **Display**:
  - Comprehensive order history with filtering options.
- **Actions**:
  - Filter orders by date, status, or other parameters.
  - View detailed information for each order.

#### Generate Reports
- **Actions**:
  - Generate sales, revenue, and popular items reports.
  - Display visualizations for better insights.

## Other Requirements and Visualization

### Appendix 1: Username and Password
- **Username Requirement**: Username must be unique for all users.
- **Password Requirement**: Password must be at least 6, at most 20 characters.

### Appendix 2: Information Requested While Ordering (from Customer)
- Users must provide the following information during ordering:
  - Name
  - Surname
  - Gender
  - Phone Number
  - Payment Type
