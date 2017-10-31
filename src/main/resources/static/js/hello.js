angular.module('hello', ['ui.bootstrap'])
    .controller('home', function ($scope, $http) {
            $scope.activities = [];
            $scope.activeFilter = "";
            $scope.errorMessage;
            $scope.hideCompleted = false;
            $scope.selectedPriority = "C";
            $scope.fileLocation = "default/todo.txt";
            $scope.warningHours = 24;
            $scope.warningMinutes = 0;
            $scope.warningSeconds = 0;
            $scope.editMode = "uneditable";
            $scope.editableActivites = {};


            $scope.priorities = {
                prioOne: "A",
                prioTwo: "B",
                prioThree: "C",
                prioFour: "D",
                prioFive: "E",
                prioSix: "F"
            }

            $http.get('/initialize').then(function (response) {
                    $scope.loadActivities();
                },
                function (errorResponse) {
                    $scope.errorMessage = 'error initializing application';
                });

            $scope.makeEditable = function (activityName) {
                $scope.editableActivites[activityName] = "editable";
            }

            $scope.getEditMode = function (activityName) {
                let editable = $scope.editableActivites[activityName];
                if (editable) {
                    return editable;
                } else {
                    $scope.editableActivites[activityName] = "uneditable";
                    return $scope.editableActivites[activityName];
                }
            }

            $scope.getErrorMessage = function () {
                return errorMessage;
            }

            $scope.resetDeadline = function () {
                $scope.deadline = undefined;
            }

            $scope.toggleHideCompleted = function () {
                $scope.hideCompleted = !$scope.hideCompleted;
            }

            $scope.getHideCompleted = function () {
                return $scope.hideCompleted;
            }

            $scope.loadActivities = function () {
                $scope.activities.length = 0;
                $http.get('/getActivities').then(function (response) {
                        $scope.activities = response.data;
                    },
                    function (errResponse) {
                        $scope.errorMessage = 'error getting activities';
                    });

                $scope.editableActivites = new Object();
                for (i in $scope.activities) {
                    var activity = $scope.activities[i];
                    $scope.editableActivites[activity.name] = "uneditable";
                    if (Array.isArray(activity.deadline)) {
                        var deadLineArray = activity.deadline;
                        $scope.activities[i].deadline = new Date(deadLineArray[0], deadLineArray[1], deadLineArray[2], deadLineArray[3], deadLineArray[4]);
                    }

                }
            };

            $scope.loadActivtiesByTag = function (tag) {
                $scope.activeFilter = tag;
                $scope.activities.length = 0;
                $scope.toggleFilterVisibility();
                $http.post('/getActivitiesByTag', tag).then(function (response) {
                        $scope.activities = response.data;
                    },
                    function (errResponse) {
                        $scope.errorMessage = 'error getting activities by tag';
                    });
            };

            $scope.updateFile = function () {
                var fileLoc = $scope.fileLocation;
                $http.post('/updateFileLocation', fileLoc).then(function (response) {
                        $scope.loadActivities();
                    },
                    function (errResponse) {
                        $scope.errorMessage = 'error setting file: ' + errResponse;
                    });
            };


            $scope.loadActivtiesByProject = function (project) {
                $scope.activeFilter = project;
                $scope.activities = [];
                $scope.toggleFilterVisibility();
                $http.post('/getActivitiesByProject', project).then(function (response) {
                        $scope.activities = response.data;
                    },
                    function (errResponse) {
                        $scope.errorMessage = 'error getting activities by project';
                    });
            }

            $scope.clearFilter = function () {
                $scope.activeFilter = "";
                $scope.toggleFilterVisibility();
                $scope.activities = [];
                $scope.loadActivities();
            }

            $scope.toggleFilterVisibility = function () {
                var div = document.getElementById("filterDisplay");
                div.style.display = div.style.display == "none" ? "block" : "none";
            }

            $scope.getDone = function (isDone) {
                if (isDone == true) {
                    return 'fa fa-calendar-check-o';
                } else {
                    return 'fa fa-calendar-times-o';
                }
            };

            $scope.getTodoToggleText = function (isDone) {
                if (isDone == true) {
                    return "Didn't do it";
                } else {
                    return "I did it!";
                }
            }

            $scope.getHeaderTemplate = function (isDone) {
                if (isDone == true) {
                    return "color: #4cae4c;";
                } else {
                    return "";
                }
            }

            $scope.removeProject = function (activityName, displayArray, index) {
                for (var i in $scope.activities) {
                    if ($scope.activities[i].name == activityName) {
                        $scope.activities[i].projects.splice(index, 1);
                        displayArray.splice(index, 1);
                    }
                }
            }

            $scope.save = function (name) {
                for (var i in $scope.activities) {
                    if ($scope.activities[i].name == name) {
                        let activity = $scope.activities[i];
                        if (activity.deadline == undefined) {
                            delete activity.deadline;
                        }
                        if (activity.completionDate == undefined) {
                            delete activity.completionDate;
                        }
                        if (activity.projects == undefined || activity.projects.length < 1) {
                            delete activity.projects;
                        }
                        if (activity.tags == undefined || activity.tags.length < 1) {
                            delete activity.tags;
                        }

                        $http.post('/save', activity).then(function (response) {
                                $scope.editableActivites[name] = "uneditable";
                                return true;
                            },
                            function (response) {
                                $scope.errorMessage = "Error while saving activity";
                            });

                    }
                }
                $scope.editableActivites[name] = "uneditable";
            };

            $scope.delete = function (name) {
                $http.get('/getActivities').then(function (response) {
                        $scope.activities = response.data;
                        for (i in $scope.activities) {
                            if ($scope.activities[i].name == name) {
                                let activity = $scope.activities[i];
                                if (activity.deadline == undefined) {
                                    delete activity.deadline;
                                }
                                if (activity.completionDate == undefined) {
                                    delete activity.completionDate;
                                }
                                if (activity.projects.length < 1) {
                                    delete activity.projects;
                                }

                                $http.post('/delete', activity);
                                $scope.activities.splice(i, 1);
                                return;
                            }
                        }
                    },
                    function (errResponse) {
                        $scope.errorMessage = 'error deleting activities';
                    });
            };

            $scope.getPanelStyle = function (name) {
                if ($scope.isUrgent(name)) {
                    return 'panel-danger';
                } else {
                    return 'panel-default';
                }
            }

            $scope.isUrgent = function (name) {
                var today = new Date();
                for (i in $scope.activities) {
                    if ($scope.activities[i].name == name) {
                        let activity = $scope.activities[i];
                        if (activity.deadline != undefined) {
                            var parsedDeadline = new Date(activity.deadline);
                            var diff = Math.abs(parsedDeadline - new Date()) / 1000;
                            if (diff <= activity.warningTimeFrame && !activity.completed) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                }
                return false;
            };

            $scope.convertActivityDeadlineToDate = function (acivitydeadline) {
                return new Date(acivitydeadline[0], acivitydeadline[1], acivitydeadline[2], acivitydeadline[3], acivitydeadline[4]);
            };

            $scope.getWarningTimeFrameInSeconds = function getWarningTimeFrameInSeconds() {
                return $scope.warningSeconds + ($scope.warningMinutes * 60) + ($scope.warningHours * 60 * 60);
            }

            $scope.addActivity = function () {

                var activity = {
                    name: $scope.name,
                    completed: false,
                    deadline: $scope.deadline,
                    priority: $scope.selectedPriority,
                    tags: [],
                    projects: [],
                    warningTimeFrame: $scope.getWarningTimeFrameInSeconds()
                };
                if ($scope.tags) {
                    let tagList = $scope.tags.split(",");
                    if (tagList.length > 0) {
                        activity.tags = tagList;
                    }
                }

                if ($scope.projects) {
                    let projectList = $scope.projects.split(",");
                    if (projectList.length > 0) {
                        activity.projects = projectList;
                    }
                }

                $scope.activities.push(activity);
                $scope.save(activity.name);
            }

            $scope.togglediv = function (id) {
                var div = document.getElementById(id);
                div.style.display = div.style.display == "none" ? "block" : "none";
            }

            $scope.today = function () {
                $scope.dt = new Date();
            };
            $scope.today();

            $scope.clear = function () {
                $scope.dt = null;
            };

            $scope.inlineOptions = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };

            $scope.dateOptions = {
                dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(),
                startingDay: 1
            };

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                //return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                return false;
            }

            $scope.toggleMin = function () {
                $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            };

            $scope.toggleMin();

            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };

            $scope.open2 = function () {
                $scope.popup2.opened = true;
            };

            $scope.open3 = function () {
                $scope.popup3.opened = true;
            };

            $scope.setDate = function (year, month, day) {
                $scope.dt = new Date(year, month, day);
            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            $scope.altInputFormats = ['M!/d!/yyyy'];

            $scope.popup1 = {
                opened: false
            };

            $scope.popup2 = {
                opened: false
            };

            $scope.popup3 = {
                opened: false
            };

            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            var afterTomorrow = new Date();
            afterTomorrow.setDate(tomorrow.getDate() + 1);
            $scope.events = [
                {
                    date: tomorrow,
                    status: 'full'
                },
                {
                    date: afterTomorrow,
                    status: 'partially'
                }
            ];

            function getDayClass(data) {
                var date = data.date,
                    mode = data.mode;
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                    for (var i = 0; i < $scope.events.length; i++) {
                        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }
                return '';
            }
        }
    );