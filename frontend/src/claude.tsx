// import React, { useState } from "react";
// import {
//   Plus,
//   Star,
//   Tag,
//   ChevronDown,
//   ChevronRight,
//   Check,
//   Circle,
// } from "lucide-react";

// const TodoApp = () => {
//   const [tasks, setTasks] = useState([
//     {
//       id: 1,
//       title: "Refactor authentication system",
//       description:
//         "Need to:\n• Update JWT handling\n• Add refresh token logic\n• Test edge cases\n• Document the changes",
//       tags: ["work", "backend"],
//       isImportant: true,
//       status: "next",
//       createdAt: "2025-09-01",
//       subtasks: [
//         { id: 1, title: "Research JWT best practices", completed: true },
//         { id: 2, title: "Implement refresh tokens", completed: false },
//         { id: 3, title: "Write tests", completed: false },
//       ],
//       expanded: false,
//     },
//     {
//       id: 2,
//       title: "Plan weekend hiking trip",
//       description: "Check weather, pack gear, plan route through the mountains",
//       tags: ["personal", "outdoors"],
//       isImportant: false,
//       status: "next",
//       createdAt: "2025-09-02",
//       subtasks: [],
//       expanded: false,
//     },
//     {
//       id: 3,
//       title: "Review team performance docs",
//       description:
//         "Annual review cycle coming up - need to gather feedback and prepare notes",
//       tags: ["work", "management"],
//       isImportant: false,
//       status: "ongoing",
//       createdAt: "2025-08-28",
//       subtasks: [],
//       expanded: false,
//     },
//   ]);

//   const [activeTab, setActiveTab] = useState("next");
//   const [keepAwake, setKeepAwake] = useState(false);
//   const [newTaskTitle, setNewTaskTitle] = useState("");

//   const toggleTask = (taskId) => {
//     setTasks(
//       tasks.map((task) =>
//         task.id === taskId ? { ...task, expanded: !task.expanded } : task
//       )
//     );
//   };

//   const toggleSubtask = (taskId, subtaskId) => {
//     setTasks(
//       tasks.map((task) =>
//         task.id === taskId
//           ? {
//               ...task,
//               subtasks: task.subtasks.map((sub) =>
//                 sub.id === subtaskId
//                   ? { ...sub, completed: !sub.completed }
//                   : sub
//               ),
//             }
//           : task
//       )
//     );
//   };

//   const addTask = () => {
//     if (!newTaskTitle.trim()) return;

//     const newTask = {
//       id: Date.now(),
//       title: newTaskTitle,
//       description: "",
//       tags: [],
//       isImportant: false,
//       status: activeTab,
//       createdAt: new Date().toISOString().split("T")[0],
//       subtasks: [],
//       expanded: false,
//     };

//     setTasks([newTask, ...tasks]);
//     setNewTaskTitle("");
//   };

//   const handleKeepAwake = () => {
//     setKeepAwake(!keepAwake);
//     // In a real app, this would use the Screen Wake Lock API
//     if (!keepAwake) {
//       console.log("Requesting wake lock...");
//     } else {
//       console.log("Releasing wake lock...");
//     }
//   };

//   const filteredTasks = tasks.filter((task) => task.status === activeTab);
//   const importantTasks = filteredTasks.filter((task) => task.isImportant);
//   const regularTasks = filteredTasks.filter((task) => !task.isImportant);
//   const sortedTasks = [...importantTasks, ...regularTasks];

//   const tabs = [
//     {
//       id: "next",
//       label: "Next",
//       count: tasks.filter((t) => t.status === "next").length,
//     },
//     {
//       id: "ongoing",
//       label: "Ongoing",
//       count: tasks.filter((t) => t.status === "ongoing").length,
//     },
//     {
//       id: "backburner",
//       label: "Backburner",
//       count: tasks.filter((t) => t.status === "backburner").length,
//     },
//     {
//       id: "finished",
//       label: "Finished",
//       count: tasks.filter((t) => t.status === "finished").length,
//     },
//   ];

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
//       style={{
//         backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.02) 2px, transparent 0)`,
//         backgroundSize: "50px 50px",
//       }}
//     >
//       {/* Header */}
//       <div className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
//         <div className="max-w-4xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-100">My Tasks</h1>
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={handleKeepAwake}
//                 className={`px-3 py-1 rounded text-sm font-medium transition-all ${
//                   keepAwake
//                     ? "bg-teal-400/20 text-teal-300 border border-teal-400/30"
//                     : "bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500"
//                 }`}
//               >
//                 {keepAwake ? "Stay Awake: ON" : "Keep Awake"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-6 py-6">
//         {/* Tabs */}
//         <div className="flex gap-1 mb-6 bg-gray-800/30 p-1 rounded-lg border border-gray-700/50">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
//                 activeTab === tab.id
//                   ? "bg-gray-700 text-gray-100 shadow-lg"
//                   : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/30"
//               }`}
//             >
//               {tab.label}
//               <span className="bg-gray-600 text-xs px-1.5 py-0.5 rounded">
//                 {tab.count}
//               </span>
//             </button>
//           ))}
//         </div>

//         {/* Quick Add */}
//         <div className="mb-6">
//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={newTaskTitle}
//               onChange={(e) => setNewTaskTitle(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && addTask()}
//               placeholder="Add a new task..."
//               className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50"
//             />
//             <button
//               onClick={addTask}
//               className="px-4 py-3 bg-teal-500 hover:bg-teal-400 text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2"
//             >
//               <Plus size={18} />
//               Add
//             </button>
//           </div>
//         </div>

//         {/* Tasks */}
//         <div className="space-y-3">
//           {sortedTasks.map((task) => (
//             <div
//               key={task.id}
//               className="bg-gray-800/40 border border-gray-700/60 rounded-lg overflow-hidden backdrop-blur-sm"
//             >
//               {/* Task Header */}
//               <div
//                 className="p-4 cursor-pointer hover:bg-gray-700/20 transition-colors"
//                 onClick={() => toggleTask(task.id)}
//               >
//                 <div className="flex items-start gap-3">
//                   <button className="mt-1 text-gray-500 hover:text-gray-300">
//                     {task.expanded ? (
//                       <ChevronDown size={18} />
//                     ) : (
//                       <ChevronRight size={18} />
//                     )}
//                   </button>

//                   <div className="flex-1">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex items-center gap-3">
//                         {task.isImportant && (
//                           <Star
//                             size={16}
//                             className="text-yellow-400 fill-yellow-400 mt-0.5"
//                           />
//                         )}
//                         <h3 className="font-medium text-gray-100">
//                           {task.title}
//                         </h3>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {task.tags.map((tag) => (
//                           <span
//                             key={tag}
//                             className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     {task.subtasks.length > 0 && (
//                       <div className="mt-2 text-sm text-gray-400">
//                         {task.subtasks.filter((s) => s.completed).length} /{" "}
//                         {task.subtasks.length} subtasks completed
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Expanded Content */}
//               {task.expanded && (
//                 <div className="px-4 pb-4 border-t border-gray-700/50 bg-gray-900/20">
//                   {task.description && (
//                     <div className="mt-4 mb-4">
//                       <div className="text-sm text-gray-300 whitespace-pre-line bg-gray-800/50 p-3 rounded border border-gray-700/50">
//                         {task.description}
//                       </div>
//                     </div>
//                   )}

//                   {task.subtasks.length > 0 && (
//                     <div className="mt-4">
//                       <h4 className="text-sm font-medium text-gray-300 mb-2">
//                         Subtasks:
//                       </h4>
//                       <div className="space-y-2">
//                         {task.subtasks.map((subtask) => (
//                           <div
//                             key={subtask.id}
//                             className="flex items-center gap-3 text-sm"
//                           >
//                             <button
//                               onClick={() => toggleSubtask(task.id, subtask.id)}
//                               className="text-teal-400 hover:text-teal-300"
//                             >
//                               {subtask.completed ? (
//                                 <Check size={16} />
//                               ) : (
//                                 <Circle size={16} />
//                               )}
//                             </button>
//                             <span
//                               className={`${
//                                 subtask.completed
//                                   ? "text-gray-500 line-through"
//                                   : "text-gray-300"
//                               }`}
//                             >
//                               {subtask.title}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {sortedTasks.length === 0 && (
//           <div className="text-center py-12 text-gray-500">
//             <div className="text-6xl mb-4">✨</div>
//             <p>No tasks in {activeTab} yet</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TodoApp;
