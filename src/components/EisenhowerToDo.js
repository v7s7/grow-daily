import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import styled from "styled-components";
import NavBar from "./NavBar";

const categoryColors = {
  urgentImportant: "#7ed957",
  importantNotUrgent: "#0cc0df",
  urgentNotImportant: "#ffde59",
  notUrgentNotImportant: "#ff3131",
};

const labels = {
  en: {
    urgentImportant: "Urgent & Important",
    importantNotUrgent: "Important but Not Urgent",
    urgentNotImportant: "Urgent but Not Important",
    notUrgentNotImportant: "Not Urgent & Not Important",
    placeholder: "Enter task...",
    add: "Add",
    edit: "Edit",
    save: "Save",
    delete: "Delete",
    toggleEdit: "Edit Mode",
    viewMode: "View Mode",
  },
  ar: {
    urgentImportant: "عاجل ومهم",
    importantNotUrgent: "مهم لكن غير عاجل",
    urgentNotImportant: "عاجل لكن غير مهم",
    notUrgentNotImportant: "غير عاجل وغير مهم",
    placeholder: "أدخل المهمة...",
    add: "أضف",
    edit: "تعديل",
    save: "حفظ",
    delete: "حذف",
    toggleEdit: "وضع التعديل",
    viewMode: "وضع العرض",
  },
};

export default function EisenhowerToDo() {
  const user = auth.currentUser;
  const [tasks, setTasks] = useState({});
  const [newTask, setNewTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("urgentImportant");
  const [editing, setEditing] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const langKey = localStorage.getItem("lang");
  const language = labels[langKey] ? langKey : "en";
  const t = labels[language];

  useEffect(() => {
    if (!user) return;
    const loadTasks = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data().eisenhowerTasks || {};
        setTasks(data);
      }
    };
    loadTasks();
  }, [user]);

  const saveToFirestore = async (updatedTasks) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { eisenhowerTasks: updatedTasks }, { merge: true });
  };

  const handleAdd = () => {
    if (!newTask.trim()) return;
    const updated = {
      ...tasks,
      [selectedCategory]: [
        { id: Date.now(), text: newTask, done: false },
        ...(tasks[selectedCategory] || []),
      ],
    };
    setTasks(updated);
    setNewTask("");
    saveToFirestore(updated);
  };

  const toggleDone = (cat, id) => {
    const updated = {
      ...tasks,
      [cat]: tasks[cat].map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    };
    setTasks(updated);
    saveToFirestore(updated);
  };

  const handleDelete = (cat, id) => {
    const updated = {
      ...tasks,
      [cat]: tasks[cat].filter((t) => t.id !== id),
    };
    setTasks(updated);
    saveToFirestore(updated);
  };

  const handleEdit = (cat, id, newText) => {
    const updated = {
      ...tasks,
      [cat]: tasks[cat].map((t) =>
        t.id === id ? { ...t, text: newText } : t
      ),
    };
    setTasks(updated);
    saveToFirestore(updated);
    setEditing(null);
  };

  return (
    <Container>
<Title>{language === "ar" ? "التحكم بالمهام" : "Mission Control"}</Title>

      <div className="add-task">
        <Input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder={t.placeholder}
        />
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
{["urgentImportant", "importantNotUrgent", "urgentNotImportant", "notUrgentNotImportant"].map((key) => (
            <option key={key} value={key}>
              {t[key]}
            </option>
          ))}
        </Select>
        <Button onClick={handleAdd}>{t.add}</Button>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? t.viewMode : t.toggleEdit}
        </Button>
      </div>

      {Object.keys(categoryColors).map((catKey) => (
        <CategoryBox key={catKey} color={categoryColors[catKey]}>
          <h3>{t[catKey]}</h3>
          <TaskList>
            {(tasks[catKey] || []).map((task) => (
              <TaskItem key={task.id} done={task.done}>
                {editing === task.id ? (
                  <Input
                    value={task.text}
                    onChange={(e) => handleEdit(catKey, task.id, e.target.value)}
                    onBlur={() => setEditing(null)}
                    autoFocus
                  />
                ) : (
<TaskText
  done={task.done}
  color={categoryColors[catKey]} 
  onClick={() => toggleDone(catKey, task.id)}
>
  {task.text}
</TaskText>

                )}
                {editMode && (
                  <>
                    <Button small onClick={() => setEditing(task.id)}>
                      {t.edit}
                    </Button>
                    <Button small onClick={() => handleDelete(catKey, task.id)}>
                      {t.delete}
                    </Button>
                  </>
                )}
              </TaskItem>
            ))}
          </TaskList>
        </CategoryBox>
      ))}    <NavBar />

    </Container>
  );
}


const Container = styled.div`
  font-family: 'Cairo', 'Inter', sans-serif;    
  max-width: 480px;
  margin: auto;
  padding: 24px;
  background: #10172a;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  color: white;
 h3 {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6); /* translucent white text */
  margin-bottom: 10px;
  display: inline-block;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3); /* translucent underline */
}
    

`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border-radius: 8px;
  border: 1px solid #444;
  background: #0f1b2d;
  color: white;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #0f1b2d;
  color: white;
`;

const Button = styled.button`
  padding: ${(props) => (props.small ? "4px 8px" : "10px 16px")};
  margin: 4px;
  background-color: #f5c84c;
  color: #021d34;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: ${(props) => (props.small ? "0.8rem" : "1rem")};
  &:hover {
    background-color: #ffda74;
  }
`;

const CategoryBox = styled.div`
  border: 2px solid ${(props) => props.color};
  background-color: transparent;
  padding: 16px;
  border-radius: 10px;
  margin-top: 20px;
  color: ${(props) => props.color};
  
`;


const TaskList = styled.ul`

  list-style: none;
  padding: 0;
`;

const TaskItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;
const TaskText = styled.span`
  position: relative;
  color: ${(props) => props.color};  /* text color = group color */
  cursor: pointer;
  user-select: none;
  padding-left: 20px;
  transition: all 0.3s ease;
  display: inline-block;

  &::before {
    content: "";
    position: absolute;
    height: 2px;
    width: 8px;
    left: 0;
    bottom: 12px;
    background: ${(props) => props.color};
    border-radius: 2px;
    transition: background 0.3s ease;

  }

  &::after {
    content: "";
    position: absolute;
    height: 4px;
    width: 4px;
    bottom: -4px;
    left: 2px;
    border-radius: 50%;
    background: ${(props) => props.color};
    opacity: ${(props) => (props.done ? 0.4 : 0)};
    transition: opacity 0.4s ease;
  }

  ${(props) =>
    props.done &&
    `
    animation: moveText 0.3s ease 0.1s forwards;

    &::before {
      animation: sliceLine 0.4s ease forwards;
    }

    &::after {
      animation: firework 0.5s ease forwards 0.1s;
    }
  `}

  @keyframes moveText {
    50% {
      padding-left: 4px;
    }
    100% {
      padding-right: 2px;
    }
  }

  @keyframes sliceLine {
    60% {
      width: 100%;
      left: 0;
    }

    100% {
      width: 100%;
      left: 0;
    }
  }

  @keyframes firework {
    0% {
      opacity: 1;
      box-shadow:
        0 0 0 -2px ${(props) => props.color},
        0 0 0 -2px ${(props) => props.color},
        0 0 0 -2px ${(props) => props.color},
        0 0 0 -2px ${(props) => props.color},
        0 0 0 -2px ${(props) => props.color},
        0 0 0 -2px ${(props) => props.color};
    }

    30% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      box-shadow:
        0 -15px 0 0px ${(props) => props.color},
        14px -8px 0 0px ${(props) => props.color},
        14px 8px 0 0px ${(props) => props.color},
        0 15px 0 0px ${(props) => props.color},
        -14px 8px 0 0px ${(props) => props.color},
        -14px -8px 0 0px ${(props) => props.color};
    }
  }
`;
