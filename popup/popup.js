document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("professional_info_form");
    form.addEventListener("submit", onSubmit);

    const fillFormButton = document.getElementById('fill');
    fillFormButton.addEventListener('click', onFill);

    chrome.storage.sync.get(['professional_info']).then(items => {
        if (!items.professional_info) {
            return;
        }

        Object.entries(items.professional_info).forEach(([key, value]) => {
            if (key && value) {
                document.getElementById(key).value = value;
            }
        })
    })

});

function persist(data) {
    chrome.storage.sync.set({professional_info: data}).then(() => {
        console.log('Data succesfully saved into local storage.');
        document.getElementById("success-message").classList.remove("visually-hidden");
    })
}

function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = parseFormValuesToObject(form);

    persist(formData);
}

function parseFormValuesToObject(form) {
    const data = {};
    console.log(form.elements);
    for (const element of form.elements) {
        if (
            (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
            && element.type !== "submit")
        {
            data[element.name] = element.value;
        }
    }

    return data;
}

function onFill() {
    const form = document.getElementById('professional_info_form');
    const formData = parseFormValuesToObject(form);

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];

        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: fillInputsOnPage,
            args: [formData]
        });
    });
}
 
function fillInputsOnPage(data) {
    const nameInputs = document.querySelectorAll("input[name*='name'], input[id*='name'], input[placeholder*='name']");
    if (nameInputs.length > 0) {
        if (nameInputs.length > 2) {
            nameInputs[0].value = data.first_name;
            nameInputs[1].value = data.middle_name;
            nameInputs[2].value = data.last_name;
        } else if (nameInputs.length === 2) {
            nameInputs[0].value = `${data.first_name} ${data.middle_name}`;
            nameInputs[1].value = data.last_name;
        } else {
            nameInputs[0].value = `${data.first_name} ${data.middle_name} ${data.last_name}`;
        }
    }

    const emailInput = document.querySelector("input[type='email'], input[id*='email'], input[name*='email'], input[placeholder*='email']")
    if (emailInput) {
        emailInput.value = data.email;
    }

    const phoneInput = document.querySelector("input[type='tel'], input[id*=phone], input[name*='phone']")
    if (phoneInput) {
        phoneInput.value = data.phone;
    }

    const birthDayInput = document.querySelector("input[type='date'], input[id*=birth], input[name*='birth']")
    if (birthDayInput) {
        birthDayInput.value = data.birth_day;
    }

    const linkedinInput = document.querySelector("input[id*=linkedin],input[name*='linkedin']")
    if (linkedinInput) {
        linkedinInput.value = data.linkedin;
    }

    const githubInput = document.querySelector("input[id*=github],input[name*='github']")
    if (githubInput) {
        githubInput.value = data.github;
    }

    const bioTextarea = document.querySelector("textarea[id*=bio],textarea[name*='bio']")
    if (bioTextarea) {
        bioTextarea.value = data.bio;
    }
}


