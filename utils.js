const utils = {};

function xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) {
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                let attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) {
        obj = xml.nodeValue;
    }

    const textNodes = [].slice.call(xml.childNodes).filter(function(node) {
        return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
        obj = [].slice.call(xml.childNodes).reduce(function(text, node) {
            return text + node.nodeValue;
        }, "");
    } else if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push == "undefined") {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}

function debounce(func, wait, immediate) {
    let timeout;
    return () => {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;

        clearTimeout(timeout);
                timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
    };
}

utils.xmlToJson = xmlToJson;
utils.debounce = debounce;
