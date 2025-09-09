import Navbar from "./components/navigation/Navbar";
import TaskHeader from "./components/dashboard-header/DashboardHeader";
import TaskContainer from "./components/task-container/TaskContainer";
import "./App.css";

const App = () => {
  return (
    <>
      <Navbar />
      <TaskHeader />
      <TaskContainer />
    </>
  );
};

export default App;
