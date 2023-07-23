// Array to store tasks
var tasks = [];
var activityLogs = [];
var reminders = [];

//add with fetch api
/*
fetch('https://jsonplaceholder.typicode.com/todos')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.json();
    })
    .then(data => {
        // Process the retrieved data
        console.log(data);
        data.forEach(element => {
            tasks.push(element.title)
        });
        showTasks();
    })
    .catch(error => {
        // Handle any errors that occurred during the request
        console.error('Error:', error);
    });
*/

// Function to add a new task
var taskbutton = document.getElementById("taskbutton");
var filterbutton = document.getElementById("filter");
var category = document.getElementById("categoryInput");
var prior = document.getElementById("priority");
var dates = document.getElementById("DateInput");


taskbutton.onclick = function () {
    var input = document.getElementById("taskInput");
    var value = input.value;
    var catvalue = category.value;
    var priority = prior.value;
    var dueDate = dates.value;

    if (value === "" || category === "" || priority === "" || dueDate === "") {
        alert("Please enter in proper way!");
        return;
    }

    tasks.push({ task: value, category: catvalue, priority: priority, dueDate: dueDate, completed: false, subtasks: [] });
    activityLogs.push({ type: "add", task: value, timestamp: new Date() });

    saveToLocalStorage();

    showTasks();

    input.value = "";
    category.value = "";
    priority.value = "";
    dates.value = "";
};

// Function to show my tasks
function showTasks() {
    var taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    for (var i = 0; i < tasks.length; i++) {
        var li = document.createElement("li");
        // var textNode = document.createElement("span");
        li.innerHTML = i + 1 + ". " + tasks[i].task + " [category : " + tasks[i].category + "]" + " [Priority : " + tasks[i].priority + "]" + "  Due: " + tasks[i].dueDate;
        //li.appendChild(textNode);

        //Mark as done
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tasks[i].completed;

        function Handler(index, checkbox) {
            return function () {
                tasks[index].completed = checkbox.checked;
                Style(li, tasks[index].completed);
            };
        }


        checkbox.addEventListener("change", Handler(i, checkbox));

        li.appendChild(checkbox);

        //Due Date
        /*
        var duedate = document.createElement("input");
        duedate.type = "date";
        li.appendChild(duedate);
        */


        //Delete button
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        deleteButton.setAttribute("data-index", i);
        deleteButton.onclick = function () {
            var index = this.getAttribute("data-index");
            var deletedTask = tasks[index].task;
            tasks.splice(index, 1);
            activityLogs.push({ type: "delete", task: deletedTask, timestamp: new Date() });
            saveToLocalStorage();
            showTasks();
            viewBacklogs();
            renderActivityLogs();
        };
        li.appendChild(deleteButton);


        //Edit button
        var editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        editButton.setAttribute("data-index", i);
        editButton.onclick = function () {
            var index = this.getAttribute("data-index");
            var oldTask = tasks[index].task;
            var updatedTask = prompt("Enter updated task:", tasks[index].task);
            if (updatedTask) {
                tasks[index].task = updatedTask;
                activityLogs.push({ type: "edit", task: oldTask, newTask: updatedTask, timestamp: new Date() });
                saveToLocalStorage();
                showTasks();
                viewBacklogs();
                renderActivityLogs();
            }
        };
        li.appendChild(editButton);

        //Subtasks
        var addSubtaskInput = document.createElement("input");
        addSubtaskInput.type = "text";
        addSubtaskInput.placeholder = "Enter subtask";
        li.appendChild(addSubtaskInput);

        function Gohandle() {
            var subtask = addSubtaskInput.value;
            if (subtask !== "") {
                tasks[i].subtasks.push({ subtask: subtask, completed: false });
                addSubtaskInput.value = "";
                renderSubtasks(li, tasks[i].subtasks);
            }
        }

        var addSubtaskButton = document.createElement("button");
        addSubtaskButton.innerHTML = "Add Subtask";
        addSubtaskButton.addEventListener("click", Gohandle());
        li.appendChild(addSubtaskButton);

        var subtaskList = document.createElement("ul");
        subtaskList.className = "subtasks";
        li.appendChild(subtaskList);

        taskList.appendChild(li);
        Style(li, tasks[i].completed);

        renderSubtasks(li, tasks[i].subtasks);


    }
}

function renderSubtasks(taskLi, subtasks) {
    var subtaskList = taskLi.querySelector(".subtasks");
    subtaskList.innerHTML = "";

    subtasks.forEach((subtask, subIndex) => {
        var subtaskLi = document.createElement("li");

        var subtaskCheckbox = document.createElement("input");
        subtaskCheckbox.type = "checkbox";
        subtaskCheckbox.checked = subtask.completed;
        subtaskCheckbox.addEventListener("change", () => {
            tasks[index].subtasks[subIndex].completed = subtaskCheckbox.checked;
            Style(subtaskLi, subtask.completed);
        });
        subtaskLi.appendChild(subtaskCheckbox);

        var subtaskTextNode = document.createElement("span");
        subtaskTextNode.innerHTML = subtask.subtask;
        subtaskLi.appendChild(subtaskTextNode);

        subtaskList.appendChild(subtaskLi);
        Style(subtaskLi, subtask.completed);
    });
}

function Style(li, style) {
    if (style) {
        li.style.textDecoration = "line-through";
    } else {
        li.style.textDecoration = "none";
    }
}

//Filtering by filterbutton
filterbutton.onclick = function () {
    var dueFrom = document.getElementById("dueDateFrom").value;
    var dueTo = document.getElementById("dueDateTo").value;
    var filter_category = document.getElementById("filterCategory").value;
    var filter_priority = document.getElementById("filterPriority").value;

    var filteredTasks = tasks.filter((item) => {
        var dueDate = new Date(item.dueDate);
        var from = new Date(dueFrom);
        var to = new Date(dueTo);

        if (dueFrom && dueDate > from) {
            return false;
        }

        if (dueTo && dueDate < to) {
            return false;
        }

        if (filter_category && item.category !== filter_category) {
            return false;
        }

        if (filter_priority && item.priority !== filter_priority) {
            return false;
        }

        return true;
    });

    showfilter(filteredTasks);
}

function showfilter(filteredTasks) {
    var taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    for (var i = 0; i < filteredTasks.length; i++) {
        var li = document.createElement("li");
        // var textNode = document.createElement("span");
        li.innerHTML = i + 1 + ". " + filteredTasks[i].task + "[category : " + filteredTasks[i].category + "]" + "[Priority : " + filteredTasks[i].priority + "]" + " Due: " + filteredTasks[i].dueDate;
        //li.appendChild(textNode);

        //Mark as done
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = filteredTasks[i].completed;

        function Handler(index, checkbox) {
            return function () {
                filteredTasks[index].completed = checkbox.checked;
                Style(li, filteredTasks[index].completed);
            };
        }

        checkbox.addEventListener("change", Handler(i, checkbox));

        li.appendChild(checkbox);

        //Due Date
        /*
        var duedate = document.createElement("input");
        duedate.type = "date";
        li.appendChild(duedate);
        */


        //Delete button
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        deleteButton.setAttribute("data-index", i);
        deleteButton.onclick = function () {
            var index = this.getAttribute("data-index");
            filteredTasks.splice(index, 1);
            showTasks();
        };
        li.appendChild(deleteButton);


        //Edit button
        var editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        editButton.setAttribute("data-index", i);
        editButton.onclick = function () {
            var index = this.getAttribute("data-index");
            var updatedTask = prompt("Enter updated task:", filteredTasks[index].task);
            if (updatedTask) {
                filteredTasks[index].task = updatedTask;
                showTasks();
            }
        };
        li.appendChild(editButton);


        taskList.appendChild(li);
    }
}


//Sorting by sortTasks
function sortTasks() {
    var sortSelect = document.getElementById("sortSelect");
    var sortOption = sortSelect.value;

    switch (sortOption) {
        case "dueDate":
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case "priority":
            tasks.sort((a, b) => priorityToValue(b.priority) - priorityToValue(a.priority));
            break;
        default:
            break;
    }

    showTasks();
}

function priorityToValue(priority) {
    switch (priority) {
        case "low":
            return 1;
        case "medium":
            return 2;
        case "high":
            return 3;
        default:
            return 0;
    }
}

//Searching by searchTasks
function searchTasks() {
    var searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
    if (searchInput === "") {
        alert("Please enter a name");
        return;
    }

    var matches = tasks.filter((task) => task.task.toLowerCase().includes(searchInput));

    if (matches.length === 0) {
        alert("No tasks found.");
    } else {
        var taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        matches.forEach(function (item, index) {
            var li = document.createElement("li");
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.completed;
            checkbox.onclick = function () {
                tasks[index].completed = this.checked;
                saveToLocalStorage();
                viewBacklogs();
                renderActivityLogs();
            };
            var textNode = document.createElement("span");
            textNode.innerHTML = item.task;
            if (item.completed) {
                textNode.style.textDecoration = "line-through";
            }
            li.appendChild(textNode);
            li.appendChild(checkbox);

            var deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Delete";
            deleteButton.onclick = function () {
                tasks.splice(index, 1);
                saveToLocalStorage();
                showTasks();
                viewBacklogs();
            };
            li.appendChild(deleteButton);

            var editButton = document.createElement("button");
            editButton.innerHTML = "Edit";
            editButton.onclick = function () {
                var updatedTask = prompt("Enter updated task:", tasks[index].task);
                if (updatedTask) {
                    tasks[index].task = updatedTask;
                    saveToLocalStorage();
                    showTasks();
                    viewBacklogs();
                    renderActivityLogs();
                }
            };
            li.appendChild(editButton);
            taskList.appendChild(li);
        });
    }
}

//Backlog feature
function viewBacklogs() {
    console.log("mdk");
    var currentDate = new Date();

    var backlogs = tasks.filter((task) => new Date(task.dueDate) < currentDate.getTime());

    var backlogList = document.getElementById("backlogList");
    backlogList.innerHTML = "";

    if (backlogs.length === 0) {
        var li = document.createElement("li");
        li.textContent = "No backlogs found.";
        backlogList.appendChild(li);
    } else {
        backlogs.forEach((backlog, index) => {
            var li = document.createElement("li");
            li.textContent = `${backlog.task} - Due: ${backlog.dueDate} - Priority: ${backlog.priority}`;
            var deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Delete";
            deleteButton.setAttribute("data-index", index);
            deleteButton.onclick = function () {
                var index = this.getAttribute("data-index");
                tasks.splice(index, 1);
                viewBacklogs();
            };
            li.appendChild(deleteButton);
            backlogList.appendChild(li);
        });
    }
}

//Activity feature
function renderActivityLogs() {
    var logsList = document.getElementById("logsList");
    logsList.innerHTML = "";

    if (activityLogs.length === 0) {
        var li = document.createElement("li");
        li.textContent = "No logs found.";
        logsList.appendChild(li);
    }
    else {
        activityLogs.forEach((log) => {
            var li = document.createElement("li");

            switch (log.type) {
                case "add":
                    li.textContent = `Added task: "${log.task}" - ${log.timestamp}`;
                    break;
                case "delete":
                    li.textContent = `Deleted task: "${log.task}" - ${log.timestamp}`;
                    break;
                case "complete":
                    li.textContent = `Marked task : "${log.task}" - ${log.timestamp}`;
                    break;
                case "edit":
                    li.textContent = `Edited task: "${log.task}" to "${log.newTask}" - ${log.timestamp}`;
                    break;
                default:
                    li.textContent = `Unknown activity - ${log.timestamp}`;
            }
            var clearButton = document.getElementById("clearButton");
            clearButton.onclick = function () {
                logsList.innerHTML = "";
            }
            logsList.appendChild(li);
        });
    }
}

function addReminder() {
    var reminderTaskInput = document.getElementById("reminderTaskInput");
    var reminderDateTimeInput = document.getElementById("reminderDateTimeInput");
    var taskName = reminderTaskInput.value.trim();
    var reminderDateTime = reminderDateTimeInput.value;

    if (taskName === "") {
        alert("Please enter a task");
        return;
    }

    if (reminderDateTime === "") {
        alert("Please select a date and time");
        return;
    }

    reminders.push({ task: taskName, datetime: reminderDateTime });

    // Save reminders to localStorage
    saveToLocalStorage();

    reminderTaskInput.value = "";
    reminderDateTimeInput.value = "";

    // Render reminders
    ShowReminders(reminders);
}

function ShowReminders(reminders) {
    var reminderList = document.getElementById("reminderList");
    reminderList.innerHTML = "";

    reminders.forEach((reminder) => {
        var li = document.createElement("li");
        li.textContent = reminder.task + " (Reminder at " + reminder.datetime + ")";
        reminderList.appendChild(li);
    });
}

function checkReminders() {
    var now = new Date();
    reminders.forEach(function (reminder, index) {
        if (reminder.datetime <= now) {
            alert("Reminder: " + reminder.task);
            reminders.splice(index, 1);
            saveToLocalStorage();
            ShowReminders();
        }
    });
}

document.getElementById("reminderButton").addEventListener("click", addReminder);
setInterval(checkReminders, 30000);

//Sql database Schema
/*
 
CREATE TABLE tasks (
  task_id INT PRIMARY KEY,
  task_name VARCHAR(255) NOT NULL,
  category_id INT PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL
  due_date DATE,
  priority VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
*/



function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
}

function loadFromLocalStorage() {
    var storedTasks = localStorage.getItem("tasks");
    tasks = storedTasks ? JSON.parse(storedTasks) : [];

    var storedLogs = localStorage.getItem("activityLogs");
    activityLogs = storedLogs ? JSON.parse(storedLogs) : [];

    showTasks();
    viewBacklogs();
    renderActivityLogs();
}


loadFromLocalStorage();




