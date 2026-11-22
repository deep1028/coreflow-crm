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

const clients = JSON.parse(localStorage.getItem("dataOnBrowser")) || [];

const len = clients.length;
if (len == 0) {
    const opt = document.createElement("option");
    opt.value = "no-client";
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
    const projectStatus = projectStatusSelect.value.trim();
    const projectPriority = projectPrioritySelect.value.trim();
    const startDate = projectStartDateInput.value.trim();
    const deadline = projectDeadlineInput.value.trim();

    const clientExists = clients.some(function(client){ 
        return client.id === selectedClientId;
    });

    if(!projectName){
        alert("Please enter a project name.");
        return;
    }

    if(!selectedClientId || !clientExists){
        alert("Please select a valid client.");
        return;
    }

    if(!startDate || !deadline){
        alert("Please select both project dates.");
        return;
    }

    if (deadline < startDate){
        alert("Deadline cannot be earlier than the start date.");
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

    const projects = JSON.parse(localStorage.getItem("projectsOnBrowser")) || [];
    projects.push(newProject);

    localStorage.setItem("projectsOnBrowser", JSON.stringify(projects));

    projectForm.reset();
    projectFormContainer.style.display = "none";

    alert("Project created successfully!");
});