import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import About from "../pages/About";
import ResetPassword from "../pages/ResetPassword";

import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Info from "../pages/Info";

import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/signin' element={<SignIn />} />
      <Route path='/signup' element={<SignUp />} />

      <Route path='/about' element={<About />} />
      <Route path='/forgot-password' element={<ResetPassword />} />

      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/info' element={<Info />} />

      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
