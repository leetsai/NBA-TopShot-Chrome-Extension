// Only try to execute if the page is loaded
if (window.location.href.indexOf("/p2p/") > -1) {
    if (document.readyState !== "complete") {
        window.addEventListener("load",  setup);
    } else {
        setup();
    }
}

// Adds the price sorting radio button and calls the relevant sort function
function setup() {
    if (document.getElementById("toggle-button-extension") != null) {
        return;
    }

    // Check storage for toggle status default value
    var toggleValue = true;
    chrome.storage.sync.get("topshot-toggle-status", (obj) => {
        if (Object.keys(obj).length === 0 && obj.constructor === Object) {
            chrome.storage.sync.set({ "topshot-toggle-status": true });
        } else {
            toggleValue = obj["topshot-toggle-status"];
        }

        // Add toggle button onload
        var dropdown = document.getElementById('moment-detailed-serialNumber');
        var parentSpan = dropdown.parentElement.parentElement;

        var toggleSwitch = document.createElement("input");
        toggleSwitch.type = "radio";
        toggleSwitch.id = "toggle-button-extension";
        toggleSwitch.checked = toggleValue;

        var toggleLabel = document.createElement("label");
        toggleLabel.for = "toggle-button-extension";
        toggleLabel.innerText = "Sort by Price";
        toggleLabel.style.paddingLeft = "5px";

        var div = document.createElement("div");
        div.appendChild(toggleSwitch);
        div.appendChild(toggleLabel);
        div.onclick = toggleStatus;

        parentSpan.appendChild(div);
        parentSpan.parentElement.style.paddingBottom = "20px";

        // Sort listings by price or serial depending on stored default value
        toggleValue ? sortListings("price") : sortListings("serial");
    });
}

// Simply toggles which property we are sorting by
function toggleStatus() {
    var toggleSwitch = document.getElementById("toggle-button-extension");
    toggleSwitch.checked = !toggleSwitch.checked;
    chrome.storage.sync.set({ "topshot-toggle-status": toggleSwitch.checked });
    if (toggleSwitch.checked == true) {
        sortListings("price");
    }
    else {
        sortListings("serial");
    }
}

// Sort listings by property
function sortListings(sortBy) {
    // Grab the dropdown and listings
    var dropdown = document.getElementById('moment-detailed-serialNumber');
    dropdown.removeChild(dropdown.childNodes[0]);
    var optionsList = dropdown.options;
    
    var newList = [];
    let singlePrice = 0;
    let singleCount = 0;
    let doublePrice = 0;
    let doubleCount = 0;
    let triplePrice = 0;
    let tripleCount = 0;
    let fourDigitPriceOne = 0;
    let fourDigitCountOne = 0;
    let fourDigitPriceTwo = 0;
    let fourDigitCountTwo = 0;
    let fiveDigitPriceOne = 0;
    let fiveDigitCountOne = 0;
    let fiveDigitPriceTwo = 0;
    let fiveDigitCountTwo = 0;

    for (var i = 0; i < optionsList.length; i++) {
        optionsList[i].price = optionsList[i].innerText.split('$')[1];
        newList.push(optionsList[i]);
        // single digit serials
        if (optionsList[i].value < 10) {
            optionsList[i].style.backgroundColor = "#0F5298";
            singlePrice += parseFloat(optionsList[i].price.replace(/,/g, ''));
            singleCount += 1;
        }
        // double digit serials
        else if (optionsList[i].value < 100) {
            optionsList[i].style.backgroundColor = "#3C99DC";
            doublePrice += parseFloat(optionsList[i].price.replace(/,/g, ''));
            doubleCount += 1;
        }
        // triple digit serials
        else if (optionsList[i].value < 1000) {
            optionsList[i].style.backgroundColor = "#66D3FA";
            triplePrice += parseFloat(optionsList[i].price.replace(/,/g, ''));
            tripleCount += 1;
        }
        // four digit serials - 1000 to 4999
        else if (optionsList[i].value < 5000) {
            optionsList[i].style.backgroundColor = "#66D3FA"; // change color
            fourDigitPriceOne += parseFloat(optionsList[i].price.replace(/,/g, ''));
            fourDigitCountOne += 1;
        }
        // four digit serials - 5000 to 9999
        else if (optionsList[i].value < 10000) {
            optionsList[i].style.backgroundColor = "#66D3FA"; // change color
            fourDigitPriceTwo += parseFloat(optionsList[i].price.replace(/,/g, ''));
            fourDigitCountTwo += 1;
        }
        // five digit serials - 10000 to 12499
        else if (optionsList[i].value < 12500) {
            optionsList[i].style.backgroundColor = "#66D3FA"; // change color
            fiveDigitPriceOne += parseFloat(optionsList[i].price.replace(/,/g, ''));
            fiveDigitCountOne += 1;
        }
        // five digit serials - 12500 to 15000
        else if (optionsList[i].value < 15000) {
            optionsList[i].style.backgroundColor = "#66D3FA"; // change color
            fiveDigitPriceTwo += parseFloat(optionsList[i].price.replace(/,/g, ''));
            fiveDigitCountTwo += 1;
        }
        // the rest
        else {
            optionsList[i].style.backgroundColor = "#D5F3FE";
        }
    }

    // sort by price
    if (sortBy == "price") {
        newList = newList.sort((a, b) => {
            if (parseInt(a.price.replace(/,/g, '')) === parseInt(b.price.replace(/,/g, ''))) {
                return 0;
            }
            else {
                return (parseInt(a.price.replace(/,/g, '')) < parseInt(b.price.replace(/,/g, ''))) ? -1 : 1;
            }
        });
    }
    // sort by serial
    else if (sortBy == "serial") {
        newList = newList.sort((a, b) => {
            if (parseInt(a.value) === parseInt(b.value)) {
                return 0;
            }
            else {
                return (parseInt(a.value) < parseInt(b.value)) ? -1 : 1;
            }
        });
    }

    // replace listing with their sorted correspondants 
    for (var i = 0; i <= optionsList.length; i++) {
        optionsList[i] = newList[i];
    }
    optionsList[0].selected = true;

    console.log('=================================');
    console.log('0-9 average price: ', average(singlePrice, singleCount));
    console.log('10-99 average price: ', average(doublePrice, doubleCount));
    console.log('100-999 average price: ', average(triplePrice, tripleCount));
    console.log('1000-4999 average price: ', average(fourDigitPriceOne, fourDigitCountOne));
    console.log('5000-9999 average price: ', average(fourDigitPriceTwo, fourDigitCountTwo));
    console.log('10000-12499 average price: ', average(fiveDigitPriceOne, fiveDigitCountOne));
    console.log('12500-15000 average price: ', average(fiveDigitPriceTwo, fiveDigitCountTwo));
    console.log('================================= \n');
}

var average = function(sum, count) {
    let average = +sum / +count;

    return isNaN(average) ? "no sales in this range" : average.toFixed(2);
}