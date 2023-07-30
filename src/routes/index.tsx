import React from 'react';
import { Switch } from 'react-router-dom';

import Route from './Route';

import Home from '../pages/Home';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import About from '../pages/About';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Info from '../pages/Info';

import NotFound from '../pages/NotFound';

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route path='/' exact component={Home} />
      <Route path='/signin' component={SignIn} />
      <Route path='/signup' component={SignUp} />
      <Route path='/about' component={About} />
      
      <Route path='/dashboard' component={Dashboard} isPrivate />
      <Route path='/profile' component={Profile} isPrivate />
      <Route path='/info' component={Info} isPrivate />

      <Route component={NotFound}/>
    </Switch>
  )
};

export default Routes;