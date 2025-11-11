import Navbar from "./components/navigation/Navbar";
import TaskContainer from "./features/tasks/components/task-board/TaskContainer";
import { TasksProvider } from "./features/tasks/context/TasksContext";
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
