import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import NavBar from './NavBar';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Checkbox = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const user = auth.currentUser;

  // Load tasks from Firestore on mount
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const storedTasks = data.todoTasks || [
          { id: Date.now(), label: 'Using ToDo List', checked: false }
        ];
        setTasks(storedTasks);
        localStorage.setItem('todoTasks', JSON.stringify(storedTasks));
      } else {
        const defaultTasks = [{ id: Date.now(), label: 'Using ToDo List', checked: false }];
        await setDoc(ref, { todoTasks: defaultTasks }, { merge: true });
        setTasks(defaultTasks);
        localStorage.setItem('todoTasks', JSON.stringify(defaultTasks));
      }
    };

    fetchTasks();
  }, [user]);

  const saveTasks = async (updatedTasks) => {
    if (!user) return;
    setTasks(updatedTasks);
    localStorage.setItem('todoTasks', JSON.stringify(updatedTasks));
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, { todoTasks: updatedTasks }, { merge: true });
  };
  

  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    const updated = [...tasks, {
      id: Date.now(),
      label: newTask,
      checked: false,
    }];
    saveTasks(updated);
    setNewTask('');
  };

  const handleRemoveTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const toggleChecked = (id) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, checked: !task.checked } : task
    );
  
    saveTasks(updated); // ✅ ensures everything is synced


  };
  

  return (
    <Wrapper>
  <h2 className="todo-title" style={{ textAlign: 'center' }}>ToDo List</h2>
  <div id="checklist">
  {/* Active Tasks */}
  {tasks.filter(t => !t.checked).map((task) => (
    <div className={`task-item`} key={task.id}>
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.checked}
        onChange={() => toggleChecked(task.id)}
      />
      <label htmlFor={`task-${task.id}`}>{task.label}</label>
      <button className="remove-btn" onClick={() => handleRemoveTask(task.id)}>✖</button>
    </div>
  ))}

  {/* Divider + Completed Label */}
  {tasks.some(t => t.checked) && (
    <>
      <hr className="task-divider" />
      <p className="completed-label">Completed Tasks</p>
    </>
  )}

  {/* Completed Tasks */}
  {tasks.filter(t => t.checked).map((task) => (
    <div className="task-item completed" key={task.id}>
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.checked}
        onChange={() => toggleChecked(task.id)}
      />
      <label htmlFor={`task-${task.id}`}>{task.label}</label>
      <button className="remove-btn" onClick={() => handleRemoveTask(task.id)}>✖</button>
      
    </div>
    
  ))}
  
</div>
<div className="add-task">
    <input
      type="text"
      placeholder="New task"
      value={newTask}
      onChange={(e) => setNewTask(e.target.value)}
    />
    <button className="add-btn" onClick={handleAddTask}>Add</button>
  </div>


  <NavBar />
</Wrapper>


  );
};


const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  gap: 20px;


  #checklist {
    --background:rgb(0, 19, 36);
    --text: #f8cc6a;
    --check: #f8cc6a;
    --disabled:rgb(163, 163, 163);
    --width: 100px;
    --height: auto;
    --border-radius: 10px;
    background: var(--background);
    width: 260px;
    border-radius: var(--border-radius);
    box-shadow: 0 10px 30px rgba(65, 72, 86, 0.05);
    padding: 30px 40px;
    display: grid;
    grid-template-columns: 30px auto 20px;
    align-items: center;
    gap: 10px;
  }
.completed-label,
.task-divider {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

  #checklist label {
  color: var(--text);
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  transition: color 0.3s ease;
  margin-right: 10px;
}




  #checklist label::before, #checklist label::after {
    content: "";
    position: absolute;
  }

  #checklist label::before {
    height: 2px;
    width: 8px;
    left: -27px;
    background: var(--check);
    border-radius: 2px;
    transition: background 0.3s ease;
  }

  #checklist label::after {
    height: 4px;
    width: 4px;
    top: 8px;
    left: -25px;
    border-radius: 50%;
  }
.task-item {
  display: contents;
  transition: all 0.4s ease;
}

.task-item.completed {
  opacity: 0.6;
  transform: translateY(10px);
}

.task-divider {
  grid-column: span 3;
  border: none;
  border-top: 1px solid #888;
  margin: 15px 0 5px;
  opacity: 0.4;
}

.completed-label {
  grid-column: span 3;
  color: #f8cc6a;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: left;
}

  #checklist input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    height: 15px;
    width: 15px;
    outline: none;
    border: 0;
    margin: 0 15px 0 0;
    cursor: pointer;
    background: var(--background);
    display: grid;
    align-items: center;
    margin-right: 20px;
  }

 #checklist input[type="checkbox"]::before,
#checklist input[type="checkbox"]::after {
  content: "";
  position: absolute;
  height: 2px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--check);
  border-radius: 2px;
}



  #checklist input[type="checkbox"]::before {
    width: 0px;
    right: 60%;
    transform-origin: right bottom;
  }

  #checklist input[type="checkbox"]::after {
    width: 0px;
    left: 40%;
    transform-origin: left bottom;
  }

  #checklist input[type="checkbox"]:checked::before {
    animation: check-01 0.4s ease forwards;
  }

  #checklist input[type="checkbox"]:checked::after {
    animation: check-02 0.4s ease forwards;
  }

  #checklist input[type="checkbox"]:checked + label {
    color: var(--disabled);
    animation: move 0.3s ease 0.1s forwards;
  }

  #checklist input[type="checkbox"]:checked + label::before {
    background: var(--disabled);
    animation: slice 0.4s ease forwards;
  }

  #checklist input[type="checkbox"]:checked + label::after {
    animation: firework 0.5s ease forwards 0.1s;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: red;
    font-weight: bold;
    cursor: pointer;
  }

  

 .add-task {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  margin: 0 auto 20px auto;
  flex-wrap: wrap; /* optional for small screens */
}

.add-task input {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  background-color: #021d34;
  border: 1px solid #f8cc6a;
  color: #f8cc6a;
  font-size: 14px;
  margin-top:10px
}

.add-task input::placeholder {
  color: #ccc;
  font-style: italic;
}

.add-task button {
margin-top:0px;
  padding: 10px 20px;
  background: #f8cc6a;
  color: #021d34;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.add-task button:hover {
  background-color: #ffda74;
  transform: scale(1.05);
}



  @keyframes move {
    50% {
      padding-left: 8px;
      padding-right: 0px;
    }

    100% {
      padding-right: 4px;
    }
  }

  @keyframes slice {
    60% {
      width: 100%;
      left: 4px;
    }

    100% {
      width: 100%;
      left: -2px;
      padding-left: 0;
    }
  }

  @keyframes check-01 {
    0% {
      width: 4px;
      top: auto;
      transform: rotate(0);
    }

    50% {
      width: 0px;
      top: auto;
      transform: rotate(0);
    }

    51% {
      width: 0px;
      top: 8px;
      transform: rotate(45deg);
    }

    100% {
      width: 5px;
      top: 8px;
      transform: rotate(45deg);
    }
  }

  @keyframes check-02 {
    0% {
      width: 4px;
      top: auto;
      transform: rotate(0);
    }

    50% {
      width: 0px;
      top: auto;
      transform: rotate(0);
    }

    51% {
      width: 0px;
      top: 8px;
      transform: rotate(-45deg);
    }

    100% {
      width: 10px;
      top: 8px;
      transform: rotate(-45deg);
    }
  }

  @keyframes firework {
    0% {
      opacity: 1;
      box-shadow:
        0 0 0 -2px #f8cc6a,
        0 0 0 -2px #f8cc6a,
        0 0 0 -2px #f8cc6a,
        0 0 0 -2px #f8cc6a,
        0 0 0 -2px #f8cc6a,
        0 0 0 -2px #f8cc6a;
    }

    30% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      box-shadow:
        0 -15px 0 0px #f8cc6a,
        14px -8px 0 0px #f8cc6a,
        14px 8px 0 0px #f8cc6a,
        0 15px 0 0px #f8cc6a,
        -14px 8px 0 0px #f8cc6a,
        -14px -8px 0 0px #f8cc6a;
    }
        .todo-title {
  text-align: center;
  font-size: 20px;
  color: #f8cc6a;
  margin-bottom: 16px;
  grid-column: span 3; /* spans full width of grid */
}

.add-task .add-btn {
  background-color: #f8cc6a;
  color: #021d34;
  font-weight: bold;
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  transition: all 0.25s ease;
}



  }
`;

export default Checkbox;
