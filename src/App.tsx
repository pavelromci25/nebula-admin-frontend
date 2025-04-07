import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  console.log('App: Rendering App component');
  return (
    <div className="app-container">
      <AdminDashboard />
    </div>
  );
}

export default App;