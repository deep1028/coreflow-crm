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