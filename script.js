var toDoApp = (function () {
  //DOM Elements
  const formElems = document.forms["taskForm"];
  const taskTitle = formElems["taskTitle"];
  const hrs = formElems["hours"];
  const mins = formElems["mins"];
  const year = formElems["year"];
  const day = formElems["day"];
  const month = formElems["month"];
  const editBox = document.querySelector(".editBox");
  const submitBtn = document.querySelector(".submit");
  const cancelBtn = document.querySelector(".cancel");
  const editTask = document.querySelector(".editTask");
  const check = document.createElement("input");
  let clickedTask;
  //events
  //1-Creating New Task
  document.getElementById("addNew").addEventListener("click", function (e) {
    e.preventDefault();
    if (formValid()) {
      let notified = isOutdated(
        year.value,
        month.value,
        day.value,
        hrs.value,
        mins.value
      );
      var taskObj = {
        taskTitle: document.getElementById("newTask").value,
        hours: hrs.value,
        mins: mins.value,
        year: year.value,
        month: month.value,
        day: day.value,
        notified: notified,
        finished: false,
      };
      addTask(taskObj);
    }
  });
  //2-Deleting Task
  document.getElementById("tasks").addEventListener("click", function (e) {
    var clicked = e.target;
    console.log(clicked);
    clickedTask = clicked.parentElement.parentElement;
    if (clicked.classList.contains("delete")) {
      console.log("deleting");
      clickedTask.remove();
      deleteTask(clickedTask.dataset["title"]);
    }
    if (clicked.classList.contains("edit")) {
      console.log("editing");
      editBox.classList.remove("hidden");
    }
    console.log(clicked.type);
    if (clicked.type === "checkbox") {
      clickedTask.classList.toggle("completed");
      if (clicked.checked) {
        var timer = notArr[`${clickedTask.dataset["title"]}`];
        clearTimeout(timer);
        getTaskByTitle(clickedTask.dataset["title"]).then((task) => {
          return processTask(task);
        });
        function processTask(task) {
          task.finished = true;
          updateTask(task);
        }
      } else {
        getTaskByTitle(clickedTask.dataset["title"]).then((task) => {
          return processTask(task);
        });
        function processTask(task) {
          task.finished = false;
          displayNotification(task);
        }
      }
    }
  });
  //3-Closing Error Box
  document.getElementById("errBtn").addEventListener("click", function () {
    document.getElementById("error").classList.toggle("hidden");
  });
  //4-Submit Edits
  submitBtn.addEventListener("click", function () {
    console.log(clickedTask.dataset["title"]);
    if (editTask.value !== "") {
      var newTitle = editTask.value;
      // taskObj.taskTitle = newTitle;
      clickedTask.children[0].children[1].innerText = newTitle;
      getTaskByTitle(clickedTask.dataset["title"]).then((task) => {
        processTask(task);
      });
      function processTask(task) {
        deleteTask(task.taskTitle);
        task.taskTitle = newTitle;
        updateTask(task);
      }
      editTask.value = "";
      editBox.classList.add("hidden");
    }
  });
  cancelBtn.addEventListener("click", function () {
    editBox.classList.add("hidden");
    editTask.value = "";
  });
  //5- complet tasks
  check.addEventListener("change", function (e) {});
  //APP Functions
  //1 - check for support
  if (!("indexedDB" in window)) {
    console.log("This browser does not support indexedDB");
    return;
  }
  //2 - create database
  var dBPromise = idb.open("MyTasks", 3, function (upgradeDB) {
    switch (upgradeDB.oldVersion) {
      case 2:
        console.log("Created Database");
        upgradeDB.createObjectStore("myTasks", { keyPath: "taskTitle" });
      // var store = upgradeDB.transaction.objectStore('products')
      // store.createIndex('name', 'name', { unique: true });
    }
  });

  //3 - add new task
  var addTask = function (taskObj) {
    dBPromise.then(function (db) {
      var trans = db.transaction("myTasks", "readwrite");
      var store = trans.objectStore("myTasks");
      return new Promise(function () {
        return store
          .add(taskObj)
          .catch(function () {
            trans.abort();
          })
          .then(function () {
            displayTask(taskObj);
            displayNotification(taskObj);
            console.log("Task added successfully");
          });
      });
    });
  };

  // 4 - display task
  var displayTask = function (taskObj) {
    // var htmlEle = `<li class="task" data-title="${taskObj.taskTitle}">${taskObj.taskTitle}<button class="delete">Delete</button></li>`;
    var htmlEle = `<li class="task ${
      taskObj.notified ? "notified" : ""
    }" data-title="${taskObj.taskTitle}">
        <div>
        <input type="checkBox" ${taskObj.finished ? "checked" : ""}>
        <p class="${taskObj.finished ? "completed" : ""}">${
      taskObj.taskTitle
    }</p>
        </div>
        <div>
        <button class="delete"><i class="fas fa-trash" aria-hidden="true"></i></button>
        <button class="edit"><i class="far fa-edit" aria-hidden="true"></i></button>
        </div>
        </li>`;
    document.getElementById("tasks").insertAdjacentHTML("beforeend", htmlEle);
  };

  // 5 - get all tasks
  function getAllTasks() {
    return dBPromise.then(function (db) {
      var trans = db.transaction("myTasks", "readonly");
      var store = trans.objectStore("myTasks");
      return store.getAll();
    });
  }
  getAllTasks().then((tasks) => {
    processTasks(tasks);
  });
  function processTasks(tasks) {
    tasks.forEach((task) => {
      displayTask(task);
    });
  }

  //delete tasks
  function deleteTask(taskTitle) {
    dBPromise.then(function (db) {
      var trans = db.transaction("myTasks", "readwrite");
      var store = trans.objectStore("myTasks");
      return store.delete(taskTitle);
    });
    console.log(notArr[`${taskTitle}`]);
    var timer = notArr[`${taskTitle}`];
    clearTimeout(timer);
  }
  // 6 - Update Task
  function updateTask(taskObj) {
    console.log(taskObj);
    // var key = taskObj.taskTitle;
    // taskObj.notified = true;
    dBPromise.then(function (db) {
      var trans = db.transaction("myTasks", "readwrite");
      var store = trans.objectStore("myTasks");
      // console.log(store.get("one"));
      return store.put(taskObj);
      // return store.delete(taskTitle)
    });
  }
  // 7 - update view
  function updateView(task) {
    console.log(notArr);
    var tasks = document.getElementsByTagName("li");
    console.log(tasks);
    for (item of tasks) {
      console.log(item);
      if (item.dataset["title"] === task) {
        item.classList.add("notified");
      }
    }
  }
  //8- get task by title
  function getTaskByTitle(taskTitle) {
    return dBPromise.then(function (db) {
      var trans = db.transaction("myTasks", "readonly");
      var store = trans.objectStore("myTasks");
      return store.get(taskTitle);
    });
  }
  ///////////////////////////////////////
  //Notification

  // TODO 2.1 - check for notification support
  if (!("Notification" in window)) {
    console.log("This browser does not support notification");
    return;
  }
  // TODO 2.2 - request permission to show notifications
  Notification.requestPermission((status) => {
    console.log("Notification permission status", status);
  });
  // displayNotification();
  var notArr = [];
  function displayNotification(taskObj) {
    // TODO 2.3 - display a Notification
    if (Notification.permission == "granted") {
      console.log("you can have notification");
      var count = 0;
      var notDate = new Date(
        taskObj.year,
        taskObj.month,
        taskObj.day,
        taskObj.hours,
        taskObj.mins
      );
      var now = new Date();

      var secs = Math.abs(notDate.getTime() - now.getTime());
      console.log(notDate, new Date(), notDate.getTime() - now.getTime());
      console.log(notDate, secs);
      navigator.serviceWorker.getRegistration().then((reg) => {
        const options = {
          body: "Reminder for Task",
          icon: "./task.svg",
          data: {
            dateOfArrival: new Date(),
            primaryKey: count,
          },
        };
        console.log(secs);
        var newNot = setTimeout(function () {
          console.log("calling");
          reg.showNotification(taskObj.taskTitle, options);
          taskObj.notified = true;
          updateTask(taskObj);
          updateView(taskObj.taskTitle);
        }, secs);
        notArr[`${taskObj.taskTitle}`] = newNot;
        count++;
        console.log(notArr);
      });
    }
  }

  //Hellper Functions
  function formValid() {
    if (
      taskTitle.value !== "" &&
      hrs.value !== "" &&
      mins.value !== "" &&
      year.value !== "" &&
      month.value !== "" &&
      day.value !== ""
    ) {
      if (
        day.value === "Day" ||
        year.value === "Year" ||
        month.valueb === "Month"
      ) {
        showError("Choose valid date!");
        return false;
      }
      if (
        +hrs.value > 23 ||
        +hrs.value < 0 ||
        +mins.value > 59 ||
        +mins.value < 0
      ) {
        showError("Choose valid time!");
        return false;
      }
      return true;
    } else {
      showError("Please fill all Fields!");
      return false;
    }
  }
  function showError(msg) {
    document.getElementById("msg").innerText = msg;
    document.getElementById("error").classList.toggle("hidden");
  }
  function isOutdated(year, month, day, hrs, mins) {
    return new Date(year, month, day, hrs, mins) - new Date() <= 0;
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // console.log('Service Worker and Push is supported');

      navigator.serviceWorker
        .register("sw.js")
        .then((swReg) => {
          console.log("Service Worker is registered", swReg);

          swRegistration = swReg;

          // TODO 3.3a - call the initializeUI() function
        })
        .catch((err) => {
          console.error("Service Worker Error", err);
        });
    });
  } else {
    console.warn("Push messaging is not supported");
    pushButton.textContent = "Push Not Supported";
  }
})();
