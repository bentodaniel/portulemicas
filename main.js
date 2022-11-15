// DEV
//const BASE_API_URL = 'http://localhost:3000'
// PROD
const BASE_API_URL = 'https://portulemicas-api.onrender.com'

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

// getting new date, current year and month
let date = new Date(),
calendarCurrYear = date.getFullYear(),
currMonth = date.getMonth(),
currDay = date.getDate(),
newsListCurrYear = date.getFullYear();

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
        res += `<li style="list-style-type: none;" class="status_${status}">`
        res += `<span class="dot-span" style="--tooltip-color: ${getPartyColor(party)};"></span>`
        res += `<span>${party.toUpperCase()}</span>`
        res += `<span class="status_text">(${status ? "verificada" : "não verificada"})</span>`
        res += `<p>${d_data['title']}</p>`
        res += `<p class="link_noticia"><a href="${link}" target="_blank">LINK</a></p>`
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
                    liTag += `<li class="status_${obj['status']}">`
                    liTag += `<a href="${obj['url']}" target="_blank">`
                    liTag += `<img src="${obj['image']}" alt="Logo Image">`
                    liTag += `<div class="news-text-details">`
                    liTag += `<h2>${obj['title']}`
                    liTag += `<span class="status_text">(${obj['status'] ? "verificada" : "não verificada"})</span>`
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

/**
 * When the document is ready, start by fetching the json, then add html to the file
 */
$(document).ready(function () {
    // get json through the api
    // if we cant use the api, then use the local json
    fetch(`${BASE_API_URL}/api/all`, {
        method: 'GET',
        mode: 'cors',
        dataType : 'jsonp',
        headers: {
            'Content-Type': 'application/jsonp'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    .then((response) => {
        if (response.status === 200) {
            return response.json()
        }
        else {
            return fetch("./data.json").then((res) => res.json())
        }
    })
    .then((data) => {
        json = data
        execute()
    })
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
            alert("Por favor, preencha o partido a que a notícia está associada.");
            return;
        }
        if (!newsLink) {
            alert("Por favor, preencha o link da notícia.");
            return;
        }

        // send request to api
        fetch(`${BASE_API_URL}/api/create/${calendarCurrYear}/${currMonth+1}/${currDay}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
                "party" : partyName,
                "url" : newsLink
            })
        })
        .then((response) => {
            if (response.status === 201) {
                return response.json()
            }
            else {
                return null
            }
        })
        .then((data) => {
            if (!data) {
                // if error, inform the user
                alert("Não foi possível criar a notícia ou esta já existe.");
                return;
            }

            // add to local json the just-added element
            if (!json[calendarCurrYear]) {
                json[calendarCurrYear] = {}
            }
            if (!json[calendarCurrYear][currMonth+1]) {
                json[calendarCurrYear][currMonth+1] = {}
            }
            if (!json[calendarCurrYear][currMonth+1][currDay]) {
                json[calendarCurrYear][currMonth+1][currDay] = {}
            }

            json[calendarCurrYear][currMonth+1][currDay][data['key']] = data['data']

            renderCalendar();
            renderNewsList();
        })
        
        inputPartyName.value = '';
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
            
            let m = currMonth;
            let y = calendarCurrYear;
            if (classes.contains('previous-month')) {
                m = m - 1;
                // if previous month is negative, means it looped to december
                // so, change month to december and one year before
                if (m < 0) {
                    m = 11;
                    y = calendarCurrYear - 1;
                }
            }
            else if (classes.contains('next-month')) {
                m = m + 1;
                // if previous month is negative, means it looped to december
                // so, change month to december and one year before
                if (m > 11) {
                    m = 0;
                    y = calendarCurrYear + 1;
                }
            }

            // Toggle active day
            var elems = document.querySelectorAll(".days .selected");
            [].forEach.call(elems, function(el) {
                el.classList.remove("selected");
            });
            day.classList.add("selected");

            description.innerHTML = getDescriptions(y, m, currDay);
        });
    });
}
