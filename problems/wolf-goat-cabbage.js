problems.push({
    title: 'Wolf, goat, cabbage',
    start: {
        wolf: 0,
        goat: 0,
        cabb: 0,
        boat: 0,
    },
    finish: {
        wolf: 1,
        goat: 1,
        cabb: 1,
        boat: 1,
    },
    check(data) {
        if (
            (data.wolf == data.goat && data.boat !== data.wolf) ||
            (data.goat == data.cabb && data.boat !== data.goat)
        ) {
            return false;
        }
        return true;
    },
    getChildrenData(state) {
        let children = [];

        children.push({...state.data, boat: state.data.boat ? 0 : 1});
    
        for (let passenger of ['wolf', 'goat', 'cabb']) {
            if (state.data.boat === state.data[passenger]) {
                let child = {...state.data, boat: state.data.boat ? 0 : 1};
                child[passenger] = child.boat;
                children.push(child);
            }
        }
    
        return children;
    },
    customRender(state) {
        let style = state.valid ? 'good' : 'bad';
        let append = '';
        if (compare(state.data, this.start) || compare(state.data, this.finish)) {
            style = 'important';
            if (state.steps > 0) {
                append = '|' + state.steps + ' steps';
            }
        }
        modifier = `<${style}table id=${state.id}>`;
        leftside = (!state.data.wolf ? '🐺' : '')
            + (!state.data.goat ? '🐐' : '')
            + (!state.data.cabb ? '🥬' : '');
        rightside = (state.data.wolf ? '🐺' : '')
            + (state.data.goat ? '🐐' : '')
            + (state.data.cabb ? '🥬' : '');
        return '[' + modifier + Object.values(state.data).toString() + '|'
            + (leftside || '-') + '|' + (rightside || '-') + '||'
            + (state.data.boat ? '-|🚣' : '🚣|-')
            + append + ']';
    }
});