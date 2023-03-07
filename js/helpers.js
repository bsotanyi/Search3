function _set(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}
function _get(name) {
    return JSON.parse(localStorage.getItem(name));
}

function qs(selector, parent_el = document) {
    return parent_el.querySelector(selector);
}

function qsa(selector, parent_el = document) {
    return [...parent_el.querySelectorAll(selector)];
}

function compare(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    for (let key in obj1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}