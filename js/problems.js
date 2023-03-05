import * as helpers from './helpers.js';

export let problems = [
    {
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
            if (helpers.compare(state.data, this.start) || helpers.compare(state.data, this.finish)) {
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
    },
    {
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
        customRender(state) {
            let style = state.valid ? 'good' : 'bad';
            let append = '';
            if (state.valid && (helpers.compare(state.data, this.start) || helpers.compare(state.data, this.finish))) {
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
    },
    {
        title: 'Jumping frogs',
        input_vars: {
            left_frogs: 2,
            right_frogs: 2,
            max_jump_length: 2,
            empty_spaces: 1
        },
        get start() {
            return [
                ...Array(this.input_vars.left_frogs).fill(1),
                ...Array(this.input_vars.empty_spaces).fill(0),
                ...Array(this.input_vars.right_frogs).fill(-1),
            ];
        },
        get finish() {
            return [
                ...Array(this.input_vars.right_frogs).fill(-1),
                ...Array(this.input_vars.empty_spaces).fill(0),
                ...Array(this.input_vars.left_frogs).fill(1),
            ];
        },
        check(data) {
            return true;
        },
        getChildrenData(state) {
            let children = [];
        
            for (let index = 0; index < state.data.length; index++) {
                if (!state.data[index]) continue;
    
                for (let jump_length = 1; jump_length <= this.input_vars.max_jump_length; jump_length++) {
                    let dest = index + jump_length * state.data[index];
    
                    if (state.data[dest] !== undefined && !state.data[dest]) {
                        let child = [...state.data];
                        child[dest] = child[index];
                        child[index] = 0;
                        children.push(child)
                    }
                }
            }
        
            return children;
        },
        customRender(state) {
            let style = state.valid ? 'good' : 'bad';
            let append = '';
            if (state.valid && (helpers.compare(state.data, this.start) || helpers.compare(state.data, this.finish))) {
                style = 'important';
                if (state.steps > 0) {
                    append = '|' + state.steps + ' steps';
                }
            }
            modifier = `<${style}table id=${state.id}>`;
            return '[' + modifier + state.data.map(frog => (
                ({
                    1: '►',
                    0: '🞎',
                    '-1': '◄'
                })[frog]
            )).join('') + append + ']';
        }
    },
];