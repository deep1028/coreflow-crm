const newClientBtn = document.getElementById("new-client-btn");
const newClientForm = document.getElementById("new-client-form-section");
const cancelCleintBtn = document.getElementById("cancel-client-btn");
const saveClientBtn = document.getElementById("save-client-btn");

const clients = JSON.parse(localStorage.getItem("dataOnBrowser")) || [];

let clientNameInput = document.getElementById("client-name");
let clientEmailInput = document.getElementById("client-email");
let clientPhoneInput = document.getElementById("client-phone");
let clientCompanyNameInput = document.getElementById("client-company-name");

const clientSearch = document.getElementById("client-search");

newClientBtn.addEventListener('click', function(){
    newClientForm.style.display = "block";
});

cancelCleintBtn.addEventListener('click', function(){
    newClientForm.style.display = "none";
});

saveClientBtn.addEventListener('click', function(event){
    event.preventDefault();
    console.log("Save button clicked");

    if (clientNameInput.value == "") {
        alert("Client Name can not be empty");
        return;
    }
    else if(clientEmailInput.value == ""){
        alert("Client Email can not be empty");
        return;
    }
    else if(clientPhoneInput.value == ""){
        alert("Client phone number can not be empty");
        return;
    }
    else if(clientCompanyNameInput.value == ""){
        alert("Company name can not be empty");
        return;
    }

    for(const client of clients){
        if(clientEmailInput.value == client.email){
            alert("Client already exists");
            clientNameInput.value = "";
            clientEmailInput.value = "";
            clientPhoneInput.value = "";
            clientCompanyNameInput.value = "";
            newClientForm.style.display = "none";
            return;
        }
    }

    const client = {
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

    alert("client is saved");   
});

function renderClients(clientList){
    let tableBody = document.getElementById("client-table-body");
    tableBody.innerHTML = "";
    clientList.forEach(function(client, index){
        let tableRow = document.createElement("tr");
        tableRow.innerHTML = `<td>${client.name}</td><td>${client.companyName}</td><td>Active</td><td>Not Scheduled</td>
                              <td><button type="button" class="delete-client-btn-table" data-index="${index}">Delete</button></td>`;
        tableBody.appendChild(tableRow);
    });

    const deleteBtns = document.querySelectorAll(".delete-client-btn-table");

    deleteBtns.forEach(function(button){
        button.addEventListener("click", function(){
            const clientIndextobeDelete = button.dataset.index;
            if (!confirm("Are you sure you want to delete this client?")){
                return;
            }
            clients.splice(clientIndextobeDelete, 1);
            const storeData = JSON.stringify(clients);
            localStorage.setItem("dataOnBrowser", storeData);
            renderClients(clients);
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