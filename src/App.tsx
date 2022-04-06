import UserForm from "./components/Form/UserForm";
import Navbar from "./components/NavbarSection/Navbar";
import './App.css'
import Header from "./components/headerSection/Header";

const App = () => {
  return (
    <div className="">
      <Navbar />
      <Header />
      <UserForm />
    </div>

  );
}

export default App;
