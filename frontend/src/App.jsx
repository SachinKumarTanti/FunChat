import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Navbar from "./components/Navbar";

import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import FriendRequestPage from './pages/FriendRequestPage';

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import {Loader} from 'lucide-react'
import { Toaster } from "react-hot-toast";
import UserSearchResults from './components/UserSearchResults';


const App = () => {

  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex justify-center items-center h-screen' data-theme={theme}> 
      <Loader className='animate-spin size-10'/>
      </div>
    )
  }

  return (
   <div data-theme={theme}>
    <Navbar />
    <UserSearchResults/>
    <Routes>
      <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
      <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
      <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
      <Route path='/settings' element={<SettingsPage />} />
      <Route path='/profile' element={authUser   ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path='/userProfile/:id' element={authUser ? <UserProfilePage /> : <Navigate to="/login" />} />
      <Route path='/friend-requests' element={authUser ? <FriendRequestPage /> : <Navigate to="/login" />} />
    </Routes>
    <Toaster />
   </div>
  );
};

export default App;