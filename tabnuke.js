document.querySelector("#nuke_this").addEventListener("click", nukeThis);
document.querySelector("#nuke_left").addEventListener("click", nukeLeft);
document.querySelector("#nuke_right").addEventListener("click", nukeRight);
document.querySelector("#nuke_all").addEventListener("click", nukeAll);
document.querySelector("#nuke_other").addEventListener("click", nukeOther);
document.querySelector("#view_list").addEventListener("click", viewList);

const DIALOG_TIMEOUT = 10 * 1000; // 30 secs
const PROGRESS_BAR_SMOOTHNESS = 50; // millisecs; higher = smoother
const PROGRESS_BAR_INC_WIDTH = 100 * PROGRESS_BAR_SMOOTHNESS / DIALOG_TIMEOUT;

let currentTabIdx = undefined;

const btns = document.getElementsByClassName("btn_main");
function disableBtn() {
    for (let i = 0; i < btns.length; i++) {
        btns.item(i).setAttribute("disabled", "");
    }
}

function enableBtn() {
    for (let i = 0; i < btns.length; i++) {
        btns.item(i).removeAttribute("disabled");
    }
}

async function confirmDialog(prompt) {
    let dialogBox = document.querySelector("#confirmDialog");
    document.querySelector("#msg").innerText = prompt;
    dialogBox.style.display = "block";

    let barWidth = 0;
    let intervalID = setInterval(() => {
        barWidth += PROGRESS_BAR_INC_WIDTH;
        document.querySelector("#timeoutBar").style.width = barWidth + "%";

        if (barWidth === 100) {
            clearInterval(intervalID);
            barWidth = 0;
            document.querySelector("#timeoutBar").style.width = 0 + "%";
        }
    }, PROGRESS_BAR_SMOOTHNESS);

    let result = await new Promise((resolve, reject) => {
        let timeoutID = setTimeout(() => {
            resolve(false);
            dialogBox.style.display = "none";
            clearInterval(intervalID);
            barWidth = 0;
            document.querySelector("#timeoutBar").style.width = 0 + "%";
        }, DIALOG_TIMEOUT)

        document.querySelector("#btn_yes").addEventListener("click", () => {
            resolve(true);
            dialogBox.style.display = "none";
            clearInterval(intervalID);
            barWidth = 0;
            document.querySelector("#timeoutBar").style.width = 0 + "%";
            clearTimeout(timeoutID);
        });

        document.querySelector("#btn_no").addEventListener("click", () => {
            resolve(false);
            dialogBox.style.display = "none";
            clearTimeout(timeoutID);
            clearInterval(intervalID);
            barWidth = 0;
            document.querySelector("#timeoutBar").style.width = 0 + "%";
        });
    })

    return result;
}

async function nukeTabs(filter) {
    const currentTab = await browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
            return tabs[0];
        });
    currentTabIdx = currentTab.index;

    const tabList = (await browser.tabs
        .query({ currentWindow: true }).then((tabs) => {
            let temp = [];
            for (const tab of tabs)
                temp.push(tab);

            return temp;
        }))
        .filter(filter);

    console.log(tabList);

    disableBtn();

    // TODO: save to indexedDB
    // TODO: check nuke 0 tab
    if (await confirmDialog("wanna nuke " + tabList.length + " tab(s)?")) {
        console.log("dialog confirmed");
    } else {
        console.log("dialog denied");
    }

    enableBtn();
}


async function nukeThis() { nukeTabs((tab) => tab.index === currentTabIdx); /* bad lol */ }
async function nukeLeft() { nukeTabs((tab) => tab.index < currentTabIdx); }
async function nukeRight() { nukeTabs((tab) => tab.index > currentTabIdx); }
async function nukeAll() { nukeTabs((tab) => { return tab }); } // lmao
async function nukeOther() { nukeTabs((tab) => tab.index != currentTabIdx); }

async function viewList() {
    const req = window.indexedDB.open("TabDB", 3);
    req.onerror = (event) => {
        console.error("indexedDB error!");
    }

    req.onsuccess = (event) => {
        console.log("heeeeeee");
    }

    console.log("viewList");
}
