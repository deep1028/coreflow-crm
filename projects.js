const newProjectBtn = document.getElementById("new-project-btn");
const projectFormContainer = document.getElementById("add-project-form-container");
const projectForm = document.getElementById("add-project-form");
const cancelProjectBtn = document.getElementById("cancel-btn-project-form");
const submitProjectBtn = document.getElementById("submit-btn-project-form");
const projectNameInput = document.getElementById("project-name");
const clientDropdown = document.getElementById("client-dropdown");
const projectDescriptionInput = document.getElementById("project-description");
const projectStatusSelect = document.getElementById("project-status");
const projectPrioritySelect = document.getElementById("project-priority");
const projectStartDateInput = document.getElementById("project-start-date");
const projectDeadlineInput = document.getElementById("project-deadline");
const projectListContainer = document.getElementById("project-list");
const projectEmptyState = document.getElementById("project-empty-state");
const projectSearch = document.getElementById("project-search");
const projectStatusFilter = document.getElementById("project-status-filter");
const noMatchingProjects = document.getElementById("no-matching-projects");
const totalProjects = document.querySelector("#total-projects p");
const inProgressProjects = document.querySelector("#in-progress-projects p");
const completedProjects = document.querySelector("#completed-projects p");

const clients = JSON.parse(localStorage.getItem("dataOnBrowser")) || [];
let projects = JSON.parse(localStorage.getItem("projectsOnBrowser")) || [];

updateProjectStats();

const len = clients.length;
if (len == 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.selected = true;
    opt.textContent = "No clients found";
    submitProjectBtn.disabled = true;
    clientDropdown.appendChild(opt);
}
else{
    clients.forEach(function(client){
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = `${client.name} — ${client.companyName}`;
        clientDropdown.appendChild(option);
    });
    submitProjectBtn.disabled = false;
}

newProjectBtn.addEventListener("click", function() {
    projectFormContainer.style.display = "flex";
});

cancelProjectBtn.addEventListener("click", function() {
    projectFormContainer.style.display = "none";
    projectForm.reset();
});

projectForm.addEventListener("submit", function(event){
    event.preventDefault();

    const projectName = projectNameInput.value.trim();
    const selectedClientId = clientDropdown.value.trim();
    const projectDescription = projectDescriptionInput.value.trim();
    const projectStatus = projectStatusSelect.value;
    const projectPriority = projectPrioritySelect.value;
    const startDate = projectStartDateInput.value;
    const deadline = projectDeadlineInput.value;

    const clientExists = clients.some(function(client){ 
        return client.id === selectedClientId;
    });

    if(!projectName){
        showToast("Please enter a project name.", "warning");
        return;
    }

    if(!selectedClientId || !clientExists){
        showToast("Please select a valid client.", "warning");
        return;
    }

    if(!startDate || !deadline){
        showToast("Please select both project dates.", "warning");
        return;
    }

    if (deadline < startDate){
        showToast("Deadline cannot be earlier than the start date.", "warning");
        return;
    }

    const newProject = {
        id: crypto.randomUUID(),
        projectName: projectName,
        clientId: selectedClientId,
        description: projectDescription,
        status: projectStatus,
        priority: projectPriority,
        startDate: startDate,
        deadline: deadline
    };

    projects.push(newProject);
    localStorage.setItem("projectsOnBrowser", JSON.stringify(projects));

    refreshProjectsPage();
    projectForm.reset();
    projectFormContainer.style.display = "none";

    showToast("Project created successfully!", "success");
});

function renderProjects(projectsToRender = projects){
    projectListContainer.innerHTML = "";

    if(projectsToRender.length === 0){
        projectEmptyState.style.display = "block";
        noMatchingProjects.style.display = "none";
    }
    else if(projectsToRender.length === 0){
        projectEmptyState.style.display = "none";
        noMatchingProjects.style.display = "block";
    }
    else {
        projectEmptyState.style.display = "none";
        noMatchingProjects.style.display = "none";
    }

    projectsToRender.forEach(function(project){
        const client = clients.find(function(client){
            return client.id === project.clientId;
        });
        const projectCard = document.createElement("div");
        projectCard.classList.add("project-card");

        const projectNameCard = document.createElement("h3");
        projectNameCard.textContent = project.projectName;

        const clientInfo = document.createElement("p");
        clientInfo.textContent = client
            ? `${client.name} — ${client.companyName}`
            : "Client not found";

        const description = document.createElement("p");
        description.textContent = project.description || "No description provided";

        const status = document.createElement("p");
        status.textContent = `Status: ${project.status}`;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${project.priority}`;

        const startDate = document.createElement("p");
        startDate.textContent = `Start Date: ${project.startDate}`;

        const deadline = document.createElement("p");
        deadline.textContent = `Deadline: ${project.deadline}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-project-btn");
        deleteBtn.dataset.projectId = project.id;
        deleteBtn.textContent = "Delete";
       
        projectCard.appendChild(projectNameCard);
        projectCard.appendChild(clientInfo);
        projectCard.appendChild(description);
        projectCard.appendChild(status);
        projectCard.appendChild(priority);
        projectCard.appendChild(startDate);
        projectCard.appendChild(deadline);
        projectCard.appendChild(deleteBtn);

        projectListContainer.appendChild(projectCard);
    });
}

function filterProjects(){
    const searchValue = projectSearch.value.toLowerCase().trim();
    const selectedStatus = projectStatusFilter.value;

    const filteredProjects = projects.filter(function(project){
        const client = clients.find(function(client){
            return client.id === project.clientId;
        });

        const projectName = project.projectName.toLowerCase();
        const clientName = client ? client.name.toLowerCase() : "";

        const matchesSearch = projectName.includes(searchValue) || clientName.includes(searchValue);
        const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });
    renderProjects(filteredProjects);
}

projectSearch.addEventListener("input", filterProjects);
projectStatusFilter.addEventListener("change", filterProjects);

function updateProjectStats(){
    totalProjects.textContent = projects.length;

    const inProgressProjectsCount = projects.filter(function(project){
        return project.status === "in-progress";
    }).length;
    inProgressProjects.textContent = inProgressProjectsCount;

    const completedProjectsCount = projects.filter(function(project){
        return project.status === "completed";
    }).length;
    completedProjects.textContent = completedProjectsCount;
}

function refreshProjectsPage(){
    filterProjects();
    updateProjectStats();
}

projectListContainer.addEventListener("click", function(event){
    const checkDeleteClicked = event.target.closest(".delete-project-btn");

    if(checkDeleteClicked){
        const projectId = checkDeleteClicked.dataset.projectId;
        deleteProject(projectId);
    }
});

async function deleteProject(projectId){
    const confirmed = await showConfirmDialog(
        "Delete Project",
        "Are you sure you want to delete this project?"
    );

    if(!confirmed){
        return;
    }

    const projectExists = projects.some(function(project){
        return project.id === projectId;
    });

    if(!projectExists){
        showToast("Project not found.", "error");
        return;
    }

    projects = projects.filter(function(project){
        return project.id !== projectId;
    });

    localStorage.setItem("projectsOnBrowser", JSON.stringify(projects));
    refreshProjectsPage();
    showToast("Project deleted successfully!", "success");
}

refreshProjectsPage();