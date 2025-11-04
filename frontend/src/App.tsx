import Navbar from "./components/navigation/Navbar";
import TaskContainer from "./features/tasks/task-container/TaskContainer";
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
