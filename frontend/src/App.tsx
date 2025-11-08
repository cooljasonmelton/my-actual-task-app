import Navbar from "./components/navigation/Navbar";
import TaskContainer from "./features/tasks/task-container/TaskContainer";
import { TasksProvider } from "./features/tasks/task-container/state/TasksContext";
import "./App.css";

const App = () => {
  return (
    <TasksProvider>
      <Navbar />
      <TaskContainer />
    </TasksProvider>
  );
};

export default App;
