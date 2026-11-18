const newClientBtn = document.getElementById("new-client-btn");
const newClientForm = document.getElementById("new-client-form-section");
const clientForm = document.getElementById("new-client-form");
const cancelClientBtn = document.getElementById("cancel-client-btn");
const saveClientBtn = document.getElementById("save-client-btn");

let clients = JSON.parse(localStorage.getItem("dataOnBrowser")) || [];

clients = clients.map(function(client){
    return {
        ...client,
        id: client.id || crypto.randomUUID()
    };
});

localStorage.setItem("dataOnBrowser", JSON.stringify(clients));

const clientNameInput = document.getElementById("client-name");
const clientEmailInput = document.getElementById("client-email");
const clientPhoneInput = document.getElementById("client-phone");
const clientCompanyNameInput = document.getElementById("client-company-name");

const clientSearch = document.getElementById("client-search");

const toastContainer = document.getElementById("toast-container")
const confirmDialog = document.getElementById("confirm-dialog")
const confirmTitle = document.getElementById("confirm-title")
const confirmMessage = document.getElementById("confirm-message")
const confirmCancelBtn = document.getElementById("confirm-cancel")
const confirmAcceptBtn = document.getElementById("confirm-accept")

function removeToast(toast) {
    if (toast.classList.contains("toast-hide")){
        return;
    }

    toast.classList.add("toast-hide");
    
    setTimeout(function() {
        toast.remove();
    },300);
}

function showToast(message, type){
    const toast = document.createElement("div");
    toast.classList.add("toast", `toast-${type}`);

    const spanTagforText = document.createElement("span");
    spanTagforText.classList.add("toast-message");
    spanTagforText.textContent = message;
    
    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.classList.add("toast-close");
    
    toast.appendChild(spanTagforText);
    toast.appendChild(btn);
    toastContainer.appendChild(toast);

    requestAnimationFrame(function(){
        toast.classList.add("toast-show");
    });

    let dismissTimer = setTimeout(function(){
        removeToast(toast);
    }, 3500);

    btn.addEventListener("click", function() {
        clearTimeout(dismissTimer);
        removeToast(toast);
    });
}

function showConfirmDialog(title, message){
    return new Promise(function(resolve){
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;

        function handleCancel(){
            confirmDialog.close();
            cleanup();
            resolve(false);
        }

        function handleAccept(){
            confirmDialog.close();
            cleanup();
            resolve(true);
        }

        function handleEscape(){
            cleanup();
            resolve(false);
        }

        function cleanup(){
            confirmCancelBtn.removeEventListener("click", handleCancel);
            confirmAcceptBtn.removeEventListener("click", handleAccept);
            confirmDialog.removeEventListener("cancel", handleEscape);
        }

        confirmCancelBtn.addEventListener("click", handleCancel);
        confirmAcceptBtn.addEventListener("click", handleAccept);
        confirmDialog.addEventListener("cancel", handleEscape);

        confirmDialog.showModal();
    });
}

newClientBtn.addEventListener('click', function(){
    newClientForm.style.display = "block";
});

cancelClientBtn.addEventListener('click', function(){
    clientForm.reset();
    newClientForm.style.display = "none";
});

clientForm.addEventListener("submit", function(event){
    event.preventDefault();

    const name = clientNameInput.value.trim().toLowerCase();
    const email = clientEmailInput.value.trim().toLowerCase();
    const phone = clientPhoneInput.value.trim();
    const companyName = clientCompanyNameInput.value.trim();

    if(!name || !email || !phone || !companyName){
        showToast("Please fill in all fields.", "warning");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)){
        showToast("Please enter a valid email address.", "error");
        return;
    }

    const emailExists = clients.some(function(client){
        return (client.email || "").trim().toLowerCase() === email;
    });

    if(emailExists){
        showToast("A client with this email already exists.", "error");
        return;
    }

    const client = {
        id: crypto.randomUUID(),
        name: name,
        email: email,
        phone: phone,
        companyName: companyName
    };

    clients.push(client);
    localStorage.setItem("dataOnBrowser", JSON.stringify(clients));

    const searchTerm = clientSearch.value.trim().toLowerCase();

    const filteredClients = clients.filter(function(client){
        return client.name.toLowerCase().includes(searchTerm);
    });

    renderClients(filteredClients);

    clientForm.reset();

    newClientForm.style.display = "none";

    showToast("Client saved successfully!", "success");
});

function renderClients(clientList){
    const tableBody = document.getElementById("client-table-body");
    tableBody.innerHTML = "";

    if(clientList.length === 0){
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.classList.add("empty-state");

        cell.textContent = clients.length === 0
            ? "No clients added yet."
            : "No matching clients found.";
        
        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    clientList.forEach(function(client){
        const tableRow = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = client.name;
        tableRow.appendChild(nameCell);

        const companyCell = document.createElement("td");
        companyCell.textContent = client.companyName;
        tableRow.appendChild(companyCell);

        const statusCell = document.createElement("td");
        statusCell.textContent = "Active";
        tableRow.appendChild(statusCell);

        const meetingCell = document.createElement("td");
        meetingCell.textContent = "Not Scheduled";
        tableRow.appendChild(meetingCell);

        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-client-btn-table");
        deleteButton.dataset.id = client.id;
        deleteCell.appendChild(deleteButton);
        tableRow.appendChild(deleteCell);

        tableBody.appendChild(tableRow);
    });

    const deleteBtns = tableBody.querySelectorAll(".delete-client-btn-table");

    deleteBtns.forEach(function(button){
        button.addEventListener('click', async function(){
            const clientIdtoDelete = button.dataset.id;

            const confirmed = await showConfirmDialog(
                "Delete Client?",
                "Are you sure you want to delete this client?"
            );

            if (!confirmed){
                return;
            }

            clients = clients.filter(function(client){
                return client.id !== clientIdtoDelete;
            });

            localStorage.setItem("dataOnBrowser", JSON.stringify(clients));

            const searchTerm = clientSearch.value.trim().toLowerCase();

            const filteredClients = clients.filter(function(client){
                return client.name.toLowerCase().includes(searchTerm);
            });
            renderClients(filteredClients);
            showToast("Client deleted successfully!", "success");
        });
    });
}
renderClients(clients);

clientSearch.addEventListener("input", function(){

    const filteredClients = clients.filter(function(client){
        return client.name.toLowerCase().includes(clientSearch.value.toLowerCase());
    });

    renderClients(filteredClients);
});