problems.push({
    title: 'Cannibals and priests',
    input_vars: {
        cannibals: 3,
        priests: 3,
        ship_capacity: 2,
    },
    get start() {
        return {
            cannibals_left: this.input_vars.cannibals,
            priests_left: this.input_vars.priests,
            cannibals_right: 0,
            priests_right: 0,
            boat: 0
        }
    },
    get finish() {
        return {
            cannibals_left: 0,
            priests_left: 0,
            cannibals_right: this.input_vars.cannibals,
            priests_right: this.input_vars.priests,
            boat: 1
        }
    },
    check(data) {
        if (
            (data.cannibals_right > data.priests_right && data.priests_right > 0) ||
            (data.cannibals_left > data.priests_left && data.priests_left > 0)
        ) {
            return false;
        }
        return true;
    },
    getChildrenData(state) {
        let children = [];
    
        let [c, p] = state.data.boat
            ? [state.data.cannibals_right, state.data.priests_right]
            : [state.data.cannibals_left, state.data.priests_left];
    
        let combinations = [];
        for (let i = 0; i <= c; i++) {
            for (let j = 0; j <= p; j++) {
                if (i + j > 0 && i + j <= this.input_vars.ship_capacity) {
                    combinations.push([i, j]);
                }
            }
        }
        
        for (item of combinations) {
            let child = {...state.data, boat: state.data.boat ? 0 : 1};
            if (state.data.boat) {
                child.cannibals_left += item[0];
                child.priests_left += item[1];
                child.cannibals_right -= item[0];
                child.priests_right -= item[1];
            } else {
                child.cannibals_right += item[0];
                child.priests_right += item[1];
                child.cannibals_left -= item[0];
                child.priests_left -= item[1];
            }
            children.push(child);
        }
    
        return children;
    },
    customEcho (state) {
        let style = state.valid ? 'good' : 'bad';
        let append = '';
        if (compare(state.data, this.start) || compare(state.data, this.finish)) {
            style = 'important';
            if (state.steps > 0) {
                append = '|' + state.steps + ' steps';
            }
        }
        modifier = `<${style}table id=${state.id}>`;
        return '[' + modifier + Object.values(state.data).toString() + '|'
            + ('👺'.repeat(state.data.cannibals_left) || '-') + '|' + ('👺'.repeat(state.data.cannibals_right) || '-') + '||'
            + ('👴'.repeat(state.data.priests_left) || '-') + '|' + ('👴'.repeat(state.data.priests_right) || '-') + '||'
            + (state.data.boat ? '-|⛵' : '⛵|-')
            + append + ']';
    }
});