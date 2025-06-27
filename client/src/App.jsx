// import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/login.jsx';
import Signup from './pages/signup.jsx';
import DashBoard from './pages/dashboard.jsx';
function App() {

  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route
          path='/' element={
            <PrivateRoute>
              <DashBoard/>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App
