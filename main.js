// DEV
const DEV_API_URL = 'http://localhost:3000'
// PROD
const RENDER_API_URL = 'https://portulemicas-api.onrender.com'

// storing full name of all months in array
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
              "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const daysTag = document.querySelector(".days");
const currentCalendarDate = document.querySelector("#calendar-current-year");
const description = document.querySelector(".description-wrapper");
const currentNewsListDate = document.querySelector("#news-list-current-year");
const newsListWrapper = document.querySelector(".news-wrapper");
const form = document.querySelector(".actions form");
const inputPartyName = document.querySelector(".actions #fpartyname");
const inputLink = document.querySelector(".actions #link");
const submitButton = document.querySelector(".submit-button");
const countdown = document.querySelector(".countdown");
const deleteButton = document.querySelector(".deletebtn");

var timeleft = 29;
var interval = setInterval(function(){ 
    if(timeleft <= 0){
        clearInterval(interval);
        countdown.innerHTML = "";
    } else {
        countdown.innerHTML = timeleft + " segundos";
    }
    timeleft -= 1;
}, 1000);

// getting new date, current year and month
let date = new Date(),
calendarCurrYear = date.getFullYear(),
currMonth = date.getMonth(),
currDay = date.getDate(),
newsListCurrYear = date.getFullYear();

var selectedMonth = currMonth;
var selectedYear = calendarCurrYear;

var removingObjButtonReference = undefined
var removingObjectKey = undefined

var json = [];

/**
 * Gets the color of a party
 * @param {*} party The party
 */
const getPartyColor = (party) => {
    const partido = party.toLowerCase()

    if (partido === 'pcp') {
        return '#ff0000';
    }
    else if (partido === 'be') {
        return '#ff006f';
    }
    else if (partido === 'livre') {
        return '#540057';
    }
    else if (partido === 'pan') {
        return '#0e5700';
    }
    else if (partido === 'ps') {
        return '#d65681';
    }
    else if (partido === 'psd') {
        return '#ff7700';
    }
    else if (partido === 'il') {
        return '#362bff';
    }
    else if (partido === 'chega') {
        return '#b0cc0e';
    }
    else {
        return '#000000';
    }
}

/**
 * Check if anything happened in a specific date.
 * @returns Return a string with the required html data
 */
const getPolemsColors = (year, month, day) => {
    var res = ''
    year_data = json[year]
    if (year_data === null || year_data === undefined) {
        return res;
    }
    month_data = year_data[month+1]
    if (month_data === null || month_data === undefined) {
        return res;
    }
    day_data = month_data[day]
    if (day_data === null || day_data === undefined) {
        return res;
    }
    var parties = [];
    for (obj_key in day_data) {
        const d_data = day_data[obj_key]
        const party = d_data['party'];
        if (!parties.includes(party)) {
            parties.push(party)
            //res += `<span class="dot" style="--tooltip-color: ${getPartyColor(party)};"></span>`
            res += `<div class="dot-div" style="--tooltip-color: ${getPartyColor(party)};"></div>`
        }
    }
    return res;
}

/**
 * Get the events of a determined day
 * @param {*} year 
 * @param {*} month 
 * @param {*} day 
 */
const getDescriptions = (year, month, day) => {
    var res = '';
    year_data = json[year]
    if (year_data === null || year_data === undefined) {
        return '<p>Nada a mostrar.</p>';
    }
    month_data = year_data[month+1]
    if (month_data === null || month_data === undefined) {
        return '<p>Nada a mostrar.</p>';
    }
    day_data = month_data[day]
    if (day_data === null || day_data === undefined) {
        return '<p>Nada a mostrar.</p>';
    }
    for (obj_key in day_data) {
        const d_data = day_data[obj_key]
        const party = d_data['party'];
        const status = d_data['status'];
        const link = d_data['url'];
        res += `<li style="list-style-type: none;">`// class="status_${status}">`
        res += `<span class="dot-span" style="--tooltip-color: ${getPartyColor(party)};"></span>`
        res += `<span>${party.toUpperCase()}</span>`
        //res += `<span class="status_text">(${status ? "verificada" : "não verificada"})</span>`
        res += `<p>${d_data['title']}</p>`
        res += `<p class="link_noticia"><a href="${link}" target="_blank">LINK</a></p>`
        res += `<button onclick="document.getElementById('id01').style.display='block'; setRemoveObjectKey(this,\'${obj_key}\')"><i class="fa fa-trash" aria-hidden="true"></i></button>`
        res += '</li>\n'
    }
    return res;
}

/**
 * Render the calendar for a year and date
 */
const renderCalendar = () => {
    let firstDayofMonth = new Date(calendarCurrYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(calendarCurrYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(calendarCurrYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(calendarCurrYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";

    var total_days = 0
    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive previous-month">${lastDateofLastMonth - i + 1}<br><div class="dot-container">`;
        // get previous month
        let m = currMonth - 1;
        let y = calendarCurrYear;
        // if previous month is negative, means it looped to december
        // so, change month to december and one year before
        if (m < 0) {
            m = 11;
            y = calendarCurrYear - 1;
        }
        liTag += getPolemsColors(y, m, lastDateofLastMonth - i + 1)
        liTag += '</div></li>'
        total_days += 1;
    }

    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday = i === currDay ? "selected" : "";
        liTag += `<li class="${isToday}">${i}<br><div class="dot-container">`;
        liTag += getPolemsColors(calendarCurrYear, currMonth, i)
        liTag += `</div></li>`;
        total_days += 1;
    }

    for (let i = lastDayofMonth; i < 13; i++) { // creating li of next month first days
        //console.log(i, lastDayofMonth, i - lastDayofMonth + 1)
        liTag += `<li class="inactive next-month">${i - lastDayofMonth + 1}<br><div class="dot-container">`
        // get next month
        let m = currMonth + 1;
        let y = calendarCurrYear;
        // if next month is bigger than 11, means it looped to january
        // so, change month to january and one year after
        if (m > 11) {
            m = 0;
            y = calendarCurrYear + 1;
        }
        liTag += getPolemsColors(y, m, i - lastDayofMonth + 1)
        liTag += `</div></li>`
        total_days += 1;
        
        if (total_days > 41) {
            break
        }
    }

    // Toggle active month
    var elems = document.querySelectorAll(".months .active");
    [].forEach.call(elems, function(el) {
        el.classList.remove("active");
    });
    monthMenu = document.querySelector(`#m${currMonth}`)
    monthMenu.className = "active";

    currentCalendarDate.innerText = `${calendarCurrYear}`; // passing current mon and yr as currentCalendarDate text
    daysTag.innerHTML = liTag;

    // Change the description accordingly
    description.innerHTML = getDescriptions(calendarCurrYear, currMonth, currDay);
}

const renderNewsList = () => {
    currentNewsListDate.innerText = `${newsListCurrYear}`;
    let innerTag = '';
    year_data = json[newsListCurrYear]
    if (year_data === null || year_data === undefined) {
        innerTag = '<p>Wow, não há nada a mostrar.</p>';
    }
    else {
        let fullLiTag = ''
        for (var month_key in year_data){
            const day_values = year_data[month_key]
            for (var day_key in day_values){
                const day_objects = day_values[day_key] // List of day events
                
                for (obj_key in day_objects) {
                    const obj = day_objects[obj_key]
                    let liTag = ''
                    liTag += `<li>`
                    liTag += `<li> `// class="status_${obj['status']}">`
                    liTag += `<a href="${obj['url']}" target="_blank">`
                    liTag += `<img src="${obj['image']}" alt="Logo Image">`
                    liTag += `<div class="news-text-details">`
                    liTag += `<h2>${obj['title']}`
                    //liTag += `<span class="status_text">(${obj['status'] ? "verificada" : "não verificada"})</span>`
                    liTag += `</h2>`
                    liTag += `<div class="news-description">`
                    liTag += `${obj['description']}`
                    liTag += `</div>`
                    liTag += `<p class="news-date">${day_key} de ${months[parseInt(month_key) - 1]}</p>`
                    liTag += `</div>`
                    liTag += `</a></li>`

                    fullLiTag = liTag + fullLiTag
                }
            }
        }
        innerTag = `<ul class="news">`
        innerTag += fullLiTag
        innerTag += `</ul>`
    }
    newsListWrapper.innerHTML = innerTag;
}

const fetchResponseWithTimeout = (base_url, endpoint, method, body) => {
    const timeout = 1000 * 30 ;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const url = base_url + endpoint;
    var options = {}

    if (method === "GET") {
        options = {
            method: 'GET',
            mode: 'cors',
            dataType : 'jsonp',
            headers: {
                'Content-Type': 'application/jsonp'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            signal: controller.signal
        }
    }
    else if (method === "POST") {
        options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
            signal: controller.signal
        }
    }
    else if (method === "DELETE") {
        options = {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            signal: controller.signal
        }
    }

    return fetch(url, options)
    .then((response) => {
        clearTimeout(id);
        
        // status varies according to get/post
        if (method === "GET" && response.status === 200) {
            return response.json()
        }
        else if (method === "POST" && response.status === 201) {
            return response.json()
        }
        else if (method === "DELETE" && response.status === 202) {
            return response.json()
        }
        else {
            throw 'There was an error.'
        }
    })
    .catch((error) => {
        //console.log("Error on fetchResponseWithTimeout : ", error)
        throw 'Timeout error.'
    })
}

const getCalendarData = () => {
    // Try to get data from render
    return fetchResponseWithTimeout(RENDER_API_URL, '/api/all', "GET", null)
    .then((data) => {
        return data
    })
    .catch((render_error) => {
        // There was a timeout with this link, try next
        //timeleft = 29;

        /*
        return fetchResponseWithTimeout(DEV_API_URL)
        .then((data) => {
            return data
        })
        .catch((dev_error) => {
            // There was a timeout with this link, try next
            return fetch("../data.json").then((res) => res.json())
        })
        */

        showToast(1, "Não foi possível conectar com o servidor.\nOs dados não serão sincronizados.")
        return fetch("./data.json").then((res) => res.json())
    })
}

const createToastHTML = (type, message) => {
    var types = ['bg-danger', 'bg-warning', 'bg-success', 'bg-primary']
    let alertWrapper = document.querySelector('.toast-container');
    let tag = ''

    //tag += `<div class="toast align-items-center text-${types[type]} border-0" role="alert" aria-live="assertive" aria-atomic="true">`
    
    tag += `<div id="liveToast" class="toast hide text-${types[type]}" role="alert" aria-live="assertive" aria-atomic="true">`
    tag += `<div class="d-flex">`
    tag += `<div class="toast-body">`
    tag += `${message}`
    tag += `</div>`
    tag += `<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>`
    tag += `</div>`
    tag += `</div>`

    alertWrapper.innerHTML = tag
}

const showToast = (type, message) => {
    createToastHTML(type, message)

    let myAlert = document.querySelector(`.toast`);
    let bsAlert = new bootstrap.Toast(myAlert);
    
    bsAlert.show();
};

/**
 * When the document is ready, start by fetching the json, then add html to the file
 */
$(document).ready(function () {
    try {
        getCalendarData()
        .then((data) => {
            json = data

            document.getElementsByClassName("loading-wrapper")[0].style.display = 'none';
            document.getElementsByClassName("calendar-wrapper")[0].style.display = 'block';
            document.getElementsByClassName("news-list")[0].style.display = 'block';

            execute()
        })
    } catch (error) {
        console.log(error);
    }
});

const execute = () => {
    renderCalendar();
    renderNewsList();

    var prevNextCalendarHeaderIcon = document.querySelectorAll("#calendar-header-icons span"),
    monthsSelection = document.querySelectorAll(".months li"),
    daysSelection = document.querySelectorAll(".days li"),
    prevNextNewsListHeaderIcon = document.querySelectorAll("#news-list-header-icons span");

    /* Execute for calendar section */

    prevNextCalendarHeaderIcon.forEach(icon => { // getting prev and next icons
        icon.addEventListener("click", () => { // adding click event on both icons
            // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
            calendarCurrYear = icon.id === "prev" ? calendarCurrYear - 1 : calendarCurrYear + 1;
            date = new Date(calendarCurrYear, currMonth);
            calendarCurrYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
            renderCalendar(); // calling renderCalendar function
            daysSelection = document.querySelectorAll(".days li");
            createDayWatchers(daysSelection)
        });
    });

    monthsSelection.forEach(month => {
        month.addEventListener("click", () => {
            const clicked_month_id = month.id.substring(1);
            currMonth = parseInt(clicked_month_id)
            date = new Date(calendarCurrYear, currMonth);
            renderCalendar(); // calling renderCalendar function
            daysSelection = document.querySelectorAll(".days li");
            createDayWatchers(daysSelection)
        });
    });

    createDayWatchers(daysSelection)

    /* Listem for submissions of events */

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const partyName = inputPartyName.value;
        const newsLink = inputLink.value;

        if (!partyName) {
            showToast(0, "Por favor, preencha o partido a que a notícia está associada.")
            //alert("Por favor, preencha o partido a que a notícia está associada.");
            return;
        }
        if (!newsLink) {
            showToast(0, "Por favor, preencha o link da notícia.")
            //alert("Por favor, preencha o link da notícia.");
            return;
        }

        // this allows us to know what is the date after execution
        // even if the user selects another day in the meantime
        const y = selectedYear;
        const m = selectedMonth;
        const d = currDay
        
        // check if its the future.. we cant add to the future
        const selectedDate = new Date(y, m, d);
        if (selectedDate > new Date()) {
            showToast(0, "Não é possível prever o futuro. Por favor selecione uma data válida.")
            return
        }

        showToast(3, "A tentar adicionar notícia.\nPor favor aguarde.")

        submitButton.disabled = true;
        submitButton.style.opacity = 0.8;

        var submitTimeleft = 29;
        var submitInterval = setInterval(function(){ 
            if(submitTimeleft <= 0){
                clearInterval(submitInterval);
                submitButton.innerHTML = "Submeter";
                submitButton.disabled = false;
                submitButton.style.opacity = 1;
            } else {
                submitButton.innerHTML = submitTimeleft + " segundos";
            }
            submitTimeleft -= 1;
        }, 1000);

        // send request to api
        fetchResponseWithTimeout(
            RENDER_API_URL, 
            `/api/create/${y}/${m+1}/${d}`, 
            "POST", 
            JSON.stringify({
                "party" : partyName,
                "url" : newsLink
            })
        )
        .then((data) => {
            clearInterval(submitInterval);
            submitButton.innerHTML = "Submeter";
            submitButton.disabled = false;
            submitButton.style.opacity = 1;

            showToast(2, `Notícia do dia ${y}/${m+1}/${d} criada com sucesso.`)

            // add to local json the just-added element
            if (!json[y]) {
                json[y] = {}
            }
            if (!json[y][m+1]) {
                json[y][m+1] = {}
            }
            if (!json[y][m+1][d]) {
                json[y][m+1][d] = {}
            }

            json[y][m+1][d][data['key']] = data['data']

            renderCalendar();
            renderNewsList();

            daysSelection = document.querySelectorAll(".days li");
            createDayWatchers(daysSelection)
        })
        .catch((render_error) => {
            // There was a timeout with this link, warn the user
            //alert("Não foi possível criar a notícia ou esta já existe.");
            showToast(0, "Não foi possível criar a notícia ou esta já existe.")

            clearInterval(submitInterval);
            submitButton.innerHTML = "Submeter";
            submitButton.disabled = false;
            submitButton.style.opacity = 1;
        })

        inputLink.value = '';
    })

    /* Execute for news list section */

    prevNextNewsListHeaderIcon.forEach(icon => { // getting prev and next icons
        icon.addEventListener("click", () => { // adding click event on both icons
            // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
            newsListCurrYear = icon.id === "prev" ? newsListCurrYear - 1 : newsListCurrYear + 1;
            renderNewsList();
        });
    });
}

const createDayWatchers = (daysSelection) => {
    daysSelection.forEach(day => {
        day.addEventListener("click", () => {
            currDay = parseInt( day.innerText.replace('\n', '') )
            const classes = day.classList
            
            selectedMonth = currMonth;
            selectedYear = calendarCurrYear;
            if (classes.contains('previous-month')) {
                selectedMonth = selectedMonth - 1;
                // if previous month is negative, means it looped to december
                // so, change month to december and one year before
                if (selectedMonth < 0) {
                    selectedMonth = 11;
                    selectedYear = calendarCurrYear - 1;
                }
            }
            else if (classes.contains('next-month')) {
                selectedMonth = selectedMonth + 1;
                // if previous month is negative, means it looped to december
                // so, change month to december and one year before
                if (selectedMonth > 11) {
                    selectedMonth = 0;
                    selectedYear = calendarCurrYear + 1;
                }
            }

            // Toggle active day
            var elems = document.querySelectorAll(".days .selected");
            [].forEach.call(elems, function(el) {
                el.classList.remove("selected");
            });
            day.classList.add("selected");

            description.innerHTML = getDescriptions(selectedYear, selectedMonth, currDay);
        });
    });
}

/* Description remove buttons */
function setRemoveObjectKey(element, key) {
    removingObjButtonReference = element
    removingObjectKey = key;
}

/*  When we cancel the removal of an element */
function cancelRemove() {
    removingObjectKey = undefined;
    removingObjButtonReference = undefined
}

/* When removing an element */
function executeRemove() {
    if (!removingObjectKey || !removingObjButtonReference) {
        return
    }

    // Note that... this works, but if another day is selected and we come back, the button is enabled
    const removeBtn = removingObjButtonReference
    const objKey = removingObjectKey

    if (removeBtn) {
        removeBtn.disabled = true;
        removeBtn.style.opacity = 0.5;
    }

    showToast(3, "A tentar remover notícia.\nPor favor aguarde.")

    // A timer to re-enable the remove button
    var removeTimeleft = 29;
    var removeInterval = setInterval(function(){ 
        if(removeTimeleft <= 0){
            clearInterval(removeInterval);
            removeBtn.disabled = false;
            removeBtn.style.opacity = 1;
        } else {
            //removeBtn.innerHTML = submitTimeleft + " segundos";
        }
        removeTimeleft -= 1;
    }, 1000);

    const y = selectedYear;
    const m = selectedMonth;
    const d = currDay

    // send request to api
    fetchResponseWithTimeout(
        RENDER_API_URL, 
        `/api/delete/${y}/${m+1}/${d}/${objKey}`, 
        "DELETE",
        null
    )
    .then((data) => {
        showToast(2, `Notícia do dia ${y}/${m+1}/${d} removida com sucesso.`)
            
        clearInterval(removeInterval);
        removeBtn.disabled = false;
        removeBtn.style.opacity = 1;

        delete json[y][m+1][d][objKey]

        renderCalendar();
        renderNewsList();

        daysSelection = document.querySelectorAll(".days li");
        createDayWatchers(daysSelection)
    })
    .catch((render_error) => {
        // There was a timeout with this link, warn the user
        showToast(0, "Não foi possível remover a notícia.")

        clearInterval(removeInterval);
        removeBtn.disabled = false;
        removeBtn.style.opacity = 1;
    })
}

// Get the modal
var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
