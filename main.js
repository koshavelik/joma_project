const imageLink = 'http://www.joma-sport.net/getProductImage.php?ProductCode=';
const apiUrl = 'https://gitu3ccmbk.execute-api.us-east-2.amazonaws.com/default/test2';
const apiKey = 'Ilb4sk22bq8TDrxxZ9FNL82MMQ2lqgLv6UuU3NgM';
const clients = {
    'sport-belarus@tut.by': '00000018',
    'k.baranovskiy@mail.ru': '007'
};

let products = {};
let selectedProducts = {};
let clientEmail = '';

$(() => {
    $('#fetch_data').on('click', () => { // Fetching xmnl file
        fetchData();
    });

    $('#search_field').on('keyup', utils.debounce(filterValues, 300));

    const toTopBtn = $('.top-button');

    $(window).on('scroll', () => {
        if ($(window).scrollTop() > 300) {
            toTopBtn.addClass('show');
        } else {
            toTopBtn.removeClass('show');
        }
    });

    toTopBtn.on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop:0}, '300');
    });
});

function countChange(id, $price) {
    return (event) => {
        const value = parseInt(event.target.value);
        const $target = $(event.target);

        if (value > products[id].ostatok || value < 1) {
            $target.addClass('is-invalid');
        } else {
            const totalPrice = value * products[id].price;

            selectedProducts[id] = value;
            $target.removeClass('is-invalid');
            $price.text(totalPrice);
        }

        setOrderPrice();
    }
}

function deleteButton(id, $product) {
    return () => {
        if (selectedProducts[id]) {
            delete selectedProducts[id];
        }

        if (!Object.keys(selectedProducts).length) {
            $('.complete-order').hide();
        }

        $product.remove();
        setOrderPrice();
    }
}

function addToCard(id) {
    return () => {
        if (selectedProducts[id]) {
            return;
        }

        selectedProducts[id] = 1;

        const productHtml = `<div class="card">
    <div class="card-header">
        <div>${products[id].name}</div>
        <button class="btn btn-link delete-button">
            <img src="delete.png" alt="delete">
        </button>
    </div>
    <div class="card-body">
        <div class="count">
            <label>
                <b>Count</b>
                <form class="needs-validation" novalidate>
                    <input
                            class="form-control choose-count"
                            type="number"
                            value="1"
                            min="1"
                            max="${products[id].ostatok}"
                    />
                </form>
            </label>
            <div class="invalid-feedback">
                Please provide a valid count.
            </div>
        </div>
        <div>=</div>
        <div class="">
            <b>Price</b>
            <div class="total-price">${products[id].price}</div>
        </div>
    </div>`;

        const $product = $(productHtml);
        const $cart = $('#cart');
        const $completeOrder = $('.complete-order');
        const $input = $product.find('.choose-count');
        const $price = $product.find('.total-price');
        const $deleteButton = $product.find('.delete-button');

        $input.on('change textInput input', countChange(id, $price));
        $deleteButton.on('click', deleteButton(id, $product));

        $cart.append($product);
        $completeOrder.show();
        setOrderPrice();
    }
}

function setOrderPrice() {
    const orderPrice = Object.keys(selectedProducts).reduce((sum, id) => {
        return sum + selectedProducts[id] * products[id].price;
    }, 0);

    $('.order-price').text(orderPrice);
}

function fetchData() {
    $.ajax({
        type: "GET",
        url: "./example.xml", //TODO exchange pass of .xml
        dataType: "xml",
    }).then(response => {
        const jsonData = utils.xmlToJson(response);

        jsonData['Catalog'].item.forEach((item) => {
            products[item.ean] = item;
        });

        displayData(products);
    }).catch(e => {
        alert("An error occurred while processing XML file");
        console.log("XML reading Failed: ", e);
    });
}

function displayData(filteredProducts) {
    const $table = $('.product-table-body');

    $table.empty();

    Object.keys(filteredProducts).forEach((key) => {
        const $button = $('<button class="btn btn-secondary">buy</button>');
        const $buttonTd = $('<td>');
        const $imageTd = $('<td>');

        $button.on('click', addToCard(filteredProducts[key].ean));
        $buttonTd.append($button);

        const $image = $(`<img class="row-image" src="${imageLink}${filteredProducts[key].art}">`);
        $imageTd.append($image);

        const $tr = $('<tr>').append(
            $imageTd,
            $('<td>').html(filteredProducts[key].name),
            $('<td>').text(filteredProducts[key].size),
            $('<td>').text(filteredProducts[key].art),
            $('<td>').text(filteredProducts[key].ostatok),
            $('<td>').text(filteredProducts[key].price),
            $buttonTd
        );

        $tr.attr('data-id', filteredProducts[key].id);

        $table.append($tr);
    });
}

function filterValues() {
    // Declare variables
    const $input = $('#search_field');
    const $tr = $('tbody tr');

    const filter = $input[0].value.toLowerCase();

    const filtered = Object.keys(products)
        .filter((key) => {
            return products[key].name.toLowerCase().includes(filter) || products[key].art.includes(filter);
        })
        .reduce((obj, key) => {
            obj[key] = products[key];

            return obj;
        }, {});

    displayData(filtered);
}

function sendOrder() {
    if (!validate()) {
        return false
    }

    const order = Object.keys(selectedProducts).map((key) => {
        return {
            'id': key,
            "count": selectedProducts[key]
        }
    });

    const request = {
        'id': clients[clientEmail],
        'email': clientEmail,
        order
    };

    $('#orderModal').modal('hide');

    $.ajax({
        type: "POST",
        url: apiUrl,
        crossDomain: true,
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(request),
    }).then(response => {
        products = {};
    }).catch(e => {
        console.log("Sending order Failed: ", e);
    });
}

function validate() {
    const $email = $('#email-field');
    const emailValue = $email.val();

    if (emailValue && clients[emailValue]) {
        $email.removeClass('is-invalid');
        clientEmail = emailValue;

        return true
    }

    $email.addClass('is-invalid');

    return false;
}
