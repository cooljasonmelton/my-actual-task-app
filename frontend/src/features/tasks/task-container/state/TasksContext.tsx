/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { TaskType } from "@/types";

type TasksState = {
  tasks: TaskType[];
  error: string | null;
  isLoading: boolean;
};

type TasksAction =
  | { type: "SET_TASKS"; tasks: TaskType[] }
  | {
      type: "APPLY_TASKS_UPDATER";
      updater: (previousTasks: TaskType[]) => TaskType[];
    }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_LOADING"; isLoading: boolean };

const initialState: TasksState = {
  tasks: [],
  error: null,
  isLoading: false,
};

const TasksStateContext = createContext<TasksState | undefined>(undefined);
const TasksDispatchContext =
  createContext<Dispatch<TasksAction> | undefined>(undefined);

const tasksReducer = (state: TasksState, action: TasksAction): TasksState => {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.tasks };
    case "APPLY_TASKS_UPDATER":
      return { ...state, tasks: action.updater(state.tasks) };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(tasksReducer, initialState);

  return (
    <TasksStateContext.Provider value={state}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksStateContext.Provider>
  );
};

export const useTasksState = (): TasksState => {
  const context = useContext(TasksStateContext);
  if (!context) {
    throw new Error("useTasksState must be used within a TasksProvider");
  }
  return context;
};

const useTasksDispatch = () => {
  const context = useContext(TasksDispatchContext);
  if (!context) {
    throw new Error("useTasksDispatch must be used within a TasksProvider");
  }
  return context;
};

type SetTasks = (
  value: TaskType[] | ((previousTasks: TaskType[]) => TaskType[])
) => void;

export const useTasksActions = () => {
  const dispatch = useTasksDispatch();

  const setTasks = useCallback<SetTasks>(
    (value) => {
      if (typeof value === "function") {
        dispatch({
          type: "APPLY_TASKS_UPDATER",
          updater: value as (previousTasks: TaskType[]) => TaskType[],
        });
      } else {
        dispatch({ type: "SET_TASKS", tasks: value });
      }
    },
    [dispatch]
  );

  const setError = useCallback(
    (error: string | null) => {
      dispatch({ type: "SET_ERROR", error });
    },
    [dispatch]
  );

  const setIsLoading = useCallback(
    (isLoading: boolean) => {
      dispatch({ type: "SET_LOADING", isLoading });
    },
    [dispatch]
  );

  return useMemo(
    () => ({
      setTasks,
      setError,
      setIsLoading,
    }),
    [setTasks, setError, setIsLoading]
  );
};

export const useTasksSelectors = () => {
  const { tasks, error, isLoading } = useTasksState();

  return {
    tasks,
    error,
    isLoading,
  };
};
