const newClientBtn = document.getElementById("new-client-btn");
const newClientForm = document.getElementById("new-client-form-section");
const cancelClientBtn = document.getElementById("cancel-client-btn");
const saveClientBtn = document.getElementById("save-client-btn");

let clients = JSON.parse(localStorage.getItem("dataOnBrowser")) || [];

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
            confirmCancelBtn.addEventListener("click", handleCancel);
            confirmAcceptBtn.addEventListener("click", handleAccept);
            confirmDialog.addEventListener("cancel", handleEscape);
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
    newClientForm.style.display = "none";
});

saveClientBtn.addEventListener('click', function(event){
    event.preventDefault();

    if (clientNameInput.value == "") {
        showToast("Client Name can not be empty", "warning");
        return;
    }
    else if(clientEmailInput.value == ""){
        showToast("Client Email can not be empty", "warning");
        return;
    }
    else if(clientPhoneInput.value == ""){
        showToast("Client phone number can not be empty", "warning");
        return;
    }
    else if(clientCompanyNameInput.value == ""){
        showToast("Company name can not be empty", "warning");
        return;
    }

    for(const client of clients){
        if(clientEmailInput.value == client.email){
            showToast("Client already exists!", "error");
            clientNameInput.value = "";
            clientEmailInput.value = "";
            clientPhoneInput.value = "";
            clientCompanyNameInput.value = "";
            newClientForm.style.display = "none";
            return;
        }
    }

    const client = {
        id: crypto.randomUUID(),
        name: clientNameInput.value,
        email: clientEmailInput.value,
        phone: clientPhoneInput.value,
        companyName: clientCompanyNameInput.value
    };
    clients.push(client);

    const storeData = JSON.stringify(clients);

    localStorage.setItem("dataOnBrowser", storeData);

    console.log(clients);
    renderClients(clients);

    clientNameInput.value = "";
    clientEmailInput.value = "";
    clientPhoneInput.value = "";
    clientCompanyNameInput.value = "";

    newClientForm.style.display = "none";

    showToast("Client is saved!", "success");
});

function renderClients(clientList){
    let tableBody = document.getElementById("client-table-body");
    tableBody.innerHTML = "";
    clientList.forEach(function(client, index){
        let tableRow = document.createElement("tr");
        tableRow.innerHTML = `<td>${client.name}</td><td>${client.companyName}</td><td>Active</td><td>Not Scheduled</td>
                              <td><button type="button" class="delete-client-btn-table" data-id="${client.id}">Delete</button></td>`;
        tableBody.appendChild(tableRow);
    });

    const deleteBtns = document.querySelectorAll(".delete-client-btn-table");

    deleteBtns.forEach(function(button){
        button.addEventListener('click', async function(){
            const clientIndextobeDelete = button.dataset.id;

            const confirmed = await showConfirmDialog(
                "Delete Client?",
                "Are you sure you want to delete this client?"
            );

            if (!confirmed){
                return;
            }

            clients = clients.filter(function(client){
                return client.id !== clientIndextobeDelete;
            });

            const storeData = JSON.stringify(clients);
            localStorage.setItem("dataOnBrowser", storeData);

            renderClients(clients);

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