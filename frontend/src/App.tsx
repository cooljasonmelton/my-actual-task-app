import Navbar from "./components/navigation/Navbar";
import DashboardHeader from "./components/dashboard-header/DashboardHeader";
import TaskContainer from "./components/task-container/TaskContainer";
import "./App.css";

const App = () => {
  return (
    <>
      <Navbar />
      <TaskContainer />
    </>
  );
};

export default App;
