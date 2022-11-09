function create_tabbed_div(title, is_checked) {
    var innerHTML = ''

    innerHTML += '<input type="radio" id="tab_' + title + '" name="mytabs"'
    if (is_checked) {
        innerHTML += ' checked="checked">'
    }
    else {
        innerHTML += '>'
    }
    innerHTML += '<label for="tab_' + title + '">' + title + '</label>'
    

    return innerHTML
}

function create_tabbed_year_div(name, data) {
    var innerHTML = ''
    var year_divs_innerHTML = ''

    innerHTML += '<div class="tab">'

    innerHTML += '<div class="year_tab">'

    // Loop all years, create tab and create div for that year
    for (const [key_year, value_months] of Object.entries(data)) {
        innerHTML += '<button class="year_tablinks" onclick="openYear(event, \'' + name + '_' + key_year + '\')">' + key_year + '</button>'

        year_divs_innerHTML += '<div id="' + name + '_' + key_year + '" class="year_tabcontent">'
        
        for (const [key_month, value_days] of Object.entries(value_months)) {
            year_divs_innerHTML += '<h3>' + key_month + '</h3>'

            for (const [key_day, value_content] of Object.entries(value_days)) {
                year_divs_innerHTML += '<h4>' + key_day + '</h4>'

                for (var content of value_content) {
                    year_divs_innerHTML += content
                }
            }
        }
        year_divs_innerHTML += '</div>'
    }
    innerHTML += '</div>'

    innerHTML += year_divs_innerHTML

    innerHTML += '</div>'
    return innerHTML
}

$(document).ready(function () {
    fetch("./data.json")
        .then((res) => res.json())
        .then((data) => {
            var innerHTML = ''
            var count = 0
            for (const [key_name, value_data] of Object.entries(data)) {
                console.log(key_name, value_data);

                innerHTML += create_tabbed_div(key_name, count === 0)
                
                innerHTML += create_tabbed_year_div(key_name, value_data)

                
                

                count += 1
            }

            console.log(innerHTML)
            document.getElementById('placeholder').innerHTML = innerHTML
        });
});