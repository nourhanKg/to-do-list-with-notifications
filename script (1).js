// //elements
// const task = document.querySelector(".newTask");
// const btnAddNew = document.querySelector(".btnAddNew");
// const listOfTasks = document.querySelector(".tasks");
// const editBox = document.querySelector(".editBox");
// const editTask = document.querySelector(".editTask");
// const submitBtn = document.querySelector(".submit");
// const cancelBtn = document.querySelector(".cancel");

// //functions
// function addTask(event) {
//     event.preventDefault(); //prevent form submit
//     if(task.value !== "") {
//         const newTask = document.createElement("li");
//         const divTask = document.createElement("div");
//         const check = document.createElement("input");
//         const para = document.createElement("p");
//         const divBtn = document.createElement("div");
//         const delBtn = document.createElement("button");
//         const editBtn = document.createElement("button");

//         check.type = "checkBox"
//         para.textContent = task.value;
//         delBtn.classList.add("delete");
//         editBtn.classList.add("edit");
//         delBtn.innerHTML = "<i class='fas fa-trash'></i>";
//         editBtn.innerHTML = "<i class='far fa-edit'></i>";

//         //saving task
//         saveMyList(task.value);

//         divTask.appendChild(check);
//         divTask.appendChild(para);
//         divBtn.appendChild(delBtn);
//         divBtn.appendChild(editBtn);
//         newTask.appendChild(divTask);
//         newTask.appendChild(divBtn);
//         listOfTasks.appendChild(newTask); 
//         task.value = "";
//     }
// }
// let btnClicked, oldTask;

// function changeTask(e) {
//     const btn = e.target;
//     btnClicked = btn;
//     const divParent = btn.parentElement;
//     const liParent = divParent.parentElement;
//     if(btn.classList[0] === "delete") {
//         liParent.classList.add("remove");
//         //remove from local storage
//         removeFromStorage(liParent.children[0].children[1]);
//         liParent.addEventListener("transitionend", function() {
//             liParent.remove(); 
//         });
//     }
//     else if(btn.classList[0] === "edit") {
//         editBox.classList.remove("hidden");
//         oldTask = liParent.children[0].children[1].textContent;
//         console.log(oldTask);
//     }
//     else if(btn.type === "checkbox") {
//         liParent.children[0].children[1].classList.toggle("completed");
//     }
// }
// function cancelEdit() {
//     editBox.classList.add("hidden");
//     editTask.value = "";
// }

// function submitEdit() {
//     if(editTask.value !== "") {
//         const firstParent = btnClicked.parentElement; //div
//         const liParent = firstParent.parentElement; //li
//         liParent.children[0].children[1].textContent = editTask.value;
//         editTask.value = "";
//         editBox.classList.add("hidden");
//         savingEdits(oldTask, liParent.children[0].children[1].textContent);
//     }
// }
// //check for saved lists
// let savedTasks;
// function checkSaved(task){
//     if(localStorage.getItem("savedTasks") === null) {
//         savedTasks = [];
//     }
//     else {
//         savedTasks = JSON.parse(localStorage.getItem("savedTasks"));
//     }
// }
// //to store list 
// function saveMyList(task) {
//     checkSaved();
//     savedTasks.push(task);
//     localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
// }
// //to display stored list
// function loadList(task) {
//     checkSaved();
//     savedTasks.forEach(function(task) {
//         const newTask = document.createElement("li");
//         const divTask = document.createElement("div");
//         const check = document.createElement("input");
//         const para = document.createElement("p");
//         const divBtn = document.createElement("div");
//         const delBtn = document.createElement("button");
//         const editBtn = document.createElement("button");

//         check.type = "checkBox"
//         para.textContent = task;
//         delBtn.classList.add("delete");
//         editBtn.classList.add("edit");
//         delBtn.innerHTML = "<i class='fas fa-trash'></i>";
//         editBtn.innerHTML = "<i class='far fa-edit'></i>";

//         divTask.appendChild(check);
//         divTask.appendChild(para);
//         divBtn.appendChild(delBtn);
//         divBtn.appendChild(editBtn);
//         newTask.appendChild(divTask);
//         newTask.appendChild(divBtn);
//         listOfTasks.appendChild(newTask); 
//     })
// }
// function savingEdits(oldTask, newTask) {
//     checkSaved();
//     console.log(oldTask, newTask);
//     savedTasks[savedTasks.indexOf(oldTask)] = newTask;
//     localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
// }

// function removeFromStorage(task) {
//     checkSaved();
//     removedTask = task.innerText;
//     savedTasks.splice(savedTasks.indexOf(removedTask), 1);
//     localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
// }

// document.addEventListener("DOMContentLoaded", loadList);
// btnAddNew.addEventListener("click", addTask);
// listOfTasks.addEventListener("click", changeTask);
// submitBtn.addEventListener("click", submitEdit);
// cancelBtn.addEventListener("click", cancelEdit);
var toDoApp = (function() {
    //events
    document.getElementById("tasks").addEventListener("click", function(e) {
        var clicked = e.target;
        if(clicked.classList.contains("delete")) {
            console.log("deleting");
            clicked.parentElement.remove()
            deleteTask(clicked.parentElement.dataset["title"]);
        }
    })
    document.getElementById("addNew").addEventListener("click", function(e) {
        e.preventDefault();
        var taskObj = {
            "taskTitle": document.getElementById("newTask").value,
            "hours": document.getElementById("hrs").value,
            "mins": document.getElementById("mins").value,
            "year": document.getElementById("year").value,
            "month": document.getElementById("month").value,
            "day": document.getElementById("day").value,
            "notified": false
        }
        console.log(taskObj);
        addTask(taskObj);
    })
    console.log("Hi");
    //1 - check for support
    if(!('indexedDB' in window)){
        console.log('This browser does not support indexedDB')
        return;
    }
    //2 - create database
    var dBPromise = idb.open("MyTasks", 3, function(upgradeDB) {
        switch(upgradeDB.oldVersion) {
            case 2: 
            console.log("Created Database");
            upgradeDB.createObjectStore("myTasks", {keyPath: "taskTitle"})
            // var store = upgradeDB.transaction.objectStore('products')
            // store.createIndex('name', 'name', { unique: true });
        }
    });

    //3 - add new task
    var addTask = function(taskObj) {
        dBPromise.then(function(db) {
            var trans = db.transaction("myTasks", "readwrite");
            var store = trans.objectStore("myTasks");
            return new Promise(function() {
                return store.add(taskObj)
                .catch(function(){
                    trans.abort()
                })
                .then(function(){
                    displayTask(taskObj);
                    displayNotification(taskObj);
                    console.log('Task added successfully');
                });
            })
        })
    }

    // 4 - display task
    var displayTask = function(taskObj) {
        console.log(taskObj);
        var htmlEle = `<li class="task" data-title="${taskObj.taskTitle}">${taskObj.taskTitle}<button class="delete">Delete</button></li>`;
        document.getElementById("tasks").insertAdjacentHTML("beforeend", htmlEle);
    }

    // 5 - get all tasks
    function getAllTasks() {
        return dBPromise.then(function(db){
            var trans = db.transaction('myTasks','readonly')
            var store = trans.objectStore('myTasks')
            return store.getAll()
        })
    }
    getAllTasks().then(tasks => {
        processTasks(tasks)
    })
    function processTasks(tasks) {
        tasks.forEach(task => {
            displayTask(task);
        })
    }

    //delete tasks
    function deleteTask(taskTitle) {
        dBPromise.then(function(db) {
            var trans = db.transaction('myTasks','readwrite')
            var store = trans.objectStore('myTasks');
            return store.delete(taskTitle)
        })
        console.log(notArr[`${taskTitle}`]);
        var timer = notArr[`${taskTitle}`]
        clearTimeout(timer);
    }
    // 6 - Update Task
    function updateTask(taskObj) {
        console.log(taskObj);
        var key = taskObj.taskTitle;
        taskObj.notified = true;
        dBPromise.then(function(db) {
            var trans = db.transaction('myTasks','readwrite')
            var store = trans.objectStore('myTasks');
            // console.log(store.get("one"));
            return store.put(taskObj)
            // return store.delete(taskTitle)
        })
    }
    // 7 - update view
    function updateView(task) {
        console.log(notArr);
        var tasks = document.getElementsByTagName("li")
        console.log(tasks);
        for(item of tasks) {
            console.log(item);
            if (item.dataset["title"] === task) {
                item.classList.add("notified")
            }
        }
    }
    ///////////////////////////////////////
    //Notification

     // TODO 2.1 - check for notification support
    if(!('Notification' in window)){
        console.log('This browser does not support notification')
        return;
    }
    // TODO 2.2 - request permission to show notifications
    Notification.requestPermission(status=>{
    console.log('Notification permission status',status)
    })
    // displayNotification();
    var notArr =[];
    function displayNotification(taskObj) { 
        // TODO 2.3 - display a Notification
        if(Notification.permission == 'granted'){
            console.log("you can have notification");
            var count = 0;
            var notDate = new Date(taskObj.year, taskObj.month, taskObj.day, taskObj.hours, taskObj.mins)
            var now = new Date();
            
            var secs = Math.abs(notDate.getTime() - now.getTime());;
            console.log(notDate, new Date(), notDate.getTime() - now.getTime());
            console.log(notDate, secs);
            navigator.serviceWorker.getRegistration().then(reg=>{
                const options={
                body:"Reminder for Task",
                icon:'./task.svg',
                data:{
                    dateOfArrival:new Date(),
                    primaryKey: count
                }
                };
                console.log(secs);
                var newNot = setTimeout(function() {
                    console.log("calling");
                    reg.showNotification(taskObj.taskTitle,options);
                    updateTask(taskObj);
                    updateView(taskObj.taskTitle)
                }, secs);
                notArr[`${taskObj.taskTitle}`] = newNot;
                count++;
                console.log(notArr);
            })
            }
        }
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          // console.log('Service Worker and Push is supported');
    
            navigator.serviceWorker.register('sw.js')
            .then(swReg => {
                console.log('Service Worker is registered', swReg);
        
                swRegistration = swReg;
        
                // TODO 3.3a - call the initializeUI() function
            })
            .catch(err => {
                console.error('Service Worker Error', err);
            });
            });
        } else {
            console.warn('Push messaging is not supported');
            pushButton.textContent = 'Push Not Supported';
    }
})();

