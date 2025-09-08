import Navbar from "./components/navigation/Navbar";
import TaskHeader from "./components/task-header/TaskHeader";
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
