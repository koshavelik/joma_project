let products = {};
let selectedProducts = {};

$(() => {
    $('#fetch_data').on('click', () => { // Fetching xmnl file
        fetchData();
    });

    $('#search_field').on('keyup', filterValues);
});

function countChange(id, $price) {
    return (event) => {
        const value = parseInt(event.target.value);
        const $target = $(event.target);

        if (value > products[id].ostatok || value < 1) {
            $target.addClass('is-invalid');
        } else {
            const totalPrice = value * products[id].price;

            selectedProducts[id] = totalPrice;
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

        displayData(jsonData);
        console.log({jsonData});
        jsonData['Catalog'].item.forEach((item) => {
            products[item.id] = item;
        });
    }).catch(e => {
        alert("An error occurred while processing XML file");
        console.log("XML reading Failed: ", e);
    });
}

function displayData(data) {
    const $table = $('.product-table-body');

    data['Catalog'].item.forEach((item) => {
        const $button = $('<button class="btn btn-secondary">buy</button>');
        const $buttonTd = $('<td>');

        $button.on('click', addToCard(item.id));
        $buttonTd.append($button);


        const $tr = $('<tr>').append(
            $('<td>').text(item.name),
            $('<td>').text(item.size),
            $('<td>').text(item.art),
            $('<td>').text(item.ostatok),
            $('<td>').text(item.price),
            $buttonTd
        );

        $tr.attr('data-id', item.id);

        $table.append($tr);
    });
}

function filterValues() {
    // Declare variables
    const $input = $('#search_field');
    const $tr = $('tbody tr');

    const filter = $input[0].value.toUpperCase();
    console.log(filter);

    $tr.each((index, $item) => {
        const itemName = $item.getElementsByTagName("td")[0]; //Fetching Name element of a table
        if (itemName) {
            const txtValue = itemName.textContent || itemName.innerText || itemName.innerHTML;

            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                $item.style.display = "";
            } else {
                $item.style.display = "none";
            }
        }
    });
}




