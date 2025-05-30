```markdown
# Anti-Wast

Anti-Wast is a full-stack MERN web platform designed to combat food waste by connecting individuals or businesses who have surplus food with recipients in need. The platform promotes sustainability by facilitating food sharing, community engagement, and reducing landfill waste.

## 🌍 Project Purpose

Food waste is a growing global issue that affects both the environment and society. Anti-Wast aims to:
- Reduce food waste and its environmental impact.
- Support people with limited access to food.
- Encourage a culture of sustainability through local action.

## 🛠️ Tech Stack

| Layer      | Technology                            |
|------------|----------------------------------------|
| Frontend   | React.js, CSS Modules, Axios, Socket.IO-client |
| Backend    | Node.js, Express.js, MongoDB, Mongoose |
| Realtime   | Socket.IO                              |
| Auth       | JWT (JSON Web Tokens), bcrypt          |
| Uploads    | Multer                                 |
| Docs       | Swagger (API documentation)            |

## 📦 Project Structure

```

anti-wast/
├── client/     # React frontend (designed by Seif Elisslem)
├── server/     # Node/Express backend (developed by Houhou Mohamed Iyad)
└── README.md

````

## ✨ Features

- User registration, login, and profile management (JWT-based)
- Post and browse available surplus food
- Reserve and chat in real time with donors or recipients
- Upload food images with secure file handling (Multer)
- API secured with JWT and bcrypt hashing
- RESTful API documentation using Swagger
- Input validation and error handling

## 📸 Screenshots

*(Add screenshots here later if you'd like)*

## 🚀 Getting Started

Clone the project and install dependencies for both frontend and backend:

```bash
# Clone the repository
git clone https://github.com/your-username/anti-wast.git
cd anti-wast

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
````

### 🔧 Running the App

Start backend:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd ../client
npm run dev
```

Make sure MongoDB is running on your machine or configure your `.env` file.

## 📬 API Documentation

The backend API is documented using Swagger. To access the docs:

* Start the backend server.
* Navigate to `http://localhost:5000/api-docs` in your browser.

## 🤝 Credits

* **Frontend Design:** Seif Elisslem
* **Backend Development & Realtime Features:** Houhou Mohamed Iyad Abdelhadi

## 🔒 Security & Best Practices

* Passwords are hashed using `bcrypt`.
* Auth tokens use `JWT`.
* Inputs are validated to avoid injection attacks.
* App is prepared for HTTPS deployment.

## 📈 Future Improvements

* Mobile application version
* Integration with local delivery services
* Gamification and rewards system
* Advanced analytics
* Multi-language support

## 📃 License

This project is currently not licensed. Contact the contributors for usage permissions.

```

---

Let me know if you want:
- Markdown badges (e.g. `Made with React`, `Node.js`, `MongoDB`, etc.)
- Screenshots added
- French or Arabic translation
- A GitHub Pages or deployment guide

Happy to help!
```
