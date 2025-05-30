# Bread Project

A web application for managing and sharing bread-related information, built with React and modern web technologies.

## Features

- User authentication and authorization
- Bread management (create, read, update, delete)
- Location-based bread sharing
- Image upload and management
- Real-time notifications
- Responsive design
- Modern UI components

## Tech Stack

- **Frontend:**

  - React 18
  - React Router v6
  - CSS Modules
  - Leaflet (for maps)
  - React Hot Toast (for notifications)
  - Date-fns (for date formatting)

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication
  - Multer (for file uploads)

## Project Structure

```
src/
├── api/              # API integration
├── assets/           # Static assets
├── components/       # React components
│   ├── common/       # Reusable components
│   ├── layout/       # Layout components
│   └── pages/        # Page components
├── context/          # React context
├── hooks/            # Custom hooks
├── styles/           # Global styles
└── utils/            # Utility functions
```

## Component Library

The project includes a comprehensive set of reusable components:

### Common Components

- **Avatar**: User avatar with fallback to initials
- **Badge**: Status indicators with multiple variants
- **Button**: Action buttons with loading states
- **ConfirmDialog**: Confirmation dialogs
- **ErrorMessage**: Error message display
- **FormGroup**: Form field wrapper with label and error handling
- **ImageUpload**: Image upload with preview
- **LocationPicker**: Map-based location selection
- **Modal**: Modal dialog
- **NoResults**: Empty state display
- **TimeAgo**: Relative time display
- **Toast**: Notification system
- **ValidationError**: Form validation error display

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bread-project.git
   cd bread-project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Code Style

- Follow the existing component structure
- Use CSS modules for component-specific styles
- Maintain consistent naming conventions
- Write meaningful component and function names

### Component Guidelines

- Keep components focused and single-responsibility
- Use prop-types for type checking
- Implement proper error handling
- Follow accessibility best practices
- Use semantic HTML elements

### CSS Guidelines

- Use CSS modules for component-specific styles
- Follow BEM naming convention
- Maintain consistent spacing and colors
- Use CSS variables for theming
- Implement responsive design patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## User Profile Page

- The profile page is accessible at `/profile` (for your own profile) and `/profile/:userId` (for other users).
- **Note:** Currently, viewing another user's profile uses a workaround: it fetches all users from `/user/all` and filters by ID. This is temporary until a dedicated `/user/:id` endpoint is added to the backend.
- If you encounter issues on the profile page, check the browser console for debugging logs. The profile page logs the loaded user data and any errors during profile or posts loading.

## Responsive Design

The application is built with a mobile-first approach and is fully responsive across all devices. Key features include:

### Breakpoints

- Extra small (xs): 0px and up
- Small (sm): 576px and up
- Medium (md): 768px and up
- Large (lg): 992px and up
- Extra large (xl): 1200px and up
- Extra extra large (xxl): 1400px and up

### Responsive Features

- Fluid typography that scales with viewport size
- Responsive grid system for layout management
- Flexible images and media
- Mobile-first navigation
- Adaptive spacing and padding
- Responsive forms and tables
- Touch-friendly interface elements

### Usage

The project includes utility classes for responsive design:

- `.container`: Responsive container with max-width
- `.grid-responsive`: Responsive grid layout
- `.flex-responsive`: Responsive flexbox layout
- `.text-responsive`: Responsive typography
- `.spacing-responsive`: Responsive spacing
- `.img-responsive`: Responsive images
- `.nav-responsive`: Responsive navigation

### Testing

To ensure proper responsive behavior:

1. Test on multiple devices
2. Use browser dev tools to simulate different screen sizes
3. Verify touch interactions on mobile devices
4. Check content readability at all breakpoints
