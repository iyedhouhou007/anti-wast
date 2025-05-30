import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { userAPI } from "./api/userAPI";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import CreatePost from "./components/bread/CreatePost";
import UserProfile from "./components/UserProfile";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";
import NotificationsList from "./components/notifications/NotificationsList";
import Navbar from "./components/NavBar";
import PostDetail from "./components/bread/PostDetail";
import MessagesPage from "./pages/MessagesPage";
import EditPost from "./pages/EditPost";
import ReservedPosts from "./pages/ReservedPosts";
import MyPosts from "./pages/MyPosts";
import "./App.css";
import MapLinkGenerator from "./pages/testLocation/MapLinkGenerator";
import AddPhoto from "./components/auth/AddPhoto"; // Import the AddPhoto component

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  return (
    <Router>
      <div id="webcrumbs" className="min-h-screen bg-gray-50">
        <div className="w-full max-w-[1280px] mx-auto p-6">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/add-photo" element={<AddPhoto />} />{" "}
              {/* Add the new route here */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/bread/:id" element={<PostDetail />} />
              <Route path="/map" element={<MapLinkGenerator />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/posts/create" element={<CreatePost />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:userId" element={<MessagesPage />} />
                <Route path="/posts/edit/:id" element={<EditPost />} />
                <Route path="/posts/update/:id" element={<EditPost />} />
                <Route path="/reserved-posts" element={<ReservedPosts />} />
                <Route path="/my-posts" element={<MyPosts />} />
                <Route
                  path="/notifications"
                  element={
                    <div className="container mx-auto px-4 py-8">
                      <NotificationsList />
                    </div>
                  }
                />
              </Route>
              {/* 404 Handling */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
