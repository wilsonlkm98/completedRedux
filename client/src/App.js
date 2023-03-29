import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from './pages/Home';
import "./App.css";

const App = () => {
	return (
		<div className="App">
			<Router>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/home" element={<HomePage />} />
				</Routes>
			</Router>
		</div>
	);
};

export default App;
