export function qs(selector, parent_el = document) {
    return parent_el.querySelector(selector);
}

export function qsa(selector, parent_el = document) {
    return [...parent_el.querySelectorAll(selector)];
}

export function serializeForm(form) {
    var obj = {};
    var formData = new FormData(form);
    for (var key of formData.keys()) {
        obj[key] = formData.get(key);
    }
    return obj;
};

export function compare(obj1, obj2) {
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

export function newId() {
    return Math.random().toString(32).substr(2);
}