// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];

const daysTag = document.querySelector(".days");
const currentDate = document.querySelector(".current-year");
const description = document.querySelector(".calendar_description");

// getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth(),
currDay = date.getDate();

console.log(currDay)

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
    for (d_data of day_data) {
        const party = d_data['partido'];
        if (!parties.includes(party)) {
            parties.push(party)
            res += `<span class="dot" style="--tooltip-color: ${getPartyColor(party)};"></span>`
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
    for (d_data of day_data) {
        const party = d_data['partido'];
        res += '<li style="list-style-type: none;">'
        res += `<span class="dot" style="--tooltip-color: ${getPartyColor(party)};"></span>`
        res += `<span>${party.toUpperCase()}</span>`
        res += `<p>${d_data['noticia']}</p>`
        res += `<p><a href="${d_data['link']}">LINK</a></p>`
        res += '</li>\n'
    }
    return res;
}

/**
 * Render the calendar for a year and date
 */
const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive previous_month">${lastDateofLastMonth - i + 1}<br>`;
        // get previous month
        let m = currMonth - 1;
        let y = currYear;
        // if previous month is negative, means it looped to december
        // so, change month to december and one year before
        if (m < 0) {
            m = 11;
            y = currYear - 1;
        }
        liTag += getPolemsColors(y, m, lastDateofLastMonth - i + 1)
        liTag += '</li>'
    }

    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday = i === currDay ? "active" : "";
        liTag += `<li class="${isToday}">${i}<br>`;
        liTag += getPolemsColors(currYear, currMonth, i)
        liTag += `</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        //console.log(i, lastDayofMonth, i - lastDayofMonth + 1)
        liTag += `<li class="inactive next_month">${i - lastDayofMonth + 1}<br>`
        // get next month
        let m = currMonth + 1;
        let y = currYear;
        // if next month is bigger than 11, means it looped to january
        // so, change month to january and one year after
        if (m > 11) {
            m = 0;
            y = currYear + 1;
        }
        liTag += getPolemsColors(y, m, i - lastDayofMonth + 1)
        liTag += `</li>`
    }

    // Toggle active month
    var elems = document.querySelectorAll(".months .active");
    [].forEach.call(elems, function(el) {
        el.classList.remove("active");
    });
    monthMenu = document.querySelector(`#m${currMonth}`)
    monthMenu.className = "active";

    currentDate.innerText = `${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;

    // Change the description accordingly
    description.innerHTML = getDescriptions(currYear, currMonth, currDay);
}

/**
 * When the document is ready, start by fetching the json, then add html to the file
 */
$(document).ready(function () {
    fetch("./data.json")
        .then((res) => res.json())
        .then((data) => {
            json = data;

            renderCalendar();

            var prevNextIcon = document.querySelectorAll(".icons span"),
            monthsSelection = document.querySelectorAll(".months li"),
            daysSelection = document.querySelectorAll(".days li");

            prevNextIcon.forEach(icon => { // getting prev and next icons
                icon.addEventListener("click", () => { // adding click event on both icons
                    // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
                    currYear = icon.id === "prev" ? currYear - 1 : currYear + 1;
                    date = new Date(currYear, currMonth);
                    currYear = date.getFullYear(); // updating current year with new date year
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
                    date = new Date(currYear, currMonth);
                    renderCalendar(); // calling renderCalendar function
                    daysSelection = document.querySelectorAll(".days li");
                    createDayWatchers(daysSelection)
                });
            });

            createDayWatchers(daysSelection)
        })
})

const createDayWatchers = (daysSelection) => {
    daysSelection.forEach(day => {
        day.addEventListener("click", () => {
            currDay = parseInt( day.innerText.replace('\n', '') )
            const classes = day.classList
            
            let m = currMonth;
            let y = currYear;
            if (classes.contains('previous_month')) {
                m = m - 1;
                // if previous month is negative, means it looped to december
                // so, change month to december and one year before
                if (m < 0) {
                    m = 11;
                    y = currYear - 1;
                }
            }
            else if (classes.contains('next_month')) {
                m = m + 1;
                // if previous month is negative, means it looped to december
                // so, change month to december and one year before
                if (m > 11) {
                    m = 0;
                    y = currYear + 1;
                }
            }

            // Toggle active day
            var elems = document.querySelectorAll(".days .active");
            [].forEach.call(elems, function(el) {
                el.classList.remove("active");
            });
            day.className = "active";

            description.innerHTML = getDescriptions(y, m, currDay);
        });
    });
}

